import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventBus } from '../../events/event-bus';
import { WsGateway } from '../../websocket/ws.gateway';

@Injectable()
export class EcommerceService {
  private readonly logger = new Logger(EcommerceService.name);

  constructor(
    private prisma: PrismaService,
    private eventBus: EventBus,
    private wsGateway: WsGateway,
  ) {}

  async syncProducts(companyId: string) {
    const products = await this.prisma.product.findMany({
      where: { companyId, isActive: true },
    });

    await this.prisma.ecommerceSync.deleteMany({
      where: { companyId, entityType: 'PRODUCT' },
    });

    if (products.length > 0) {
      await this.prisma.ecommerceSync.createMany({
        data: products.map((p) => ({
          entityType: 'PRODUCT',
          entityId: p.id,
          action: 'SYNC',
          status: 'PENDING',
          companyId,
        })),
      });
    }

    const eventData = { companyId, count: products.length, entityType: 'PRODUCT' };
    await this.eventBus.emit('ecommerce.synced', eventData, { companyId });
    this.wsGateway.emitToCompany(companyId, 'ecommerce.synced', eventData);

    return { message: 'Products synced', count: products.length };
  }

  async findSyncProducts(companyId: string) {
    return this.prisma.ecommerceSync.findMany({
      where: { companyId, entityType: 'PRODUCT' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async syncStock(companyId: string) {
    const inventories = await this.prisma.inventory.findMany({
      where: { companyId, quantity: { gt: 0 } },
    });

    await this.prisma.ecommerceSync.deleteMany({
      where: { companyId, entityType: 'INVENTORY' },
    });

    if (inventories.length > 0) {
      await this.prisma.ecommerceSync.createMany({
        data: inventories.map((inv) => ({
          entityType: 'INVENTORY',
          entityId: inv.id,
          action: 'SYNC',
          status: 'PENDING',
          companyId,
        })),
      });
    }

    const eventData = { companyId, count: inventories.length, entityType: 'INVENTORY' };
    await this.eventBus.emit('ecommerce.synced', eventData, { companyId });
    this.wsGateway.emitToCompany(companyId, 'ecommerce.synced', eventData);

    return { message: 'Stock synced', count: inventories.length };
  }

  async findSyncOrders(companyId: string) {
    return this.prisma.ecommerceSync.findMany({
      where: { companyId, entityType: 'ORDER' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async processPending(companyId: string) {
    const result = await this.prisma.ecommerceSync.updateMany({
      where: { companyId, status: 'PENDING' },
      data: { status: 'COMPLETED', syncedAt: new Date() },
    });

    const eventData = { companyId, count: result.count };
    await this.eventBus.emit('ecommerce.synced', eventData, { companyId });
    this.wsGateway.emitToCompany(companyId, 'ecommerce.synced', eventData);

    return { message: 'Pending items processed', count: result.count };
  }

  async findOrders(companyId: string) {
    return this.prisma.ecommerceSync.findMany({
      where: { companyId, entityType: 'ORDER' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createOrder(companyId: string, data: any) {
    return this.prisma.ecommerceSync.create({
      data: {
        entityType: 'ORDER',
        entityId: data.entityId,
        action: 'CREATE',
        status: 'PENDING',
        companyId,
      },
    });
  }

  async getCatalog(companyId: string) {
    return this.prisma.product.findMany({
      where: { companyId, isActive: true },
      include: {
        inventories: {
          include: { warehouse: true },
        },
      },
    });
  }

  async getCatalogProduct(companyId: string, code: string) {
    return this.prisma.product.findFirst({
      where: { companyId, code, isActive: true },
      include: {
        inventories: {
          include: { warehouse: true },
        },
      },
    });
  }
}
