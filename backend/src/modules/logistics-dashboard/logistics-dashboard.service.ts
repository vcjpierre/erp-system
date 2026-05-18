import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class LogisticsDashboardService {
  constructor(private prisma: PrismaService) {}

  async getCriticalStock(companyId: string) {
    const inventories = await this.prisma.inventory.findMany({
      where: { companyId, minStock: { gt: 0 } },
      include: { product: { select: { id: true, code: true, name: true, unit: true } }, warehouse: { select: { id: true, name: true } } },
    });
    return inventories
      .filter((inv) => Number(inv.quantity) <= Number(inv.minStock))
      .map((inv) => ({ ...inv, ratio: Number(inv.quantity) / Number(inv.minStock) }))
      .sort((a, b) => a.ratio - b.ratio);
  }

  async getRotation(companyId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const transactions = await this.prisma.inventoryTransaction.groupBy({
      by: ['productId'],
      where: { companyId, movedAt: { gte: since } },
      _count: { productId: true },
      _sum: { quantity: true },
      orderBy: { _count: { productId: 'desc' } },
      take: 20,
    });

    const productIds = transactions.map((t) => t.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, code: true, name: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    return transactions.map((t) => ({
      productId: t.productId,
      product: productMap.get(t.productId),
      movementCount: t._count.productId,
      totalMoved: t._sum.quantity,
    }));
  }

  async getValuation(companyId: string) {
    const inventories = await this.prisma.inventory.findMany({
      where: { companyId },
      include: { product: { select: { id: true, code: true, name: true, cost: true } }, warehouse: { select: { id: true, name: true } } },
    });

    const byWarehouse = new Map<string, { warehouse: any; totalValue: number; items: any[] }>();

    for (const inv of inventories) {
      const value = Number(inv.quantity) * Number(inv.product.cost);
      if (!byWarehouse.has(inv.warehouseId)) {
        byWarehouse.set(inv.warehouseId, { warehouse: inv.warehouse, totalValue: 0, items: [] });
      }
      const entry = byWarehouse.get(inv.warehouseId)!;
      entry.totalValue += value;
      entry.items.push({
        productId: inv.productId,
        product: inv.product,
        quantity: inv.quantity,
        unitCost: inv.product.cost,
        totalValue: value,
      });
    }

    return {
      totalValue: Array.from(byWarehouse.values()).reduce((sum, w) => sum + w.totalValue, 0),
      byWarehouse: Array.from(byWarehouse.values()),
    };
  }

  async getRecentMovements(companyId: string, limit = 50) {
    return this.prisma.inventoryTransaction.findMany({
      where: { companyId },
      include: { product: { select: { id: true, code: true, name: true } }, warehouse: { select: { id: true, name: true } } },
      orderBy: { movedAt: 'desc' },
      take: limit,
    });
  }

  async getEfficiency(companyId: string) {
    const [openPickOrders, pendingPackOrders, pendingDispatcherOrders, pendingTransfers, pendingAdjustments, activeProducts, valuationResult] = await Promise.all([
      this.prisma.pickOrder.count({ where: { companyId, status: { in: ['PENDING', 'PICKING'] } } }),
      this.prisma.packOrder.count({ where: { companyId, status: { in: ['PENDING', 'PACKING'] } } }),
      this.prisma.dispatchOrder.count({ where: { companyId, status: 'PENDING' } }),
      this.prisma.transferOrder.count({ where: { companyId, status: { in: ['DRAFT', 'PENDING', 'IN_TRANSIT'] } } }),
      this.prisma.inventoryAdjustment.count({ where: { companyId, status: 'DRAFT' } }),
      this.prisma.product.count({ where: { companyId, isActive: true } }),
      this.getValuation(companyId),
    ]);

    return {
      openPickOrders,
      pendingPackOrders,
      pendingDispatcherOrders,
      pendingTransfers,
      pendingAdjustments,
      activeProducts,
      totalInventoryValue: valuationResult.totalValue,
    };
  }
}
