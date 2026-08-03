import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventBus } from '../../events/event-bus';
import { WsGateway } from '../../websocket/ws.gateway';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private readonly eventBus: EventBus,
    private readonly wsGateway: WsGateway,
  ) {}

  async create(companyId: string, dto: any) {
    const { initialQuantity, warehouseId, ...data } = dto;

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: { ...data, companyId },
      });

      if (initialQuantity && warehouseId) {
        await tx.inventory.create({
          data: {
            productId: product.id,
            warehouseId,
            quantity: initialQuantity,
            companyId,
          },
        });
      }

      const result = await tx.product.findFirst({
        where: { id: product.id },
        include: { inventories: { include: { warehouse: true } } },
      });

      return result;
    }).then((product) => {
      this.eventBus.emit('products.product.created', { companyId, productId: product!.id, code: product!.code });
      this.wsGateway.emitToCompany(companyId, 'products.product.created', { productId: product!.id, code: product!.code });
      return product;
    });
  }

  async findAll(companyId: string) {
    return this.prisma.product.findMany({
      where: { companyId, isActive: true },
      include: { inventories: { include: { warehouse: true } } },
      orderBy: { code: 'asc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, companyId },
      include: { inventories: { include: { warehouse: true } } },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(companyId: string, id: string, dto: any) {
    const existing = await this.prisma.product.findFirst({ where: { id, companyId } });
    if (!existing) throw new NotFoundException('Product not found');
    const product = await this.prisma.product.update({ where: { id }, data: dto });

    this.eventBus.emit('products.product.updated', { companyId, productId: id });

    return product;
  }

  async remove(companyId: string, id: string) {
    const existing = await this.prisma.product.findFirst({ where: { id, companyId } });
    if (!existing) throw new NotFoundException('Product not found');
    return this.prisma.product.update({ where: { id }, data: { isActive: false } });
  }

  async updateStock(companyId: string, productId: string, warehouseId: string, quantity: number) {
    const product = await this.prisma.product.findFirst({ where: { id: productId, companyId } });
    if (!product) throw new NotFoundException('Product not found');

    const inventory = await this.prisma.inventory.upsert({
      where: { productId_warehouseId: { productId, warehouseId } },
      update: { quantity: { increment: quantity } },
      create: { productId, warehouseId, quantity, companyId },
    });

    this.eventBus.emit('products.stock.updated', { companyId, productId, warehouseId, newQuantity: inventory.quantity });
    this.wsGateway.emitToCompany(companyId, 'products.stock.updated', { productId, warehouseId, newQuantity: inventory.quantity });

    return inventory;
  }
}
