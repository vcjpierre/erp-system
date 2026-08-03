import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventBus } from '../../events/event-bus';
import { WsGateway } from '../../websocket/ws.gateway';

@Injectable()
export class PurchasingService {
  private readonly approvalThreshold = 10000;

  constructor(
    private prisma: PrismaService,
    private readonly eventBus: EventBus,
    private readonly wsGateway: WsGateway,
  ) {}

  async createRequest(companyId: string, userId: string, dto: any) {
    const { lines, ...data } = dto;

    let seq = await this.prisma.documentSequence.findUnique({
      where: { companyId_documentType: { companyId, documentType: 'PURCHASE_ORDER' } },
    });
    if (!seq) {
      seq = await this.prisma.documentSequence.create({
        data: { companyId, documentType: 'PURCHASE_ORDER', prefix: 'PR-', nextNumber: 1, length: 8 },
      });
    }
    const number = `${seq.prefix}${String(seq.nextNumber).padStart(seq.length, '0')}`;

    let total = 0;
    const lineData = (lines || []).map((line: any, idx: number) => {
      const lineTotal = line.quantity * line.estimatedPrice;
      total += lineTotal;
      return {
        lineNumber: idx + 1,
        description: line.description,
        quantity: line.quantity,
        estimatedPrice: line.estimatedPrice,
        notes: line.notes,
        companyId,
      };
    });

    return this.prisma.$transaction(async (tx) => {
      const request = await tx.purchaseRequest.create({
        data: {
          ...data,
          number,
          status: 'DRAFT',
          companyId,
          requestedBy: userId,
          lines: { create: lineData },
        },
        include: { lines: true, requestedByUser: { select: { id: true, firstName: true, lastName: true } } },
      });

      await tx.documentSequence.update({
        where: { companyId_documentType: { companyId, documentType: 'PURCHASE_ORDER' } },
        data: { nextNumber: { increment: 1 } },
      });

      if (total > this.approvalThreshold || data.approverId) {
        await tx.approval.create({
          data: {
            entityType: 'PURCHASE_REQUEST',
            entityId: request.id,
            status: 'PENDING',
            companyId,
            requestedBy: userId,
            approverId: data.approverId || userId,
          },
        });
      }

      return request;
    }).then((request) => {
      this.eventBus.emit('purchasing.request.created', { companyId, requestId: request.id, total });
      this.wsGateway.emitToCompany(companyId, 'purchasing.request.created', { requestId: request.id, total });
      return request;
    });
  }

  async findAllRequests(companyId: string) {
    return this.prisma.purchaseRequest.findMany({
      where: { companyId },
      include: { lines: true, requestedByUser: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveRequest(companyId: string, userId: string, id: string) {
    const request = await this.prisma.purchaseRequest.findFirst({ where: { id, companyId } });
    if (!request) throw new NotFoundException('Purchase request not found');
    if (request.status !== 'PENDING') throw new BadRequestException('Request is not in PENDING status');

    const result = await this.prisma.purchaseRequest.update({
      where: { id },
      data: { status: 'APPROVED', approvedBy: userId },
    });

    this.eventBus.emit('purchasing.request.approved', { companyId, requestId: id, approvedBy: userId });
    this.wsGateway.emitToCompany(companyId, 'purchasing.request.approved', { requestId: id, approvedBy: userId });

    return result;
  }

  async createOrder(companyId: string, dto: any) {
    const { lines, ...data } = dto;

    let seq = await this.prisma.documentSequence.findUnique({
      where: { companyId_documentType: { companyId, documentType: 'PURCHASE_ORDER' } },
    });
    if (!seq) {
      seq = await this.prisma.documentSequence.create({
        data: { companyId, documentType: 'PURCHASE_ORDER', prefix: 'PO-', nextNumber: 1, length: 8 },
      });
    }
    const number = `${seq.prefix}${String(seq.nextNumber).padStart(seq.length, '0')}`;

    let subtotal = 0;
    const lineData = (lines || []).map((line: any, idx: number) => {
      const lineTotal = line.quantity * line.unitPrice;
      subtotal += lineTotal;
      return {
        lineNumber: idx + 1,
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        subtotal: lineTotal,
        companyId,
      };
    });

    const total = subtotal;

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.purchaseOrder.create({
        data: {
          ...data,
          number,
          issueDate: data.issueDate || new Date(),
          subtotal,
          taxTotal: 0,
          total,
          status: 'DRAFT',
          companyId,
          lines: { create: lineData },
        },
        include: { lines: true, supplier: true },
      });

      await tx.documentSequence.update({
        where: { companyId_documentType: { companyId, documentType: 'PURCHASE_ORDER' } },
        data: { nextNumber: { increment: 1 } },
      });

      if (data.purchaseRequestId) {
        await tx.purchaseRequest.update({
          where: { id: data.purchaseRequestId },
          data: { status: 'ORDERED' },
        });
      }

      return order;
    }).then((order) => {
      this.eventBus.emit('purchasing.order.created', { companyId, orderId: order.id, total });
      this.wsGateway.emitToCompany(companyId, 'purchasing.order.created', { orderId: order.id, total });
      return order;
    });
  }

  async findAllOrders(companyId: string) {
    return this.prisma.purchaseOrder.findMany({
      where: { companyId },
      include: { lines: true, supplier: true, purchaseRequest: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async receiveOrder(companyId: string, dto: any) {
    const { lines, ...data } = dto;

    const purchaseOrder = await this.prisma.purchaseOrder.findFirst({
      where: { id: data.purchaseOrderId, companyId },
      include: { lines: true },
    });
    if (!purchaseOrder) throw new NotFoundException('Purchase order not found');

    let seq = await this.prisma.documentSequence.findUnique({
      where: { companyId_documentType: { companyId, documentType: 'PURCHASE_ORDER' } },
    });
    if (!seq) {
      seq = await this.prisma.documentSequence.create({
        data: { companyId, documentType: 'PURCHASE_ORDER', prefix: 'RCV-', nextNumber: 1, length: 8 },
      });
    }
    const number = `${seq.prefix}${String(seq.nextNumber).padStart(seq.length, '0')}`;

    const lineData = (lines || []).map((line: any, idx: number) => ({
      lineNumber: idx + 1,
      description: line.description,
      quantity: line.quantity,
      companyId,
    }));

    return this.prisma.$transaction(async (tx) => {
      const receiving = await tx.receiving.create({
        data: {
          ...data,
          number,
          receivedDate: data.receivedDate || new Date(),
          status: 'COMPLETED',
          companyId,
          lines: { create: lineData },
        },
        include: { lines: true, purchaseOrder: true },
      });

      await tx.documentSequence.update({
        where: { companyId_documentType: { companyId, documentType: 'PURCHASE_ORDER' } },
        data: { nextNumber: { increment: 1 } },
      });

      const receivedQtyMap = new Map<string, number>();
      for (const line of lines || []) {
        const poLine = purchaseOrder.lines.find((l) => l.lineNumber === line.lineNumber);
        if (poLine) {
          const prev = receivedQtyMap.get(poLine.id) || 0;
          receivedQtyMap.set(poLine.id, prev + Number(line.quantity));
        }
      }

      for (const [poLineId, qty] of receivedQtyMap) {
        const poLine = purchaseOrder.lines.find((l) => l.id === poLineId);
        if (poLine) {
          const newReceived = Number(poLine.receivedQty) + qty;
          await tx.purchaseOrderLine.update({
            where: { id: poLineId },
            data: { receivedQty: newReceived },
          });
        }
      }

      const allLines = await tx.purchaseOrderLine.findMany({
        where: { purchaseOrderId: data.purchaseOrderId },
      });
      const allReceived = allLines.every((l) => Number(l.receivedQty) >= Number(l.quantity));
      if (allReceived) {
        await tx.purchaseOrder.update({
          where: { id: data.purchaseOrderId },
          data: { status: 'RECEIVED' },
        });
      } else {
        await tx.purchaseOrder.update({
          where: { id: data.purchaseOrderId },
          data: { status: 'PARTIAL' },
        });
      }

      return receiving;
    }).then((receiving) => {
      this.eventBus.emit('purchasing.received', { companyId, receivingId: receiving.id, purchaseOrderId: data.purchaseOrderId });
      this.wsGateway.emitToCompany(companyId, 'purchasing.received', { receivingId: receiving.id, purchaseOrderId: data.purchaseOrderId });
      return receiving;
    });
  }

  async submitRequest(companyId: string, userId: string, id: string) {
    const request = await this.prisma.purchaseRequest.findFirst({ where: { id, companyId } });
    if (!request) throw new NotFoundException('Purchase request not found');
    if (request.status !== 'DRAFT') throw new BadRequestException('Request is not in DRAFT status');

    const result = await this.prisma.purchaseRequest.update({
      where: { id },
      data: { status: 'PENDING' },
    });

    const existingApproval = await this.prisma.approval.findFirst({
      where: { entityType: 'PURCHASE_REQUEST', entityId: id, companyId },
    });
    if (!existingApproval) {
      await this.prisma.approval.create({
        data: {
          entityType: 'PURCHASE_REQUEST',
          entityId: id,
          status: 'PENDING',
          companyId,
          requestedBy: userId,
          approverId: userId,
        },
      });
    }

    this.eventBus.emit('purchasing.request.submitted', { companyId, requestId: id });
    this.wsGateway.emitToCompany(companyId, 'purchasing.request.submitted', { requestId: id });

    return result;
  }

  async requestApproval(companyId: string, userId: string, id: string, approverId: string) {
    const request = await this.prisma.purchaseRequest.findFirst({ where: { id, companyId } });
    if (!request) throw new NotFoundException('Purchase request not found');

    const approval = await this.prisma.approval.create({
      data: {
        entityType: 'PURCHASE_REQUEST',
        entityId: id,
        status: 'PENDING',
        companyId,
        requestedBy: userId,
        approverId,
      },
      include: {
        requestedByUser: { select: { id: true, firstName: true, lastName: true } },
        approver: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    this.eventBus.emit('purchasing.request.approval_requested', { companyId, requestId: id, approverId });
    this.wsGateway.emitToCompany(companyId, 'purchasing.request.approval_requested', { requestId: id, approverId });

    return approval;
  }

  async findAllReceivings(companyId: string) {
    return this.prisma.receiving.findMany({
      where: { companyId },
      include: { lines: true, purchaseOrder: { include: { supplier: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSupplierEvaluation(companyId: string, dto: any) {
    const totalScore = (dto.quality + dto.price + dto.delivery + dto.service) / 4;
    return this.prisma.supplierEvaluation.create({
      data: {
        quality: dto.quality,
        price: dto.price,
        delivery: dto.delivery,
        service: dto.service,
        totalScore,
        comments: dto.comments,
        companyId,
        supplierId: dto.supplierId,
      },
      include: { supplier: true },
    });
  }

  async findEvaluationsBySupplier(companyId: string, supplierId: string) {
    return this.prisma.supplierEvaluation.findMany({
      where: { companyId, supplierId },
      orderBy: { evaluatedAt: 'desc' },
    });
  }
}
