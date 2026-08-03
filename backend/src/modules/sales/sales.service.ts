import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventBus } from '../../events/event-bus';
import { WsGateway } from '../../websocket/ws.gateway';

@Injectable()
export class SalesService {
  private readonly approvalThreshold = 10000;

  constructor(
    private prisma: PrismaService,
    private readonly eventBus: EventBus,
    private readonly wsGateway: WsGateway,
  ) {}

  async createQuote(companyId: string, userId: string, dto: any) {
    const { lines, taxes, ...data } = dto;

    let seq = await this.prisma.documentSequence.findUnique({
      where: { companyId_documentType: { companyId, documentType: 'SALES_ORDER' } },
    });
    if (!seq) {
      seq = await this.prisma.documentSequence.create({
        data: { companyId, documentType: 'SALES_ORDER', prefix: 'QTE-', nextNumber: 1, length: 8 },
      });
    }
    const number = `${seq.prefix}${String(seq.nextNumber).padStart(seq.length, '0')}`;

    let subtotal = 0;
    let discountTotal = 0;
    const lineData = (lines || []).map((line: any, idx: number) => {
      const lineTotal = line.quantity * line.unitPrice;
      const lineDiscount = lineTotal * (line.discount || 0) / 100;
      const lineNet = lineTotal - lineDiscount;
      subtotal += lineNet;
      discountTotal += lineDiscount;
      return {
        lineNumber: idx + 1,
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        discount: line.discount || 0,
        subtotal: lineNet,
        companyId,
      };
    });

    let taxTotal = 0;
    const taxData: any[] = [];
    for (const t of taxes || []) {
      const tax = await this.prisma.tax.findFirst({ where: { id: t.taxId, companyId } });
      if (!tax) throw new NotFoundException(`Tax ${t.taxId} not found`);
      const amount = subtotal * Number(tax.rate) / 100;
      taxTotal += amount;
      taxData.push({
        name: tax.name,
        rate: tax.rate,
        base: subtotal,
        amount,
        taxId: tax.id,
        companyId,
      });
    }

    const total = subtotal + taxTotal;

    return this.prisma.$transaction(async (tx) => {
      const quote = await tx.quote.create({
        data: {
          ...data,
          number,
          issueDate: data.issueDate || new Date(),
          subtotal,
          discountTotal,
          taxTotal,
          total,
          status: 'DRAFT',
          companyId,
          lines: { create: lineData },
          taxes: { create: taxData },
        },
        include: { lines: true, taxes: { include: { tax: true } } },
      });

      await tx.documentSequence.update({
        where: { companyId_documentType: { companyId, documentType: 'SALES_ORDER' } },
        data: { nextNumber: { increment: 1 } },
      });

      return quote;
    }).then((quote) => {
      this.eventBus.emit('sales.quote.created', { companyId, quoteId: quote.id, total: quote.total });
      this.wsGateway.emitToCompany(companyId, 'sales.quote.created', { quoteId: quote.id, total: quote.total });
      return quote;
    });
  }

  async findAllQuotes(companyId: string) {
    return this.prisma.quote.findMany({
      where: { companyId },
      include: { lines: true, customer: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findQuote(companyId: string, id: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { id, companyId },
      include: { lines: { orderBy: { lineNumber: 'asc' } }, taxes: { include: { tax: true } }, customer: true },
    });
    if (!quote) throw new NotFoundException('Quote not found');
    return quote;
  }

  async convertQuoteToInvoice(companyId: string, userId: string, id: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { id, companyId },
      include: { lines: true, taxes: true },
    });
    if (!quote) throw new NotFoundException('Quote not found');
    if (quote.convertedToInvoiceId) throw new NotFoundException('Quote already converted');

    let seq = await this.prisma.documentSequence.findUnique({
      where: { companyId_documentType: { companyId, documentType: 'INVOICE' } },
    });
    if (!seq) {
      seq = await this.prisma.documentSequence.create({
        data: { companyId, documentType: 'INVOICE', prefix: 'INV-', nextNumber: 1, length: 8 },
      });
    }
    const docNumber = `${seq.prefix}${String(seq.nextNumber).padStart(seq.length, '0')}`;

    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          documentNumber: docNumber,
          documentType: 'INVOICE',
          issueDate: new Date(),
          currencyCode: 'MXN',
          exchangeRate: 1,
          subtotal: quote.subtotal,
          discountTotal: quote.discountTotal,
          taxTotal: quote.taxTotal,
          total: quote.total,
          paidAmount: 0,
          balance: quote.total,
          status: 'DRAFT',
          paymentStatus: 'PENDING',
          companyId,
          customerId: quote.customerId,
          lines: {
            create: quote.lines.map((l) => ({
              lineNumber: l.lineNumber,
              description: l.description,
              quantity: l.quantity,
              unitPrice: l.unitPrice,
              discount: l.discount,
              subtotal: l.subtotal,
              companyId,
            })),
          },
          taxes: {
            create: quote.taxes.map((t) => ({
              name: t.name,
              rate: t.rate,
              base: t.base,
              amount: t.amount,
              taxId: t.taxId,
              companyId,
            })),
          },
        },
        include: { lines: true },
      });

      await tx.quote.update({ where: { id }, data: { convertedToInvoiceId: invoice.id, status: 'APPROVED' } });

      await tx.documentSequence.update({
        where: { companyId_documentType: { companyId, documentType: 'INVOICE' } },
        data: { nextNumber: { increment: 1 } },
      });

      return invoice;
    }).then((invoice) => {
      this.eventBus.emit('sales.quote.converted', { companyId, quoteId: id, invoiceId: invoice.id, total: invoice.total });
      this.wsGateway.emitToCompany(companyId, 'sales.quote.converted', { quoteId: id, invoiceId: invoice.id, total: invoice.total });

      if (Number(invoice.total) > this.approvalThreshold) {
        this.prisma.approval.create({
          data: {
            entityType: 'INVOICE',
            entityId: invoice.id,
            status: 'PENDING',
            companyId,
            requestedBy: userId,
            approverId: userId,
          },
        }).catch(() => {});
      }

      return invoice;
    });
  }

  async createSalesOrder(companyId: string, dto: any) {
    const { lines, ...data } = dto;

    let seq = await this.prisma.documentSequence.findUnique({
      where: { companyId_documentType: { companyId, documentType: 'SALES_ORDER' } },
    });
    if (!seq) {
      seq = await this.prisma.documentSequence.create({
        data: { companyId, documentType: 'SALES_ORDER', prefix: 'SO-', nextNumber: 1, length: 8 },
      });
    }
    const number = `${seq.prefix}${String(seq.nextNumber).padStart(seq.length, '0')}`;

    let subtotal = 0;
    let discountTotal = 0;
    const lineData = (lines || []).map((line: any, idx: number) => {
      const lineTotal = line.quantity * line.unitPrice;
      const lineDiscount = lineTotal * (line.discount || 0) / 100;
      const lineNet = lineTotal - lineDiscount;
      subtotal += lineNet;
      discountTotal += lineDiscount;
      return {
        lineNumber: idx + 1,
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        discount: line.discount || 0,
        subtotal: lineNet,
        companyId,
      };
    });

    const total = subtotal + discountTotal;

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.salesOrder.create({
        data: {
          ...data,
          number,
          issueDate: data.issueDate || new Date(),
          subtotal,
          discountTotal,
          taxTotal: 0,
          total,
          status: 'DRAFT',
          companyId,
          lines: { create: lineData },
        },
        include: { lines: true, customer: true },
      });

      await tx.documentSequence.update({
        where: { companyId_documentType: { companyId, documentType: 'SALES_ORDER' } },
        data: { nextNumber: { increment: 1 } },
      });

      return order;
    }).then((order) => {
      this.eventBus.emit('sales.order.created', { companyId, orderId: order.id, total: order.total });
      this.wsGateway.emitToCompany(companyId, 'sales.order.created', { orderId: order.id, total: order.total });
      return order;
    });
  }

  async findAllSalesOrders(companyId: string) {
    return this.prisma.salesOrder.findMany({
      where: { companyId },
      include: { lines: true, customer: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findSalesOrder(companyId: string, id: string) {
    const order = await this.prisma.salesOrder.findFirst({
      where: { id, companyId },
      include: { lines: { orderBy: { lineNumber: 'asc' } }, customer: true },
    });
    if (!order) throw new NotFoundException('Sales order not found');
    return order;
  }

  async createSalesTarget(companyId: string, dto: any) {
    return this.prisma.salesTarget.create({
      data: { ...dto, companyId },
    });
  }

  async findAllSalesTargets(companyId: string) {
    return this.prisma.salesTarget.findMany({
      where: { companyId },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async createCommission(companyId: string, dto: any) {
    return this.prisma.commission.create({
      data: { ...dto, companyId },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async findAllCommissions(companyId: string) {
    return this.prisma.commission.findMany({
      where: { companyId },
      include: { user: { select: { id: true, firstName: true, lastName: true } }, invoice: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSubscription(companyId: string, dto: any) {
    const { lines, ...data } = dto;

    let seq = await this.prisma.documentSequence.findUnique({
      where: { companyId_documentType: { companyId, documentType: 'SALES_ORDER' } },
    });
    if (!seq) {
      seq = await this.prisma.documentSequence.create({
        data: { companyId, documentType: 'SALES_ORDER', prefix: 'SUB-', nextNumber: 1, length: 8 },
      });
    }
    const number = `${seq.prefix}${String(seq.nextNumber).padStart(seq.length, '0')}`;

    const lineData = (lines || []).map((line: any, idx: number) => ({
      description: line.description,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      companyId,
    }));

    const totalAmount = lineData.reduce((sum: number, l: any) => sum + l.quantity * l.unitPrice, 0);

    return this.prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.create({
        data: {
          ...data,
          number,
          totalAmount,
          companyId,
          lines: { create: lineData },
        },
        include: { lines: true, customer: true },
      });

      await tx.documentSequence.update({
        where: { companyId_documentType: { companyId, documentType: 'SALES_ORDER' } },
        data: { nextNumber: { increment: 1 } },
      });

      return subscription;
    }).then((subscription) => {
      this.eventBus.emit('sales.subscription.created', { companyId, subscriptionId: subscription.id, totalAmount: subscription.totalAmount });
      this.wsGateway.emitToCompany(companyId, 'sales.subscription.created', { subscriptionId: subscription.id, totalAmount: subscription.totalAmount });
      return subscription;
    });
  }

  async findAllSubscriptions(companyId: string) {
    return this.prisma.subscription.findMany({
      where: { companyId },
      include: { lines: true, customer: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
