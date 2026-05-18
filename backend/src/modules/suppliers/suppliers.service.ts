import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateSupplierDto) {
    return this.prisma.supplier.create({
      data: {
        ...dto,
        companyId,
      },
    });
  }

  async findAll(
    companyId: string,
    params: { page?: number; limit?: number; search?: string; isActive?: boolean },
  ) {
    const { page = 1, limit = 10, search, isActive } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.SupplierWhereInput = {
      companyId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { legalName: { contains: search, mode: 'insensitive' } },
        { taxId: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.supplier.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(companyId: string, id: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with id "${id}" not found`);
    }

    return supplier;
  }

  async update(companyId: string, id: string, dto: UpdateSupplierDto) {
    await this.findOne(companyId, id);

    return this.prisma.supplier.update({
      where: { id },
      data: dto,
    });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);

    return this.prisma.supplier.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getSupplierPurchases(companyId: string, id: string) {
    await this.findOne(companyId, id);

    return this.prisma.invoice.findMany({
      where: { supplierId: id, companyId },
      orderBy: { issueDate: 'desc' },
    });
  }
}
