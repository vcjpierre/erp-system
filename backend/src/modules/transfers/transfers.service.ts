import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TransfersService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.transferOrder.findMany({
      where: { companyId },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        lines: true,
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const transfer = await this.prisma.transferOrder.findFirst({
      where: { id, companyId },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        lines: true,
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!transfer) throw new NotFoundException('Transfer order not found');
    return transfer;
  }

  async create(companyId: string, data: any) {
    const { lines, ...rest } = data;
    return this.prisma.transferOrder.create({
      data: {
        ...rest,
        companyId,
        lines: { create: (lines || []).map((line: any, idx: number) => ({ ...line, lineNumber: idx + 1, companyId })) },
      },
      include: { lines: true, fromWarehouse: true, toWarehouse: true, createdBy: true },
    });
  }

  async update(companyId: string, id: string, data: any) {
    await this.findOne(companyId, id);
    const { lines, ...rest } = data;
    return this.prisma.transferOrder.update({
      where: { id },
      data: {
        ...rest,
        lines: lines
          ? { deleteMany: {}, create: lines.map((line: any, idx: number) => ({ ...line, lineNumber: idx + 1, companyId })) }
          : undefined,
      },
      include: { lines: true, fromWarehouse: true, toWarehouse: true },
    });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    return this.prisma.transferOrder.delete({ where: { id } });
  }

  async send(companyId: string, id: string) {
    const transfer = await this.findOne(companyId, id);
    if (transfer.status !== 'DRAFT' && transfer.status !== 'PENDING') {
      throw new NotFoundException('Transfer order cannot be sent');
    }

    return this.prisma.$transaction(async (tx) => {
      for (const line of transfer.lines) {
        await tx.inventoryTransaction.create({
          data: {
            movementType: 'TRANSFER_OUT',
            quantity: line.quantity,
            reference: transfer.number,
            referenceId: transfer.id,
            productId: (line as any).productId,
            warehouseId: transfer.fromWarehouseId,
            companyId,
          },
        });

        const inventory = await tx.inventory.findUnique({
          where: { productId_warehouseId: { productId: (line as any).productId, warehouseId: transfer.fromWarehouseId } },
        });
        if (inventory) {
          await tx.inventory.update({
            where: { id: inventory.id },
            data: {
              quantity: { decrement: line.quantity },
              availableQty: { decrement: line.quantity },
            },
          });
        }
      }

      return tx.transferOrder.update({
        where: { id },
        data: { status: 'IN_TRANSIT', transferredAt: new Date() },
        include: { lines: true, fromWarehouse: true, toWarehouse: true },
      });
    });
  }

  async receive(companyId: string, id: string) {
    const transfer = await this.findOne(companyId, id);
    if (transfer.status !== 'IN_TRANSIT') {
      throw new NotFoundException('Transfer order must be IN_TRANSIT to receive');
    }

    return this.prisma.$transaction(async (tx) => {
      for (const line of transfer.lines) {
        await tx.inventoryTransaction.create({
          data: {
            movementType: 'TRANSFER_IN',
            quantity: line.quantity,
            reference: transfer.number,
            referenceId: transfer.id,
            productId: (line as any).productId,
            warehouseId: transfer.toWarehouseId,
            companyId,
          },
        });

        const fromInventory = await tx.inventory.findUnique({
          where: { productId_warehouseId: { productId: (line as any).productId, warehouseId: transfer.fromWarehouseId } },
        });
        if (fromInventory) {
          await tx.inventory.update({
            where: { id: fromInventory.id },
            data: {
              quantity: { decrement: line.quantity },
              availableQty: { decrement: line.quantity },
            },
          });
        }

        const toInventory = await tx.inventory.findUnique({
          where: { productId_warehouseId: { productId: (line as any).productId, warehouseId: transfer.toWarehouseId } },
        });
        if (toInventory) {
          await tx.inventory.update({
            where: { id: toInventory.id },
            data: {
              quantity: { increment: line.quantity },
              availableQty: { increment: line.quantity },
            },
          });
        } else {
          await tx.inventory.create({
            data: {
              productId: (line as any).productId,
              warehouseId: transfer.toWarehouseId,
              quantity: line.quantity,
              availableQty: line.quantity,
              companyId,
            },
          });
        }
      }

      return tx.transferOrder.update({
        where: { id },
        data: { status: 'COMPLETED', receivedAt: new Date() },
        include: { lines: true, fromWarehouse: true, toWarehouse: true },
      });
    });
  }

  async cancel(companyId: string, id: string) {
    const transfer = await this.findOne(companyId, id);
    if (transfer.status === 'COMPLETED' || transfer.status === 'CANCELLED') {
      throw new NotFoundException('Transfer order cannot be cancelled');
    }
    return this.prisma.transferOrder.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { lines: true, fromWarehouse: true, toWarehouse: true },
    });
  }
}
