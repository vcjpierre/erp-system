import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AccountingPeriodsService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, year: number, month: number) {
    const existing = await this.prisma.accountingPeriod.findUnique({
      where: { companyId_year_month: { companyId, year, month } },
    });
    if (existing) throw new BadRequestException('Period already exists');

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    return this.prisma.accountingPeriod.create({
      data: {
        year,
        month,
        startDate,
        endDate,
        companyId,
      },
    });
  }

  async findAll(companyId: string, page = 1, limit = 24) {
    const skip = (page - 1) * limit;
    const where = { companyId };

    const [data, total] = await Promise.all([
      this.prisma.accountingPeriod.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      }),
      this.prisma.accountingPeriod.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(companyId: string, id: string) {
    const period = await this.prisma.accountingPeriod.findFirst({
      where: { id, companyId },
    });
    if (!period) throw new NotFoundException('Accounting period not found');
    return period;
  }

  async closePeriod(companyId: string, userId: string, id: string, password: string) {
    const period = await this.findOne(companyId, id);
    if (period.status === 'CLOSED') throw new BadRequestException('Period is already closed');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid password');

    const draftCount = await this.prisma.journalEntry.count({
      where: { accountingPeriodId: id, companyId, status: 'DRAFT' },
    });
    if (draftCount > 0) throw new BadRequestException(`Cannot close period: ${draftCount} draft journal entries exist`);

    return this.prisma.accountingPeriod.update({
      where: { id },
      data: { status: 'CLOSED', closedAt: new Date(), closedBy: userId },
    });
  }

  async reopenPeriod(companyId: string, id: string) {
    const period = await this.findOne(companyId, id);
    if (period.status !== 'CLOSED') throw new BadRequestException('Only closed periods can be reopened');

    return this.prisma.accountingPeriod.update({
      where: { id },
      data: { status: 'OPEN', closedAt: null, closedBy: null },
    });
  }

  async getOpenPeriods(companyId: string) {
    return this.prisma.accountingPeriod.findMany({
      where: { companyId, status: 'OPEN' },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }
}
