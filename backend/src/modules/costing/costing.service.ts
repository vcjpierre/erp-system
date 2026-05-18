import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CostingService {
  constructor(private prisma: PrismaService) {}

  async findAllLayers(companyId: string, productId?: string, warehouseId?: string) {
    const where: any = { companyId };
    if (productId) where.productId = productId;
    if (warehouseId) where.warehouseId = warehouseId;
    return this.prisma.valuationLayer.findMany({
      where,
      include: { product: true, warehouse: true },
      orderBy: { layerDate: 'asc' },
    });
  }

  async findOneLayer(id: string) {
    const record = await this.prisma.valuationLayer.findFirst({
      where: { id },
      include: { product: true, warehouse: true },
    });
    if (!record) throw new NotFoundException('Valuation layer not found');
    return record;
  }

  async createLayer(companyId: string, data: any) {
    return this.prisma.valuationLayer.create({
      data: {
        quantity: data.quantity || 0,
        unitCost: data.unitCost || 0,
        totalCost: data.totalCost || 0,
        remainingQty: data.remainingQty ?? data.quantity ?? 0,
        layerDate: data.layerDate ? new Date(data.layerDate) : undefined,
        layerType: data.layerType || 'PURCHASE',
        productId: data.productId,
        warehouseId: data.warehouseId,
        companyId,
      },
      include: { product: true, warehouse: true },
    });
  }

  async updateLayer(id: string, data: any) {
    const existing = await this.prisma.valuationLayer.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Valuation layer not found');
    return this.prisma.valuationLayer.update({
      where: { id },
      data,
      include: { product: true, warehouse: true },
    });
  }

  async removeLayer(id: string) {
    const existing = await this.prisma.valuationLayer.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Valuation layer not found');
    return this.prisma.valuationLayer.delete({ where: { id } });
  }

  async calculateAverageCost(companyId: string, productId: string, warehouseId?: string) {
    const where: any = { companyId, productId, remainingQty: { gt: 0 } };
    if (warehouseId) where.warehouseId = warehouseId;

    const layers = await this.prisma.valuationLayer.findMany({ where });

    if (layers.length === 0) {
      return { averageCost: 0, totalQty: 0, totalCost: 0, layers: [] };
    }

    const totalQty = layers.reduce((sum, l) => sum + Number(l.remainingQty), 0);
    const totalCost = layers.reduce((sum, l) => sum + Number(l.unitCost) * Number(l.remainingQty), 0);
    const averageCost = totalQty > 0 ? totalCost / totalQty : 0;

    return { averageCost: Math.round(averageCost * 100) / 100, totalQty, totalCost: Math.round(totalCost * 100) / 100, layers };
  }

  async getProductValuation(companyId: string, productId: string) {
    const layers = await this.prisma.valuationLayer.findMany({
      where: { companyId, productId, remainingQty: { gt: 0 } },
      include: { warehouse: true },
    });

    const byWarehouse = new Map<string, { warehouse: any; quantity: number; cost: number; totalValue: number }>();

    for (const layer of layers) {
      const whId = layer.warehouseId;
      if (!byWarehouse.has(whId)) {
        byWarehouse.set(whId, {
          warehouse: layer.warehouse,
          quantity: 0,
          cost: 0,
          totalValue: 0,
        });
      }
      const entry = byWarehouse.get(whId)!;
      const qty = Number(layer.remainingQty);
      const cost = Number(layer.unitCost);
      entry.quantity += qty;
      entry.totalValue += qty * cost;
    }

    for (const entry of byWarehouse.values()) {
      entry.cost = entry.quantity > 0 ? Math.round((entry.totalValue / entry.quantity) * 100) / 100 : 0;
      entry.totalValue = Math.round(entry.totalValue * 100) / 100;
    }

    return Array.from(byWarehouse.values());
  }

  async getTotalValuation(companyId: string) {
    const layers = await this.prisma.valuationLayer.findMany({
      where: { companyId, remainingQty: { gt: 0 } },
      include: { product: true, warehouse: true },
    });

    const byProduct = new Map<string, { product: any; quantity: number; totalCost: number }>();

    for (const layer of layers) {
      const prodId = layer.productId;
      if (!byProduct.has(prodId)) {
        byProduct.set(prodId, {
          product: layer.product,
          quantity: 0,
          totalCost: 0,
        });
      }
      const entry = byProduct.get(prodId)!;
      entry.quantity += Number(layer.remainingQty);
      entry.totalCost += Number(layer.unitCost) * Number(layer.remainingQty);
    }

    const products = Array.from(byProduct.values()).map((p) => ({
      productId: p.product.id,
      productCode: p.product.code,
      productName: p.product.name,
      quantity: p.quantity,
      averageCost: p.quantity > 0 ? Math.round((p.totalCost / p.quantity) * 100) / 100 : 0,
      totalValue: Math.round(p.totalCost * 100) / 100,
    }));

    const grandTotal = products.reduce((sum, p) => sum + p.totalValue, 0);

    return {
      productCount: products.length,
      totalValue: grandTotal,
      products,
    };
  }
}
