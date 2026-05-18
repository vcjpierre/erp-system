import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query?: any) {
    const where: any = { companyId };
    if (query?.warehouseId) {
      where.warehouseId = query.warehouseId;
    }
    return this.prisma.inventory.findMany({
      where,
      include: {
        product: true,
        warehouse: true,
        location: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.inventory.findFirst({
      where: { id },
      include: {
        product: true,
        warehouse: true,
        location: true,
      },
    });
    if (!record) throw new NotFoundException('Inventory record not found');
    return record;
  }

  async findByProduct(companyId: string, productId: string) {
    return this.prisma.inventory.findMany({
      where: { companyId, productId },
      include: {
        product: true,
        warehouse: true,
        location: true,
      },
    });
  }

  async findByWarehouse(companyId: string, warehouseId: string) {
    return this.prisma.inventory.findMany({
      where: { companyId, warehouseId },
      include: {
        product: true,
        warehouse: true,
        location: true,
      },
    });
  }

  async create(companyId: string, data: any) {
    const quantity = data.quantity || 0;
    const reservedQty = data.reservedQty || 0;
    return this.prisma.inventory.create({
      data: {
        productId: data.productId,
        warehouseId: data.warehouseId,
        locationId: data.locationId,
        quantity,
        reservedQty,
        availableQty: quantity - reservedQty,
        minStock: data.minStock || 0,
        maxStock: data.maxStock || 0,
        companyId,
      },
      include: {
        product: true,
        warehouse: true,
        location: true,
      },
    });
  }

  async update(id: string, data: any) {
    const existing = await this.prisma.inventory.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Inventory record not found');

    const updateData: any = { ...data };
    if (data.quantity !== undefined || data.reservedQty !== undefined) {
      const quantity = data.quantity ?? existing.quantity;
      const reservedQty = data.reservedQty ?? existing.reservedQty;
      updateData.availableQty = quantity - reservedQty;
    }
    delete updateData.companyId;

    return this.prisma.inventory.update({
      where: { id },
      data: updateData,
      include: {
        product: true,
        warehouse: true,
        location: true,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.inventory.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Inventory record not found');
    return this.prisma.inventory.delete({ where: { id } });
  }

  async findAllLocations(companyId: string) {
    return this.prisma.warehouseLocation.findMany({
      where: { companyId },
      include: { warehouse: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneLocation(id: string) {
    const location = await this.prisma.warehouseLocation.findFirst({
      where: { id },
      include: { warehouse: true },
    });
    if (!location) throw new NotFoundException('Location not found');
    return location;
  }

  async createLocation(companyId: string, data: any) {
    return this.prisma.warehouseLocation.create({
      data: {
        code: data.code,
        name: data.name,
        barcode: data.barcode,
        aisle: data.aisle,
        rack: data.rack,
        shelf: data.shelf,
        bin: data.bin,
        warehouseId: data.warehouseId,
        parentId: data.parentId,
        companyId,
      },
      include: { warehouse: true },
    });
  }

  async updateLocation(id: string, data: any) {
    const existing = await this.prisma.warehouseLocation.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Location not found');
    return this.prisma.warehouseLocation.update({
      where: { id },
      data,
      include: { warehouse: true },
    });
  }

  async removeLocation(id: string) {
    const existing = await this.prisma.warehouseLocation.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Location not found');
    return this.prisma.warehouseLocation.delete({ where: { id } });
  }

  async findAllAdjustments(companyId: string) {
    return this.prisma.inventoryAdjustment.findMany({
      where: { companyId },
      include: {
        lines: {
          include: {
            product: true,
            warehouse: true,
            location: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneAdjustment(id: string) {
    const adjustment = await this.prisma.inventoryAdjustment.findFirst({
      where: { id },
      include: {
        lines: {
          include: {
            product: true,
            warehouse: true,
            location: true,
          },
        },
      },
    });
    if (!adjustment) throw new NotFoundException('Adjustment not found');
    return adjustment;
  }

  async createAdjustment(companyId: string, data: any) {
    const { lines, ...header } = data;
    const adjustmentType = header.type || 'POSITIVE';

    return this.prisma.$transaction(async (tx) => {
      const adjustment = await tx.inventoryAdjustment.create({
        data: {
          number: header.number,
          description: header.description,
          type: adjustmentType,
          reason: header.reason,
          status: header.status || 'DRAFT',
          createdById: header.createdById,
          companyId,
        },
      });

      if (lines && lines.length > 0) {
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          await tx.inventoryAdjustmentLine.create({
            data: {
              adjustmentId: adjustment.id,
              lineNumber: line.lineNumber || i + 1,
              description: line.description,
              quantity: line.quantity,
              unitCost: line.unitCost || 0,
              totalCost: line.totalCost || 0,
              productId: line.productId,
              warehouseId: line.warehouseId,
              locationId: line.locationId,
              lotId: line.lotId,
              companyId,
            },
          });

          const qty =
            adjustmentType === 'POSITIVE' ? line.quantity : -Math.abs(line.quantity);

          await tx.inventory.upsert({
            where: {
              productId_warehouseId: {
                productId: line.productId,
                warehouseId: line.warehouseId,
              },
            },
            update: {
              quantity: { increment: qty },
              availableQty: { increment: qty },
            },
            create: {
              productId: line.productId,
              warehouseId: line.warehouseId,
              locationId: line.locationId,
              quantity: qty > 0 ? qty : 0,
              reservedQty: 0,
              availableQty: qty > 0 ? qty : 0,
              companyId,
            },
          });

          const movementType =
            adjustmentType === 'POSITIVE' ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT';

          await tx.inventoryTransaction.create({
            data: {
              movementType,
              quantity: line.quantity,
              unitCost: line.unitCost || 0,
              totalCost: line.totalCost || 0,
              reference: `Adjustment: ${header.number || adjustment.id}`,
              referenceId: adjustment.id,
              notes: line.description || header.description,
              productId: line.productId,
              warehouseId: line.warehouseId,
              locationId: line.locationId,
              lotId: line.lotId,
              companyId,
            },
          });
        }
      }

      return tx.inventoryAdjustment.findFirst({
        where: { id: adjustment.id },
        include: {
          lines: {
            include: {
              product: true,
              warehouse: true,
              location: true,
            },
          },
        },
      });
    });
  }

  async updateAdjustment(id: string, data: any) {
    const existing = await this.prisma.inventoryAdjustment.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Adjustment not found');

    const { lines, ...header } = data;

    return this.prisma.$transaction(async (tx) => {
      const adjustment = await tx.inventoryAdjustment.update({
        where: { id },
        data: header,
      });

      if (lines) {
        await tx.inventoryAdjustmentLine.deleteMany({
          where: { adjustmentId: id },
        });

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          await tx.inventoryAdjustmentLine.create({
            data: {
              adjustmentId: id,
              lineNumber: line.lineNumber || i + 1,
              description: line.description,
              quantity: line.quantity,
              unitCost: line.unitCost || 0,
              totalCost: line.totalCost || 0,
              productId: line.productId,
              warehouseId: line.warehouseId,
              locationId: line.locationId,
              lotId: line.lotId,
              companyId: existing.companyId,
            },
          });
        }
      }

      return tx.inventoryAdjustment.findFirst({
        where: { id },
        include: {
          lines: {
            include: {
              product: true,
              warehouse: true,
              location: true,
            },
          },
        },
      });
    });
  }

  async removeAdjustment(id: string) {
    const existing = await this.prisma.inventoryAdjustment.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Adjustment not found');
    return this.prisma.inventoryAdjustment.delete({ where: { id } });
  }

  async findAllPhysicalCounts(companyId: string) {
    return this.prisma.physicalCount.findMany({
      where: { companyId },
      include: {
        lines: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOnePhysicalCount(id: string) {
    const count = await this.prisma.physicalCount.findFirst({
      where: { id },
      include: {
        lines: {
          include: { product: true },
        },
      },
    });
    if (!count) throw new NotFoundException('Physical count not found');
    return count;
  }

  async createPhysicalCount(companyId: string, data: any) {
    const { lines, ...header } = data;

    return this.prisma.$transaction(async (tx) => {
      const count = await tx.physicalCount.create({
        data: {
          number: header.number,
          description: header.description,
          status: header.status || 'DRAFT',
          countDate: header.countDate ? new Date(header.countDate) : new Date(),
          warehouseId: header.warehouseId,
          createdById: header.createdById,
          companyId,
        },
      });

      if (lines && lines.length > 0) {
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          const inventory = await tx.inventory.findFirst({
            where: {
              companyId,
              productId: line.productId,
              warehouseId: header.warehouseId,
            },
          });

          const expectedQty = Number(inventory?.quantity || 0);

          await tx.physicalCountLine.create({
            data: {
              physicalCountId: count.id,
              lineNumber: line.lineNumber || i + 1,
              expectedQty,
              countedQty: line.countedQty || 0,
              differenceQty: line.countedQty ? Number(line.countedQty) - expectedQty : 0,
              notes: line.notes,
              productId: line.productId,
              locationId: line.locationId,
              companyId,
            },
          });
        }
      }

      return tx.physicalCount.findFirst({
        where: { id: count.id },
        include: {
          lines: {
            include: { product: true },
          },
        },
      });
    });
  }

  async updatePhysicalCount(id: string, data: any) {
    const existing = await this.prisma.physicalCount.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Physical count not found');

    const { lines, ...header } = data;

    return this.prisma.$transaction(async (tx) => {
      const count = await tx.physicalCount.update({
        where: { id },
        data: header,
      });

      if (lines) {
        await tx.physicalCountLine.deleteMany({
          where: { physicalCountId: id },
        });

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          const inventory = await tx.inventory.findFirst({
            where: {
              companyId: existing.companyId,
              productId: line.productId,
              warehouseId: existing.warehouseId,
            },
          });

          const expectedQty = Number(line.expectedQty ?? inventory?.quantity ?? 0);

          await tx.physicalCountLine.create({
            data: {
              physicalCountId: id,
              lineNumber: line.lineNumber || i + 1,
              expectedQty,
              countedQty: line.countedQty || 0,
              differenceQty: line.countedQty ? Number(line.countedQty) - expectedQty : 0,
              notes: line.notes,
              productId: line.productId,
              locationId: line.locationId,
              companyId: existing.companyId,
            },
          });
        }
      }

      return tx.physicalCount.findFirst({
        where: { id },
        include: {
          lines: {
            include: { product: true },
          },
        },
      });
    });
  }

  async removePhysicalCount(id: string) {
    const existing = await this.prisma.physicalCount.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Physical count not found');
    return this.prisma.physicalCount.delete({ where: { id } });
  }
}
