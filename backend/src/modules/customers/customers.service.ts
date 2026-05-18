import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateCustomerDto) {
    return this.prisma.customer.create({
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

    const where: Prisma.CustomerWhereInput = {
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
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count({ where }),
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
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with id "${id}" not found`);
    }

    return customer;
  }

  async update(companyId: string, id: string, dto: UpdateCustomerDto) {
    await this.findOne(companyId, id);

    return this.prisma.customer.update({
      where: { id },
      data: dto,
    });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);

    return this.prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getCustomerBalance(companyId: string, id: string) {
    await this.findOne(companyId, id);

    const result = await this.prisma.invoice.aggregate({
      where: { customerId: id, companyId },
      _sum: { balance: true },
    });

    return { balance: Number(result._sum?.balance || 0) };
  }

  async getAgingReport(companyId: string) {
    const now = new Date();

    const invoices = await this.prisma.invoice.findMany({
      where: {
        companyId,
        customerId: { not: null },
        dueDate: { not: null, lt: now },
        balance: { gt: 0 },
      },
      include: { customer: true },
    });

    const buckets = {
      '0-30': [] as any[],
      '31-60': [] as any[],
      '61-90': [] as any[],
      '90+': [] as any[],
    };

    let total0_30 = 0;
    let total31_60 = 0;
    let total61_90 = 0;
    let total90Plus = 0;

    for (const invoice of invoices) {
      const dueDate = new Date(invoice.dueDate!);
      const diffDays = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      const item = {
        invoiceId: invoice.id,
        documentNumber: invoice.documentNumber,
        customerId: invoice.customerId,
        customerName: invoice.customer?.legalName || '',
        dueDate: invoice.dueDate,
        balance: Number(invoice.balance),
        daysOverdue: diffDays,
      };

      if (diffDays <= 30) {
        buckets['0-30'].push(item);
        total0_30 += Number(invoice.balance);
      } else if (diffDays <= 60) {
        buckets['31-60'].push(item);
        total31_60 += Number(invoice.balance);
      } else if (diffDays <= 90) {
        buckets['61-90'].push(item);
        total61_90 += Number(invoice.balance);
      } else {
        buckets['90+'].push(item);
        total90Plus += Number(invoice.balance);
      }
    }

    return {
      buckets,
      totals: {
        '0-30': total0_30,
        '31-60': total31_60,
        '61-90': total61_90,
        '90+': total90Plus,
        grandTotal: total0_30 + total31_60 + total61_90 + total90Plus,
      },
    };
  }
}
