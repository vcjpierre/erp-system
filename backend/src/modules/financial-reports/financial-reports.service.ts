import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class FinancialReportsService {
  constructor(private prisma: PrismaService) {}

  async getBalanceSheet(companyId: string, periodId: string) {
    const accounts = await this.prisma.account.findMany({
      where: { companyId, type: { in: ['ASSET', 'LIABILITY', 'EQUITY'] } },
      orderBy: { code: 'asc' },
    });

    const assets: { code: string; name: string; balance: number }[] = [];
    const liabilities: { code: string; name: string; balance: number }[] = [];
    const equity: { code: string; name: string; balance: number }[] = [];

    for (const account of accounts) {
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
      const natureBalance = account.nature * (debit - credit);
      const entry = { code: account.code, name: account.name, balance: natureBalance };

      if (account.type === 'ASSET') assets.push(entry);
      else if (account.type === 'LIABILITY') liabilities.push(entry);
      else equity.push(entry);
    }

    return {
      assets,
      liabilities,
      equity,
      totals: {
        assets: assets.reduce((s, a) => s + a.balance, 0),
        liabilities: liabilities.reduce((s, l) => s + l.balance, 0),
        equity: equity.reduce((s, e) => s + e.balance, 0),
      },
    };
  }

  async getIncomeStatement(companyId: string, periodId: string) {
    const accounts = await this.prisma.account.findMany({
      where: { companyId, type: { in: ['INCOME', 'EXPENSE'] } },
      orderBy: { code: 'asc' },
    });

    const revenues: { code: string; name: string; amount: number }[] = [];
    const expenses: { code: string; name: string; amount: number }[] = [];

    for (const account of accounts) {
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
      const amount = account.nature * (debit - credit);

      if (account.type === 'INCOME') revenues.push({ code: account.code, name: account.name, amount });
      else expenses.push({ code: account.code, name: account.name, amount });
    }

    const totalRevenue = revenues.reduce((s, r) => s + r.amount, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

    return {
      revenues,
      expenses,
      totals: { revenue: totalRevenue, expenses: totalExpenses, netIncome: totalRevenue - totalExpenses },
    };
  }

  async getCashFlow(companyId: string, periodId: string) {
    const accounts = await this.prisma.account.findMany({
      where: { companyId },
      orderBy: { code: 'asc' },
    });

    const activities: Record<string, { code: string; name: string; amount: number }[]> = {
      operating: [],
      investing: [],
      financing: [],
    };

    for (const account of accounts) {
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
      const amount = account.nature * (debit - credit);

      if (account.type === 'INCOME' || account.type === 'EXPENSE') {
        activities.operating.push({ code: account.code, name: account.name, amount });
      } else if (account.type === 'ASSET') {
        activities.investing.push({ code: account.code, name: account.name, amount: -amount });
      } else if (account.type === 'LIABILITY' || account.type === 'EQUITY') {
        activities.financing.push({ code: account.code, name: account.name, amount });
      }
    }

    const totals = {
      operating: activities.operating.reduce((s, a) => s + a.amount, 0),
      investing: activities.investing.reduce((s, a) => s + a.amount, 0),
      financing: activities.financing.reduce((s, a) => s + a.amount, 0),
    };

    return {
      activities,
      totals,
      netCashFlow: totals.operating + totals.investing + totals.financing,
    };
  }

  async getTrialBalance(companyId: string, periodId: string) {
    const accounts = await this.prisma.account.findMany({
      where: { companyId },
      orderBy: { code: 'asc' },
    });

    const data = await Promise.all(
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

    const totals = data.reduce(
      (acc, r) => ({
        debit: acc.debit + r.debit,
        credit: acc.credit + r.credit,
        balance: acc.balance + r.balance,
      }),
      { debit: 0, credit: 0, balance: 0 },
    );

    return { data, totals };
  }

  async getFinancialKpis(companyId: string, periodId: string) {
    const [bs, is_] = await Promise.all([
      this.getBalanceSheet(companyId, periodId),
      this.getIncomeStatement(companyId, periodId),
    ]);

    const totalAssets = bs.totals.assets;
    const totalLiabilities = bs.totals.liabilities;
    const totalEquity = bs.totals.equity;
    const revenue = is_.totals.revenue;
    const netIncome = is_.totals.netIncome;

    return {
      currentRatio: totalLiabilities > 0 ? totalAssets / totalLiabilities : null,
      debtRatio: totalAssets > 0 ? totalLiabilities / totalAssets : null,
      profitMargin: revenue > 0 ? netIncome / revenue : null,
      roa: totalAssets > 0 ? netIncome / totalAssets : null,
      equityRatio: totalAssets > 0 ? totalEquity / totalAssets : null,
    };
  }

  async getAccountStatement(companyId: string, accountId: string, periodId: string) {
    const account = await this.prisma.account.findFirst({
      where: { id: accountId, companyId },
    });

    if (!account) return null;

    const lines = await this.prisma.journalEntryLine.findMany({
      where: {
        companyId,
        accountId,
        journalEntry: { accountingPeriodId: periodId, status: 'POSTED' },
      },
      include: {
        journalEntry: {
          select: { id: true, number: true, description: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    let runningBalance = 0;
    const entries = lines.map((line) => {
      const debit = line.debit.toNumber();
      const credit = line.credit.toNumber();
      runningBalance += account.nature * (debit - credit);

      return {
        id: line.id,
        date: line.createdAt,
        description: line.description ?? line.journalEntry.description,
        journalEntryNumber: line.journalEntry.number,
        debit,
        credit,
        runningBalance,
      };
    });

    return {
      account: { id: account.id, code: account.code, name: account.name, type: account.type },
      entries,
    };
  }
}
