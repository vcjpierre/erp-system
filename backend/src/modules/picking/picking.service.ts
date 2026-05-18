import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PickingService {
  constructor(private prisma: PrismaService) {}

  async findAllPickOrders(companyId: string) {
    return this.prisma.pickOrder.findMany({
      where: { companyId },
      include: { lines: { include: { product: true } }, warehouse: true, assignedUser: { select: { id: true, firstName: true, lastName: true } }, createdBy: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOnePickOrder(companyId: string, id: string) {
    const order = await this.prisma.pickOrder.findFirst({
      where: { id, companyId },
      include: { lines: { include: { product: true, location: true, lot: true } }, warehouse: true, assignedUser: { select: { id: true, firstName: true, lastName: true } }, createdBy: { select: { id: true, firstName: true, lastName: true } } },
    });
    if (!order) throw new NotFoundException('Pick order not found');
    return order;
  }

  async createPickOrder(companyId: string, data: any) {
    const { lines, ...rest } = data;
    return this.prisma.pickOrder.create({
      data: {
        ...rest,
        status: rest.status || 'PENDING',
        companyId,
        lines: { create: (lines || []).map((line: any, idx: number) => ({ ...line, lineNumber: idx + 1, companyId })) },
      },
      include: { lines: true, warehouse: true },
    });
  }

  async updatePickOrder(companyId: string, id: string, data: any) {
    await this.findOnePickOrder(companyId, id);
    const { lines, ...rest } = data;
    return this.prisma.pickOrder.update({
      where: { id },
      data: {
        ...rest,
        lines: lines
          ? { deleteMany: {}, create: lines.map((line: any, idx: number) => ({ ...line, lineNumber: idx + 1, companyId })) }
          : undefined,
      },
      include: { lines: true, warehouse: true, assignedUser: true },
    });
  }

  async removePickOrder(companyId: string, id: string) {
    await this.findOnePickOrder(companyId, id);
    return this.prisma.pickOrder.delete({ where: { id } });
  }

  async pick(companyId: string, id: string) {
    const order = await this.findOnePickOrder(companyId, id);
    if (order.status !== 'PENDING' && order.status !== 'PICKING') {
      throw new NotFoundException('Pick order cannot be picked');
    }

    return this.prisma.$transaction(async (tx) => {
      for (const line of order.lines) {
        await tx.inventoryTransaction.create({
          data: {
            movementType: 'PICKING',
            quantity: line.quantity,
            reference: order.number,
            referenceId: order.id,
            productId: line.productId,
            warehouseId: order.warehouseId,
            locationId: line.locationId,
            lotId: line.lotId,
            companyId,
          },
        });

        const inventory = await tx.inventory.findUnique({
          where: { productId_warehouseId: { productId: line.productId, warehouseId: order.warehouseId } },
        });
        if (inventory) {
          await tx.inventory.update({
            where: { id: inventory.id },
            data: { availableQty: { decrement: line.quantity } },
          });
        }
      }

      return tx.pickOrder.update({
        where: { id },
        data: { status: 'PICKED', pickedAt: new Date() },
        include: { lines: true, warehouse: true, assignedUser: true },
      });
    });
  }

  async assign(companyId: string, id: string, userId: string) {
    await this.findOnePickOrder(companyId, id);
    return this.prisma.pickOrder.update({
      where: { id },
      data: { assignedTo: userId },
      include: { lines: true, warehouse: true, assignedUser: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async findAllPackOrders(companyId: string) {
    return this.prisma.packOrder.findMany({
      where: { companyId },
      include: { lines: { include: { product: true } }, pickOrder: true, createdBy: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOnePackOrder(companyId: string, id: string) {
    const order = await this.prisma.packOrder.findFirst({
      where: { id, companyId },
      include: { lines: { include: { product: true } }, pickOrder: true, createdBy: { select: { id: true, firstName: true, lastName: true } } },
    });
    if (!order) throw new NotFoundException('Pack order not found');
    return order;
  }

  async createPackOrder(companyId: string, data: any) {
    const { lines, ...rest } = data;
    return this.prisma.packOrder.create({
      data: {
        ...rest,
        status: rest.status || 'PENDING',
        companyId,
        lines: { create: (lines || []).map((line: any, idx: number) => ({ ...line, lineNumber: idx + 1, companyId })) },
      },
      include: { lines: true },
    });
  }

  async updatePackOrder(companyId: string, id: string, data: any) {
    await this.findOnePackOrder(companyId, id);
    const { lines, ...rest } = data;
    return this.prisma.packOrder.update({
      where: { id },
      data: {
        ...rest,
        lines: lines
          ? { deleteMany: {}, create: lines.map((line: any, idx: number) => ({ ...line, lineNumber: idx + 1, companyId })) }
          : undefined,
      },
      include: { lines: true },
    });
  }

  async removePackOrder(companyId: string, id: string) {
    await this.findOnePackOrder(companyId, id);
    return this.prisma.packOrder.delete({ where: { id } });
  }

  async packPackOrder(companyId: string, id: string) {
    const order = await this.findOnePackOrder(companyId, id);
    if (order.status !== 'PENDING' && order.status !== 'PACKING') {
      throw new NotFoundException('Pack order cannot be packed');
    }

    let warehouseId: string;
    if (order.pickOrderId) {
      const pickOrder = await this.prisma.pickOrder.findUnique({ where: { id: order.pickOrderId }, select: { warehouseId: true } });
      warehouseId = pickOrder!.warehouseId;
    } else {
      const inv = await this.prisma.inventory.findFirst({ where: { companyId, productId: order.lines[0]?.productId } });
      warehouseId = inv!.warehouseId;
    }

    return this.prisma.$transaction(async (tx) => {
      for (const line of order.lines) {
        await tx.inventoryTransaction.create({
          data: {
            movementType: 'PACKING',
            quantity: line.quantity,
            reference: order.number,
            referenceId: order.id,
            productId: line.productId,
            warehouseId,
            companyId,
          },
        });
      }

      return tx.packOrder.update({
        where: { id },
        data: { status: 'PACKED', packedAt: new Date() },
        include: { lines: true },
      });
    });
  }

  async findAllDispatchOrders(companyId: string) {
    return this.prisma.dispatchOrder.findMany({
      where: { companyId },
      include: { lines: { include: { product: true } }, packOrder: true, createdBy: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneDispatchOrder(companyId: string, id: string) {
    const order = await this.prisma.dispatchOrder.findFirst({
      where: { id, companyId },
      include: { lines: { include: { product: true } }, packOrder: true, createdBy: { select: { id: true, firstName: true, lastName: true } } },
    });
    if (!order) throw new NotFoundException('Dispatch order not found');
    return order;
  }

  async createDispatchOrder(companyId: string, data: any) {
    const { lines, ...rest } = data;
    return this.prisma.dispatchOrder.create({
      data: {
        ...rest,
        status: rest.status || 'PENDING',
        companyId,
        lines: { create: (lines || []).map((line: any, idx: number) => ({ ...line, lineNumber: idx + 1, companyId })) },
      },
      include: { lines: true },
    });
  }

  async updateDispatchOrder(companyId: string, id: string, data: any) {
    await this.findOneDispatchOrder(companyId, id);
    const { lines, ...rest } = data;
    return this.prisma.dispatchOrder.update({
      where: { id },
      data: {
        ...rest,
        lines: lines
          ? { deleteMany: {}, create: lines.map((line: any, idx: number) => ({ ...line, lineNumber: idx + 1, companyId })) }
          : undefined,
      },
      include: { lines: true },
    });
  }

  async removeDispatchOrder(companyId: string, id: string) {
    await this.findOneDispatchOrder(companyId, id);
    return this.prisma.dispatchOrder.delete({ where: { id } });
  }

  async dispatch(companyId: string, id: string) {
    const order = await this.findOneDispatchOrder(companyId, id);
    if (order.status !== 'PENDING') {
      throw new NotFoundException('Dispatch order cannot be dispatched');
    }

    return this.prisma.$transaction(async (tx) => {
      for (const line of order.lines) {
        const inv = await tx.inventory.findFirst({
          where: { productId: line.productId, companyId },
        });
        const warehouseId = inv?.warehouseId || '';

        await tx.inventoryTransaction.create({
          data: {
            movementType: 'DISPATCH',
            quantity: line.quantity,
            reference: order.number,
            referenceId: order.id,
            productId: line.productId,
            warehouseId,
            companyId,
          },
        });

        const inventories = await tx.inventory.findMany({
          where: { productId: line.productId, companyId },
        });
        for (const inventory of inventories) {
          const qty = Number(line.quantity);
          const reserved = Number(inventory.reservedQty);
          const dec = qty < reserved ? qty : reserved;
          await tx.inventory.update({
            where: { id: inventory.id },
            data: {
              quantity: { decrement: line.quantity },
              reservedQty: { decrement: dec },
            },
          });
        }
      }

      return tx.dispatchOrder.update({
        where: { id },
        data: { status: 'DISPATCHED', dispatchedAt: new Date() },
        include: { lines: true },
      });
    });
  }

  async deliver(companyId: string, id: string) {
    const order = await this.findOneDispatchOrder(companyId, id);
    if (order.status !== 'DISPATCHED') {
      throw new NotFoundException('Dispatch order must be DISPATCHED to deliver');
    }
    return this.prisma.dispatchOrder.update({
      where: { id },
      data: { status: 'DELIVERED', deliveredAt: new Date() },
      include: { lines: true },
    });
  }
}
