import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RunRevaluationDto } from './dto/run-revaluation.dto';

const DEFAULT_FX_GAIN_ACCOUNT = '4.4.1';
const DEFAULT_FX_LOSS_ACCOUNT = '5.4.1';

@Injectable()
export class CurrencyRevaluationService {
  constructor(private prisma: PrismaService) {}

  async run(companyId: string, userId: string, dto: RunRevaluationDto) {
    const period = await this.prisma.accountingPeriod.findFirst({
      where: { id: dto.accountingPeriodId, companyId },
    });
    if (!period) throw new NotFoundException('Accounting period not found');

    const revaluationDate = dto.date ? new Date(dto.date) : new Date();

    const monetaryAccounts = await this.prisma.account.findMany({
      where: { companyId, monetary: true, isActive: true, isLeaf: true },
    });
    if (monetaryAccounts.length === 0) {
      throw new BadRequestException('No monetary accounts configured. Mark accounts as monetary first.');
    }

    const currencies = await this.prisma.currency.findMany({
      where: { companyId, isActive: true },
    });

    const defaultCurrency = currencies.find((c) => c.isDefault);
    if (!defaultCurrency) throw new BadRequestException('No default currency configured');

    const lines: Array<{
      currencyCode: string;
      previousRate: number;
      currentRate: number;
      balanceBefore: number;
      balanceAfter: number;
      gainLoss: number;
      accountId: string;
      companyId: string;
    }> = [];

    for (const account of monetaryAccounts) {
      for (const currency of currencies) {
        if (currency.isDefault) continue;

        const balanceResult = await this.prisma.journalEntryLine.aggregate({
          where: {
            accountId: account.id,
            companyId,
            journalEntry: {
              status: 'POSTED',
              accountingPeriodId: { lte: dto.accountingPeriodId },
            },
          },
          _sum: { debit: true, credit: true },
        });

        const totalDebit = Number(balanceResult._sum?.debit || 0);
        const totalCredit = Number(balanceResult._sum?.credit || 0);
        const balance = account.nature === 1 ? totalDebit - totalCredit : totalCredit - totalDebit;

        if (balance === 0) continue;

        const latestRate = await this.prisma.exchangeRate.findFirst({
          where: { currencyId: currency.id },
          orderBy: { date: 'desc' },
        });

        if (!latestRate) continue;

        const currentRate = Number(latestRate.rate);
        const previousRate = Number(currency.exchangeRate);
        const balanceInDefault = balance / previousRate;
        const revaluedBalance = balanceInDefault * currentRate;
        const gainLoss = revaluedBalance - balance;

        if (Math.abs(gainLoss) < 0.01) continue;

        lines.push({
          currencyCode: currency.code,
          previousRate,
          currentRate,
          balanceBefore: balance,
          balanceAfter: revaluedBalance,
          gainLoss,
          accountId: account.id,
          companyId,
        });
      }
    }

    if (lines.length === 0) {
      throw new BadRequestException('No revaluation adjustments needed');
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

      const totalGainLoss = lines.reduce((s, l) => s + l.gainLoss, 0);

      const revaluation = await tx.currencyRevaluation.create({
        data: {
          date: revaluationDate,
          description: dto.description || `Currency revaluation - ${period.year}-${String(period.month).padStart(2, '0')}`,
          status: 'POSTED',
          totalGainLoss,
          companyId,
          accountingPeriodId: period.id,
          lines: { create: lines },
        },
        include: { lines: true },
      });

      const jnLines: Array<{
        debit: number;
        credit: number;
        description: string;
        accountId: string;
        companyId: string;
      }> = [];

      const fxGainAccount = await tx.account.findFirst({
        where: { companyId, code: DEFAULT_FX_GAIN_ACCOUNT },
      });
      const fxLossAccount = await tx.account.findFirst({
        where: { companyId, code: DEFAULT_FX_LOSS_ACCOUNT },
      });

      if (!fxGainAccount || !fxLossAccount) {
        throw new NotFoundException(
          `FX accounts not found. Create accounts with codes ${DEFAULT_FX_GAIN_ACCOUNT} (FX Gain) and ${DEFAULT_FX_LOSS_ACCOUNT} (FX Loss)`,
        );
      }

      for (const line of lines) {
        const account = monetaryAccounts.find((a) => a.id === line.accountId)!;
        jnLines.push({
          debit: line.gainLoss > 0 ? line.gainLoss : 0,
          credit: line.gainLoss < 0 ? Math.abs(line.gainLoss) : 0,
          description: `FX ${line.gainLoss > 0 ? 'Gain' : 'Loss'} - ${account.code} ${account.name} (${line.currencyCode})`,
          accountId: line.accountId,
          companyId,
        });
      }

      const totalGain = lines.filter((l) => l.gainLoss > 0).reduce((s, l) => s + l.gainLoss, 0);
      const totalLoss = lines.filter((l) => l.gainLoss < 0).reduce((s, l) => s + Math.abs(l.gainLoss), 0);

      if (totalGain > 0) {
        jnLines.push({
          debit: 0,
          credit: totalGain,
          description: 'Unrealized FX Gain',
          accountId: fxGainAccount.id,
          companyId,
        });
      }
      if (totalLoss > 0) {
        jnLines.push({
          debit: totalLoss,
          credit: 0,
          description: 'Unrealized FX Loss',
          accountId: fxLossAccount.id,
          companyId,
        });
      }

      const totalDebit = jnLines.reduce((s, l) => s + l.debit, 0);
      const totalCredit = jnLines.reduce((s, l) => s + l.credit, 0);

      await tx.journalEntry.create({
        data: {
          number,
          description: `Currency revaluation - ${period.year}-${String(period.month).padStart(2, '0')}`,
          reference: `REVALUATION:${revaluation.id}`,
          status: 'POSTED',
          totalDebit,
          totalCredit,
          postedAt: new Date(),
          companyId,
          accountingPeriodId: period.id,
          createdById: userId,
          lines: { create: jnLines },
        },
      });

      return revaluation;
    });
  }

  async findAll(companyId: string) {
    return this.prisma.currencyRevaluation.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      include: { lines: true },
    });
  }

  async findOne(companyId: string, id: string) {
    const revaluation = await this.prisma.currencyRevaluation.findFirst({
      where: { id, companyId },
      include: { lines: { include: { account: true } } },
    });
    if (!revaluation) throw new NotFoundException('Revaluation not found');
    return revaluation;
  }
}
