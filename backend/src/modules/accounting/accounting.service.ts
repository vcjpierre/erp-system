import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';

@Injectable()
export class AccountingService {
  constructor(private prisma: PrismaService) {}

  async createAccount(companyId: string, dto: CreateAccountDto) {
    const existing = await this.prisma.account.findUnique({
      where: { companyId_code: { companyId, code: dto.code } },
    });
    if (existing) throw new ConflictException('Account code already exists');

    let level = 1;
    if (dto.parentId) {
      const parent = await this.prisma.account.findFirst({
        where: { id: dto.parentId, companyId },
      });
      if (!parent) throw new NotFoundException('Parent account not found');
      level = parent.level + 1;
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.parentId) {
        await tx.account.update({
          where: { id: dto.parentId },
          data: { isLeaf: false },
        });
      }

      return tx.account.create({
        data: {
          code: dto.code,
          name: dto.name,
          type: dto.type,
          nature: dto.nature,
          description: dto.description,
          level,
          parentId: dto.parentId ?? null,
          companyId,
        },
      });
    });
  }

  async getAccount(companyId: string, id: string) {
    const account = await this.prisma.account.findFirst({
      where: { id, companyId },
      include: { parent: true, children: true },
    });
    if (!account) throw new NotFoundException('Account not found');
    return account;
  }

  async updateAccount(companyId: string, id: string, dto: UpdateAccountDto) {
    await this.getAccount(companyId, id);

    if (dto.code) {
      const existing = await this.prisma.account.findFirst({
        where: { companyId, code: dto.code, id: { not: id } },
      });
      if (existing) throw new ConflictException('Account code already exists');
    }

    let level: number | undefined;
    if (dto.parentId) {
      const parent = await this.prisma.account.findFirst({
        where: { id: dto.parentId, companyId },
      });
      if (!parent) throw new NotFoundException('Parent account not found');
      level = parent.level + 1;
    }

    const data: any = { ...dto };
    if (level !== undefined) data.level = level;
    return this.prisma.account.update({ where: { id }, data });
  }

  async getChartOfAccounts(companyId: string) {
    const accounts = await this.prisma.account.findMany({
      where: { companyId },
      orderBy: { code: 'asc' },
    });

    const map = new Map<string, any>();
    const roots: any[] = [];

    for (const acc of accounts) {
      map.set(acc.id, { ...acc, children: [] });
    }

    for (const acc of accounts) {
      const node = map.get(acc.id);
      if (acc.parentId && map.has(acc.parentId)) {
        map.get(acc.parentId).children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  async getAccountBalance(companyId: string, accountId: string, periodId: string) {
    const result = await this.prisma.journalEntryLine.aggregate({
      where: {
        companyId,
        accountId,
        journalEntry: { accountingPeriodId: periodId, status: 'POSTED' },
      },
      _sum: { debit: true, credit: true },
    });

    return {
      accountId,
      totalDebit: result._sum.debit?.toNumber() ?? 0,
      totalCredit: result._sum.credit?.toNumber() ?? 0,
      balance: (result._sum.debit?.toNumber() ?? 0) - (result._sum.credit?.toNumber() ?? 0),
    };
  }

  async createJournalEntry(companyId: string, userId: string, dto: CreateJournalEntryDto) {
    const period = await this.prisma.accountingPeriod.findFirst({
      where: { id: dto.periodId, companyId },
    });
    if (!period) throw new NotFoundException('Accounting period not found');
    if (period.status !== 'OPEN') throw new BadRequestException('Accounting period is not open');

    let totalDebit = 0;
    let totalCredit = 0;

    for (const line of dto.lines) {
      totalDebit += line.debit;
      totalCredit += line.credit;

      const account = await this.prisma.account.findFirst({
        where: { id: line.accountId, companyId },
      });
      if (!account) throw new NotFoundException(`Account ${line.accountId} not found`);

      if (line.costCenterId) {
        const cc = await this.prisma.costCenter.findFirst({
          where: { id: line.costCenterId, companyId },
        });
        if (!cc) throw new NotFoundException(`CostCenter ${line.costCenterId} not found`);
      }
    }

    if (totalDebit !== totalCredit) {
      throw new BadRequestException('Total debits must equal total credits');
    }

    return this.prisma.$transaction(async (tx) => {
      const seq = await tx.documentSequence.findUnique({
        where: { companyId_documentType: { companyId, documentType: 'INVOICE' } },
      });
      if (!seq) throw new NotFoundException('Document sequence not configured');

      const number = seq.nextNumber;

      await tx.documentSequence.update({
        where: { id: seq.id },
        data: { nextNumber: seq.nextNumber + 1 },
      });

      return tx.journalEntry.create({
        data: {
          number,
          description: dto.description,
          reference: dto.reference,
          status: 'DRAFT',
          totalDebit,
          totalCredit,
          companyId,
          accountingPeriodId: dto.periodId,
          createdById: userId,
          lines: {
            create: dto.lines.map((l) => ({
              debit: l.debit,
              credit: l.credit,
              description: l.description,
              accountId: l.accountId,
              costCenterId: l.costCenterId ?? null,
              companyId,
            })),
          },
        },
        include: { lines: true },
      });
    });
  }

  async postJournalEntry(companyId: string, id: string) {
    const entry = await this.prisma.journalEntry.findFirst({
      where: { id, companyId },
    });
    if (!entry) throw new NotFoundException('Journal entry not found');
    if (entry.status !== 'DRAFT') throw new BadRequestException('Only draft entries can be posted');

    return this.prisma.journalEntry.update({
      where: { id },
      data: { status: 'POSTED', postedAt: new Date() },
    });
  }

  async cancelJournalEntry(companyId: string, id: string, reason: string) {
    const entry = await this.prisma.journalEntry.findFirst({
      where: { id, companyId },
    });
    if (!entry) throw new NotFoundException('Journal entry not found');
    if (entry.status === 'CANCELLED') throw new BadRequestException('Entry is already cancelled');
    if (entry.status === 'DRAFT') {
      await this.prisma.journalEntry.update({
        where: { id },
        data: { status: 'CANCELLED', cancelledAt: new Date(), cancelReason: reason },
      });
      return { message: 'Draft entry cancelled' };
    }

    return this.prisma.$transaction(async (tx) => {
      const reversal = await tx.journalEntry.create({
        data: {
          number: 0,
          description: `Reversal: ${entry.description}`,
          reference: entry.reference,
          status: 'POSTED',
          totalDebit: entry.totalCredit,
          totalCredit: entry.totalDebit,
          postedAt: new Date(),
          companyId: entry.companyId,
          accountingPeriodId: entry.accountingPeriodId,
          createdById: entry.createdById,
        },
      });

      const lines = await tx.journalEntryLine.findMany({
        where: { journalEntryId: id },
      });

      await tx.journalEntryLine.createMany({
        data: lines.map((l) => ({
          debit: l.credit,
          credit: l.debit,
          description: `Reversal: ${l.description ?? entry.description}`,
          accountId: l.accountId,
          costCenterId: l.costCenterId,
          companyId: l.companyId,
          journalEntryId: reversal.id,
        })),
      });

      await tx.journalEntry.update({
        where: { id },
        data: { status: 'CANCELLED', cancelledAt: new Date(), cancelReason: reason },
      });

      return { message: 'Entry cancelled with reversal', reversalId: reversal.id };
    });
  }

  async getJournalEntries(companyId: string, periodId?: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where: any = { companyId };
    if (periodId) where.accountingPeriodId = periodId;

    const [data, total] = await Promise.all([
      this.prisma.journalEntry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { lines: true, accountingPeriod: true, createdBy: { select: { id: true, firstName: true, lastName: true } } },
      }),
      this.prisma.journalEntry.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getJournalEntry(companyId: string, id: string) {
    const entry = await this.prisma.journalEntry.findFirst({
      where: { id, companyId },
      include: {
        lines: {
          include: { account: true, costCenter: true },
        },
        accountingPeriod: true,
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!entry) throw new NotFoundException('Journal entry not found');
    return entry;
  }

  async getTrialBalance(companyId: string, periodId: string) {
    const accounts = await this.prisma.account.findMany({
      where: { companyId },
      orderBy: { code: 'asc' },
    });

    const result = await Promise.all(
      accounts.map(async (account) => {
        const agg = await this.prisma.journalEntryLine.aggregate({
          where: {
            companyId,
            accountId: account.id,
            journalEntry: { accountingPeriodId: periodId, status: 'POSTED' },
          },
          _sum: { debit: true, credit: true },
        });

        const debit = agg._sum.debit?.toNumber() ?? 0;
        const credit = agg._sum.credit?.toNumber() ?? 0;
        const balance = account.nature * (debit - credit);

        return {
          accountId: account.id,
          accountCode: account.code,
          accountName: account.name,
          type: account.type,
          nature: account.nature,
          debit,
          credit,
          balance,
        };
      }),
    );

    const totals = result.reduce(
      (acc, r) => ({
        debit: acc.debit + r.debit,
        credit: acc.credit + r.credit,
        balance: acc.balance + r.balance,
      }),
      { debit: 0, credit: 0, balance: 0 },
    );

    return { data: result, totals };
  }

  async getLedger(companyId: string, accountId: string, periodId?: string) {
    const account = await this.prisma.account.findFirst({
      where: { id: accountId, companyId },
    });
    if (!account) throw new NotFoundException('Account not found');

    const where: any = { companyId, accountId };
    if (periodId) {
      where.journalEntry = { accountingPeriodId: periodId };
    }

    const lines = await this.prisma.journalEntryLine.findMany({
      where,
      include: {
        journalEntry: {
          select: { id: true, number: true, description: true, status: true, createdAt: true },
        },
        costCenter: { select: { id: true, code: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      account: { id: account.id, code: account.code, name: account.name, type: account.type },
      lines,
    };
  }
}
