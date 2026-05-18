import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCostCenterDto } from './dto/create-cost-center.dto';
import { UpdateCostCenterDto } from './dto/update-cost-center.dto';

@Injectable()
export class CostCentersService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreateCostCenterDto) {
    const existing = await this.prisma.costCenter.findUnique({
      where: { companyId_code: { companyId, code: dto.code } },
    });
    if (existing) throw new ConflictException('Cost center code already exists');

    return this.prisma.costCenter.create({
      data: { code: dto.code, name: dto.name, companyId },
    });
  }

  async findAll(companyId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = { companyId };

    const [data, total] = await Promise.all([
      this.prisma.costCenter.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.costCenter.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(companyId: string, id: string) {
    const cc = await this.prisma.costCenter.findFirst({
      where: { id, companyId },
      include: { budgets: true },
    });
    if (!cc) throw new NotFoundException('Cost center not found');
    return cc;
  }

  async update(companyId: string, id: string, dto: UpdateCostCenterDto) {
    await this.findOne(companyId, id);

    if (dto.code) {
      const existing = await this.prisma.costCenter.findFirst({
        where: { companyId, code: dto.code, id: { not: id } },
      });
      if (existing) throw new ConflictException('Cost center code already exists');
    }

    return this.prisma.costCenter.update({ where: { id }, data: dto });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    await this.prisma.costCenter.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async setBudget(companyId: string, costCenterId: string, accountId: string, year: number, amount: number) {
    await this.findOne(companyId, costCenterId);

    const account = await this.prisma.account.findFirst({
      where: { id: accountId, companyId },
    });
    if (!account) throw new NotFoundException('Account not found');

    return this.prisma.costCenterBudget.upsert({
      where: { costCenterId_accountId_year: { costCenterId, accountId, year } },
      update: { amount },
      create: { costCenterId, accountId, year, amount, companyId },
    });
  }

  async getBudget(companyId: string, costCenterId: string, accountId: string, year: number) {
    await this.findOne(companyId, costCenterId);

    const budget = await this.prisma.costCenterBudget.findUnique({
      where: { costCenterId_accountId_year: { costCenterId, accountId, year } },
    });
    if (!budget) throw new NotFoundException('Budget not found');
    return budget;
  }

  async getBudgetSummary(companyId: string, costCenterId: string, year: number) {
    await this.findOne(companyId, costCenterId);

    const budgets = await this.prisma.costCenterBudget.findMany({
      where: { costCenterId, year },
      include: { account: true },
    });

    const actuals = await Promise.all(
      budgets.map(async (b) => {
        const agg = await this.prisma.journalEntryLine.aggregate({
          where: {
            companyId,
            costCenterId,
            accountId: b.accountId,
            journalEntry: {
              status: 'POSTED',
              accountingPeriod: { year },
            },
          },
          _sum: { debit: true, credit: true },
        });

        return {
          accountId: b.accountId,
          accountCode: b.account.code,
          accountName: b.account.name,
          budgetAmount: b.amount.toNumber(),
          actualDebit: agg._sum.debit?.toNumber() ?? 0,
          actualCredit: agg._sum.credit?.toNumber() ?? 0,
          balance: b.amount.toNumber() - (agg._sum.debit?.toNumber() ?? 0) + (agg._sum.credit?.toNumber() ?? 0),
        };
      }),
    );

    return { costCenterId, year, items: actuals };
  }
}
