import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventBus } from '../../events/event-bus';
import { WsGateway } from '../../websocket/ws.gateway';

@Injectable()
export class PosService {
  constructor(
    private prisma: PrismaService,
    private eventBus: EventBus,
    private wsGateway: WsGateway,
  ) {}

  async openSession(companyId: string, userId: string, dto: any) {
    const openSession = await this.prisma.posSession.findFirst({
      where: { companyId, status: 'OPEN' },
    });
    if (openSession) throw new BadRequestException('An open session already exists');

    return this.prisma.posSession.create({
      data: {
        openingDate: new Date(),
        initialCash: dto.initialCash,
        status: 'OPEN',
        companyId,
        openedBy: userId,
      },
    });
  }

  async closeSession(companyId: string, userId: string, id: string, dto: any) {
    const session = await this.prisma.posSession.findFirst({ where: { id, companyId } });
    if (!session) throw new NotFoundException('POS session not found');
    if (session.status !== 'OPEN') throw new BadRequestException('Session is not open');

    return this.prisma.posSession.update({
      where: { id },
      data: {
        closingDate: new Date(),
        finalCash: dto.finalCash,
        totalSales: dto.totalSales,
        status: 'CLOSED',
        closedBy: userId,
        notes: dto.notes,
      },
      include: { movements: true },
    });
  }

  async findAllSessions(companyId: string) {
    return this.prisma.posSession.findMany({
      where: { companyId },
      include: { openedByUser: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { openingDate: 'desc' },
    });
  }

  async findSession(companyId: string, id: string) {
    const session = await this.prisma.posSession.findFirst({
      where: { id, companyId },
      include: {
        movements: { orderBy: { createdAt: 'desc' } },
        openedByUser: { select: { id: true, firstName: true, lastName: true } },
        closedByUser: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!session) throw new NotFoundException('POS session not found');
    return session;
  }

  async addMovement(companyId: string, id: string, dto: any) {
    const session = await this.prisma.posSession.findFirst({ where: { id, companyId } });
    if (!session) throw new NotFoundException('POS session not found');
    if (session.status !== 'OPEN') throw new BadRequestException('Session is not open');

    return this.prisma.posMovement.create({
      data: {
        type: dto.type,
        amount: dto.amount,
        reference: dto.reference,
        description: dto.description,
        sessionId: id,
        companyId,
        paymentId: dto.paymentId,
      },
    });
  }

  private async nextReceiptNumber(companyId: string): Promise<string> {
    const today = new Date();
    const yymmdd = today.toISOString().slice(2, 10).replace(/-/g, '');
    const prefix = `RCP-${yymmdd}-`;
    const last = await this.prisma.invoice.findFirst({
      where: { companyId, documentNumber: { startsWith: prefix } },
      orderBy: { documentNumber: 'desc' },
      select: { documentNumber: true },
    });
    let seq = 1;
    if (last) {
      const parts = last.documentNumber.split('-');
      seq = parseInt(parts[parts.length - 1], 10) + 1;
    }
    return `${prefix}${String(seq).padStart(5, '0')}`;
  }

  async createSale(companyId: string, dto: any, userId: string) {
    const { customerId, items, payments } = dto;
    if (!items?.length) throw new BadRequestException('Items are required');
    if (!payments?.length) throw new BadRequestException('At least one payment is required');

    const openSession = await this.prisma.posSession.findFirst({
      where: { companyId, status: 'OPEN' },
    });
    if (!openSession) throw new BadRequestException('No open POS session');

    const lineSubtotal = items.reduce(
      (sum: number, item: any) => sum + Number(item.quantity) * Number(item.unitPrice),
      0,
    );
    const lineDiscount = items.reduce(
      (sum: number, item: any) => sum + Number(item.discount || 0),
      0,
    );
    const subtotal = lineSubtotal - lineDiscount;
    const total = subtotal;
    const paidAmount = payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
    const balance = total - paidAmount;
    const paymentStatus = balance <= 0 ? 'COMPLETED' : 'PARTIAL';

    const documentNumber = await this.nextReceiptNumber(companyId);

    const invoice = await this.prisma.invoice.create({
      data: {
        documentNumber,
        documentType: 'RECEIPT',
        issueDate: new Date(),
        dueDate: new Date(),
        currencyCode: 'MXN',
        exchangeRate: 1,
        subtotal,
        discountTotal: lineDiscount,
        taxTotal: 0,
        total,
        paidAmount,
        balance: balance < 0 ? 0 : balance,
        status: 'POSTED',
        paymentStatus,
        companyId,
        customerId: customerId || null,
        lines: {
          create: items.map((item: any, idx: number) => ({
            lineNumber: idx + 1,
            description: item.description || '',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            subtotal: Number(item.quantity) * Number(item.unitPrice) - Number(item.discount || 0),
            companyId,
          })),
        },
        payments: {
          create: payments.map((p: any) => ({
            paymentNumber: `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
            amount: p.amount,
            paymentDate: new Date(),
            paymentMethod: p.method,
            companyId,
            customerId: customerId || null,
          })),
        },
      },
      include: { lines: true, payments: true, customer: true },
    });

    const movements = [];
    for (const payment of invoice.payments) {
      const movement = await this.prisma.posMovement.create({
        data: {
          type: 'SALE',
          amount: payment.amount,
          reference: invoice.documentNumber,
          description: `Venta POS - ${invoice.documentNumber}`,
          sessionId: openSession.id,
          companyId,
          paymentId: payment.id,
        },
      });
      movements.push(movement);
    }

    await this.prisma.posSession.update({
      where: { id: openSession.id },
      data: { totalSales: { increment: total } },
    });

    this.eventBus.emit('pos.sale.created', { invoiceId: invoice.id, documentNumber, total }, { companyId, userId });
    this.wsGateway.emitToCompany(companyId, 'pos.sale.created', invoice);

    return { ...invoice, movements };
  }

  async findAllSales(companyId: string) {
    return this.prisma.invoice.findMany({
      where: { companyId, documentType: 'RECEIPT' },
      include: {
        lines: true,
        payments: true,
        customer: { select: { id: true, legalName: true, tradeName: true } },
      },
      orderBy: { issueDate: 'desc' },
      take: 100,
    });
  }

  async findOneSale(companyId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId, documentType: 'RECEIPT' },
      include: {
        lines: true,
        payments: true,
        customer: { select: { id: true, legalName: true, tradeName: true } },
      },
    });
    if (!invoice) throw new NotFoundException('POS sale not found');
    return invoice;
  }

  async getTodaySales(companyId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const invoices = await this.prisma.invoice.findMany({
      where: {
        companyId,
        documentType: 'RECEIPT',
        issueDate: { gte: startOfDay, lte: endOfDay },
      },
      include: { payments: true },
    });

    const total = invoices.reduce((sum, inv) => sum + Number(inv.total), 0);
    const byMethod: Record<string, number> = {};

    for (const inv of invoices) {
      for (const payment of inv.payments) {
        const method = payment.paymentMethod;
        byMethod[method] = (byMethod[method] || 0) + Number(payment.amount);
      }
    }

    return {
      date: startOfDay.toISOString().slice(0, 10),
      total,
      count: invoices.length,
      byPaymentMethod: byMethod,
    };
  }

  async cashCount(companyId: string, sessionId: string, dto: any) {
    const session = await this.prisma.posSession.findFirst({ where: { id: sessionId, companyId } });
    if (!session) throw new NotFoundException('POS session not found');

    const { countedCash, countedCard, countedOther, notes } = dto;

    await this.prisma.posMovement.create({
      data: {
        type: 'CASH_COUNT',
        amount: countedCash || 0,
        reference: 'CASH_COUNT',
        description: notes || 'Conteo de efectivo',
        sessionId,
        companyId,
      },
    });

    if (countedCard) {
      await this.prisma.posMovement.create({
        data: {
          type: 'CASH_COUNT',
          amount: countedCard,
          reference: 'CARD_COUNT',
          description: 'Conteo de tarjeta',
          sessionId,
          companyId,
        },
      });
    }

    if (countedOther) {
      await this.prisma.posMovement.create({
        data: {
          type: 'CASH_COUNT',
          amount: countedOther,
          reference: 'OTHER_COUNT',
          description: 'Conteo de otros',
          sessionId,
          companyId,
        },
      });
    }

    return this.prisma.posSession.update({
      where: { id: sessionId },
      data: { notes: notes || session.notes },
      include: { movements: { orderBy: { createdAt: 'desc' } } },
    });
  }
}
