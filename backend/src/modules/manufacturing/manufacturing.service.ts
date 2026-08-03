import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ManufacturingService {
  constructor(private prisma: PrismaService) {}

  // ─── BOM ───

  async findAllBoms(companyId: string) {
    return this.prisma.billOfMaterial.findMany({
      where: { companyId, isActive: true },
      include: {
        product: true,
        _count: { select: { lines: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneBom(companyId: string, id: string) {
    const bom = await this.prisma.billOfMaterial.findFirst({
      where: { id, companyId },
      include: {
        product: true,
        lines: { include: { component: true } },
      },
    });
    if (!bom) throw new NotFoundException('BOM not found');
    return bom;
  }

  async createBom(companyId: string, dto: any) {
    const { lines, ...data } = dto;
    return this.prisma.billOfMaterial.create({
      data: {
        code: data.code,
        name: data.name,
        quantity: data.quantity,
        productId: data.productId,
        companyId,
        lines: {
          create: (lines || []).map((line: any) => ({
            componentId: line.componentId,
            quantity: line.quantity,
            wastePercent: line.wastePercent ?? 0,
            companyId,
          })),
        },
      },
      include: {
        product: true,
        lines: { include: { component: true } },
      },
    });
  }

  async updateBom(companyId: string, id: string, dto: any) {
    const existing = await this.prisma.billOfMaterial.findFirst({ where: { id, companyId } });
    if (!existing) throw new NotFoundException('BOM not found');
    delete dto.companyId;
    return this.prisma.billOfMaterial.update({
      where: { id },
      data: dto,
      include: {
        product: true,
        lines: { include: { component: true } },
      },
    });
  }

  async removeBom(companyId: string, id: string) {
    const existing = await this.prisma.billOfMaterial.findFirst({ where: { id, companyId } });
    if (!existing) throw new NotFoundException('BOM not found');
    return this.prisma.billOfMaterial.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ─── Work Centers ───

  async findAllWorkCenters(companyId: string) {
    return this.prisma.workCenter.findMany({
      where: { companyId, isActive: true },
      include: { operations: true },
      orderBy: { code: 'asc' },
    });
  }

  async findOneWorkCenter(companyId: string, id: string) {
    const wc = await this.prisma.workCenter.findFirst({
      where: { id, companyId },
      include: { operations: { orderBy: { sequence: 'asc' } } },
    });
    if (!wc) throw new NotFoundException('Work center not found');
    return wc;
  }

  async createWorkCenter(companyId: string, dto: any) {
    return this.prisma.workCenter.create({
      data: {
        code: dto.code,
        name: dto.name,
        description: dto.description,
        capacity: dto.capacity ?? 8,
        efficiency: dto.efficiency ?? 100,
        companyId,
      },
      include: { operations: true },
    });
  }

  async updateWorkCenter(companyId: string, id: string, dto: any) {
    const existing = await this.prisma.workCenter.findFirst({ where: { id, companyId } });
    if (!existing) throw new NotFoundException('Work center not found');
    delete dto.companyId;
    return this.prisma.workCenter.update({
      where: { id },
      data: dto,
      include: { operations: true },
    });
  }

  async removeWorkCenter(companyId: string, id: string) {
    const existing = await this.prisma.workCenter.findFirst({ where: { id, companyId } });
    if (!existing) throw new NotFoundException('Work center not found');
    return this.prisma.workCenter.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async addOperation(companyId: string, workCenterId: string, dto: any) {
    const wc = await this.prisma.workCenter.findFirst({ where: { id: workCenterId, companyId } });
    if (!wc) throw new NotFoundException('Work center not found');
    return this.prisma.workCenterOperation.create({
      data: {
        name: dto.name,
        setupTime: dto.setupTime ?? 0,
        runTime: dto.runTime ?? 0,
        sequence: dto.sequence ?? 0,
        workCenterId,
        companyId,
      },
    });
  }

  async removeOperation(companyId: string, workCenterId: string, opId: string) {
    const op = await this.prisma.workCenterOperation.findFirst({
      where: { id: opId, workCenterId, companyId },
    });
    if (!op) throw new NotFoundException('Operation not found');
    return this.prisma.workCenterOperation.delete({ where: { id: opId } });
  }

  // ─── Production Orders ───

  async findAllOrders(companyId: string) {
    return this.prisma.productionOrder.findMany({
      where: { companyId },
      include: {
        product: true,
        bom: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneOrder(companyId: string, id: string) {
    const order = await this.prisma.productionOrder.findFirst({
      where: { id, companyId },
      include: {
        product: true,
        bom: true,
        lines: { include: { product: true } },
      },
    });
    if (!order) throw new NotFoundException('Production order not found');
    return order;
  }

  async createOrder(companyId: string, dto: any) {
    const { explodeBom, ...data } = dto;

    const count = await this.prisma.productionOrder.count({ where: { companyId } });
    const number = `MO-${String(count + 1).padStart(6, '0')}`;

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.productionOrder.create({
        data: {
          ...data,
          number,
          quantity: data.quantity,
          status: 'PLANNED',
          productId: data.productId,
          bomId: data.bomId,
          companyId,
        },
      });

      if (data.bomId && explodeBom !== false) {
        const bomLines = await tx.billOfMaterialLine.findMany({
          where: { bomId: data.bomId },
        });

        if (bomLines.length > 0) {
          const qty = Number(data.quantity);
          await tx.productionOrderLine.createMany({
            data: bomLines.map((bl) => ({
              productionOrderId: order.id,
              productId: bl.componentId,
              quantity: Number(bl.quantity) * qty,
              companyId,
            })),
          });
        }
      }

      return tx.productionOrder.findFirst({
        where: { id: order.id },
        include: {
          product: true,
          bom: true,
          lines: { include: { product: true } },
        },
      });
    });
  }

  async updateOrder(companyId: string, id: string, dto: any) {
    const existing = await this.prisma.productionOrder.findFirst({ where: { id, companyId } });
    if (!existing) throw new NotFoundException('Production order not found');
    delete dto.companyId;
    delete dto.number;
    return this.prisma.productionOrder.update({
      where: { id },
      data: dto,
      include: {
        product: true,
        bom: true,
        lines: { include: { product: true } },
      },
    });
  }

  async removeOrder(companyId: string, id: string) {
    const existing = await this.prisma.productionOrder.findFirst({ where: { id, companyId } });
    if (!existing) throw new NotFoundException('Production order not found');
    return this.prisma.productionOrder.delete({ where: { id } });
  }

  async startOrder(companyId: string, id: string) {
    const order = await this.prisma.productionOrder.findFirst({ where: { id, companyId } });
    if (!order) throw new NotFoundException('Production order not found');
    if (order.status !== 'PLANNED' && order.status !== 'CONFIRMED') {
      throw new BadRequestException('Order cannot be started from current status');
    }
    return this.prisma.productionOrder.update({
      where: { id },
      data: { status: 'IN_PROGRESS', startDate: new Date() },
      include: {
        product: true,
        bom: true,
        lines: { include: { product: true } },
      },
    });
  }

  async completeOrder(companyId: string, id: string) {
    const order = await this.prisma.productionOrder.findFirst({
      where: { id, companyId },
      include: { product: { include: { inventories: true } } },
    });
    if (!order) throw new NotFoundException('Production order not found');
    if (order.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Order must be IN_PROGRESS to complete');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.productionOrder.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          producedQty: order.quantity,
          endDate: new Date(),
        },
      });

      const product = order.product;
      if (product.inventories.length > 0) {
        for (const inv of product.inventories) {
          await tx.inventory.update({
            where: { id: inv.id },
            data: { quantity: { increment: Number(order.quantity) } },
          });
        }
      }

      return updated;
    });
  }

  async cancelOrder(companyId: string, id: string) {
    const order = await this.prisma.productionOrder.findFirst({ where: { id, companyId } });
    if (!order) throw new NotFoundException('Production order not found');
    if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
      throw new BadRequestException('Order cannot be cancelled from current status');
    }
    return this.prisma.productionOrder.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        product: true,
        bom: true,
        lines: { include: { product: true } },
      },
    });
  }

  // ─── MRP ───

  async findAllRecommendations(companyId: string) {
    return this.prisma.mRPRecommendation.findMany({
      where: { companyId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async calculateMrp(companyId: string) {
    const products = await this.prisma.product.findMany({
      where: { companyId, isActive: true },
      include: { inventories: true },
    });

    const recommendations: any[] = [];

    for (const product of products) {
      const totalQty = product.inventories.reduce((sum, inv) => sum + Number(inv.quantity), 0);
      const minStock = product.inventories.length > 0
        ? Math.min(...product.inventories.map((inv) => Number(inv.minStock)))
        : 0;

      if (totalQty < minStock) {
        const needed = minStock - totalQty;

        const bom = await this.prisma.billOfMaterial.findFirst({
          where: { productId: product.id, companyId, isActive: true },
        });

        recommendations.push({
          productId: product.id,
          type: bom ? 'PRODUCE' : 'PURCHASE',
          quantity: needed,
          suggestedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: 'PENDING',
          companyId,
        });
      }
    }

    if (recommendations.length > 0) {
      await this.prisma.mRPRecommendation.createMany({ data: recommendations });
    }

    return { created: recommendations.length };
  }

  async executeRecommendation(companyId: string, id: string) {
    const rec = await this.prisma.mRPRecommendation.findFirst({ where: { id, companyId } });
    if (!rec) throw new NotFoundException('MRP recommendation not found');
    if (rec.status !== 'PENDING') throw new BadRequestException('Recommendation is not PENDING');
    return this.prisma.mRPRecommendation.update({
      where: { id },
      data: { status: 'EXECUTED', executedAt: new Date() },
      include: { product: true },
    });
  }

  async dismissRecommendation(companyId: string, id: string) {
    const rec = await this.prisma.mRPRecommendation.findFirst({ where: { id, companyId } });
    if (!rec) throw new NotFoundException('MRP recommendation not found');
    return this.prisma.mRPRecommendation.update({
      where: { id },
      data: { status: 'DISMISSED' },
      include: { product: true },
    });
  }
}
