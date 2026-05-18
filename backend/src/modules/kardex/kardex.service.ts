import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class KardexService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query?: any) {
    const where: any = { companyId };
    if (query?.productId) where.productId = query.productId;
    if (query?.warehouseId) where.warehouseId = query.warehouseId;
    if (query?.movementType) where.movementType = query.movementType;
    if (query?.startDate || query?.endDate) {
      where.movedAt = {};
      if (query.startDate) where.movedAt.gte = new Date(query.startDate);
      if (query.endDate) where.movedAt.lte = new Date(query.endDate);
    }
    return this.prisma.inventoryTransaction.findMany({
      where,
      include: { product: true, warehouse: true, location: true, lot: true },
      orderBy: { movedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.inventoryTransaction.findFirst({
      where: { id },
      include: { product: true, warehouse: true, location: true, lot: true },
    });
    if (!record) throw new NotFoundException('Transaction not found');
    return record;
  }

  async findByProduct(companyId: string, productId: string) {
    return this.prisma.inventoryTransaction.findMany({
      where: { companyId, productId },
      include: { product: true, warehouse: true, location: true, lot: true },
      orderBy: { movedAt: 'desc' },
    });
  }

  async findByWarehouse(companyId: string, warehouseId: string) {
    return this.prisma.inventoryTransaction.findMany({
      where: { companyId, warehouseId },
      include: { product: true, warehouse: true, location: true, lot: true },
      orderBy: { movedAt: 'desc' },
    });
  }

  async findByLot(companyId: string, lotId: string) {
    return this.prisma.inventoryTransaction.findMany({
      where: { companyId, lotId },
      include: { product: true, warehouse: true, location: true, lot: true },
      orderBy: { movedAt: 'desc' },
    });
  }

  async create(companyId: string, data: any) {
    return this.prisma.inventoryTransaction.create({
      data: {
        movementType: data.movementType,
        quantity: data.quantity || 0,
        unitCost: data.unitCost || 0,
        totalCost: data.totalCost || 0,
        reference: data.reference,
        referenceId: data.referenceId,
        notes: data.notes,
        movedAt: data.movedAt ? new Date(data.movedAt) : undefined,
        productId: data.productId,
        warehouseId: data.warehouseId,
        locationId: data.locationId,
        lotId: data.lotId,
        companyId,
      },
      include: { product: true, warehouse: true, location: true, lot: true },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.inventoryTransaction.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Transaction not found');
    return this.prisma.inventoryTransaction.delete({ where: { id } });
  }

  async findAllLots(companyId: string, productId?: string) {
    const where: any = { companyId };
    if (productId) where.productId = productId;
    return this.prisma.inventoryLot.findMany({
      where,
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneLot(id: string) {
    const record = await this.prisma.inventoryLot.findFirst({
      where: { id },
      include: { product: true },
    });
    if (!record) throw new NotFoundException('Lot not found');
    return record;
  }

  async createLot(companyId: string, data: any) {
    return this.prisma.inventoryLot.create({
      data: {
        lotNumber: data.lotNumber,
        quantity: data.quantity || 0,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        receivedAt: data.receivedAt ? new Date(data.receivedAt) : undefined,
        notes: data.notes,
        productId: data.productId,
        companyId,
      },
      include: { product: true },
    });
  }

  async updateLot(id: string, data: any) {
    const existing = await this.prisma.inventoryLot.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Lot not found');
    return this.prisma.inventoryLot.update({
      where: { id },
      data,
      include: { product: true },
    });
  }

  async removeLot(id: string) {
    const existing = await this.prisma.inventoryLot.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Lot not found');
    return this.prisma.inventoryLot.delete({ where: { id } });
  }

  async findAllSerials(companyId: string, productId?: string, status?: string) {
    const where: any = { companyId };
    if (productId) where.productId = productId;
    if (status) where.status = status;
    return this.prisma.inventorySerial.findMany({
      where,
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneSerial(id: string) {
    const record = await this.prisma.inventorySerial.findFirst({
      where: { id },
      include: { product: true },
    });
    if (!record) throw new NotFoundException('Serial not found');
    return record;
  }

  async createSerial(companyId: string, data: any) {
    return this.prisma.inventorySerial.create({
      data: {
        serialNumber: data.serialNumber,
        status: data.status || 'IN_STOCK',
        receivedAt: data.receivedAt ? new Date(data.receivedAt) : undefined,
        soldAt: data.soldAt ? new Date(data.soldAt) : undefined,
        notes: data.notes,
        productId: data.productId,
        companyId,
      },
      include: { product: true },
    });
  }

  async updateSerial(id: string, data: any) {
    const existing = await this.prisma.inventorySerial.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Serial not found');
    return this.prisma.inventorySerial.update({
      where: { id },
      data,
      include: { product: true },
    });
  }

  async removeSerial(id: string) {
    const existing = await this.prisma.inventorySerial.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Serial not found');
    return this.prisma.inventorySerial.delete({ where: { id } });
  }

  async traceSerial(productId: string, serialNumber: string) {
    const serial = await this.prisma.inventorySerial.findFirst({
      where: { productId, serialNumber },
      include: { product: true },
    });
    if (!serial) throw new NotFoundException('Serial not found');

    const transactions = await this.prisma.inventoryTransaction.findMany({
      where: { productId },
      include: { product: true, warehouse: true, location: true, lot: true },
      orderBy: { movedAt: 'asc' },
    });

    return { serial, transactions };
  }

  async findExpiringLots(companyId: string, days: number) {
    const target = new Date();
    target.setDate(target.getDate() + days);

    return this.prisma.inventoryLot.findMany({
      where: {
        companyId,
        expiryDate: { lte: target },
        quantity: { gt: 0 },
      },
      include: { product: true },
      orderBy: { expiryDate: 'asc' },
    });
  }
}
