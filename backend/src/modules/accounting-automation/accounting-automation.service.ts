import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

const DEFAULT_ACCOUNTS_RECEIVABLE = '1.1.1';
const DEFAULT_SALES_REVENUE = '4.1.1';
const DEFAULT_OUTPUT_VAT = '2.1.1';
const DEFAULT_CASH = '1.1.3';
const DEFAULT_INVENTORY = '1.2.1';
const DEFAULT_INPUT_VAT = '1.1.4';
const DEFAULT_ACCOUNTS_PAYABLE = '2.2.1';
const DEFAULT_RETAINED_EARNINGS = '3.1.2';

@Injectable()
export class AccountingAutomationService {
  constructor(private prisma: PrismaService) {}

  async generateInvoiceEntry(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { company: true },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (!invoice.customerId) throw new BadRequestException('Invoice has no customer');
    const companyId = invoice.companyId;

    const reference = `INVOICE:${invoiceId}`;
    const existing = await this.prisma.journalEntry.findFirst({
      where: { companyId, reference },
    });
    if (existing) throw new ConflictException('Journal entry already exists for this invoice');

    const userId = invoice.companyId;
    const period = await this.getOrCreatePeriod(companyId, invoice.issueDate);

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

      const arAccount = await this.resolveAccount(tx, companyId, 'account_receivable_code', DEFAULT_ACCOUNTS_RECEIVABLE);
      const revenueAccount = await this.resolveAccount(tx, companyId, 'sales_revenue_code', DEFAULT_SALES_REVENUE);
      const vatAccount = await this.resolveAccount(tx, companyId, 'output_vat_code', DEFAULT_OUTPUT_VAT);

      return tx.journalEntry.create({
        data: {
          number,
          description: `Invoice ${invoice.documentNumber}`,
          reference,
          status: 'POSTED',
          totalDebit: Number(invoice.total),
          totalCredit: Number(invoice.total),
          postedAt: new Date(),
          companyId,
          accountingPeriodId: period.id,
          createdById: userId,
          lines: {
            create: [
              {
                debit: Number(invoice.total),
                credit: 0,
                description: `Accounts Receivable - ${invoice.documentNumber}`,
                accountId: arAccount.id,
                companyId,
              },
              {
                debit: 0,
                credit: Number(invoice.subtotal),
                description: `Sales Revenue - ${invoice.documentNumber}`,
                accountId: revenueAccount.id,
                companyId,
              },
              {
                debit: 0,
                credit: Number(invoice.taxTotal),
                description: `Output VAT - ${invoice.documentNumber}`,
                accountId: vatAccount.id,
                companyId,
              },
            ],
          },
        },
        include: { lines: true },
      });
    });
  }

  async generatePaymentEntry(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { invoice: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    const companyId = payment.companyId;

    const reference = `PAYMENT:${paymentId}`;
    const existing = await this.prisma.journalEntry.findFirst({
      where: { companyId, reference },
    });
    if (existing) throw new ConflictException('Journal entry already exists for this payment');

    const period = await this.getOrCreatePeriod(companyId, payment.paymentDate);

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

      const cashAccount = await this.resolveAccount(tx, companyId, 'cash_code', DEFAULT_CASH);
      const arAccount = await this.resolveAccount(tx, companyId, 'account_receivable_code', DEFAULT_ACCOUNTS_RECEIVABLE);

      return tx.journalEntry.create({
        data: {
          number,
          description: `Payment ${payment.paymentNumber}`,
          reference,
          status: 'POSTED',
          totalDebit: Number(payment.amount),
          totalCredit: Number(payment.amount),
          postedAt: new Date(),
          companyId,
          accountingPeriodId: period.id,
          createdById: companyId,
          lines: {
            create: [
              {
                debit: Number(payment.amount),
                credit: 0,
                description: `Cash - ${payment.paymentNumber}`,
                accountId: cashAccount.id,
                companyId,
              },
              {
                debit: 0,
                credit: Number(payment.amount),
                description: `Accounts Receivable - ${payment.paymentNumber}`,
                accountId: arAccount.id,
                companyId,
              },
            ],
          },
        },
        include: { lines: true },
      });
    });
  }

  async generatePurchaseEntry(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (!invoice.supplierId) throw new BadRequestException('Invoice has no supplier');
    const companyId = invoice.companyId;

    const reference = `PURCHASE:${invoiceId}`;
    const existing = await this.prisma.journalEntry.findFirst({
      where: { companyId, reference },
    });
    if (existing) throw new ConflictException('Journal entry already exists for this purchase');

    const period = await this.getOrCreatePeriod(companyId, invoice.issueDate);

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

      const inventoryAccount = await this.resolveAccount(tx, companyId, 'inventory_code', DEFAULT_INVENTORY);
      const inputVatAccount = await this.resolveAccount(tx, companyId, 'input_vat_code', DEFAULT_INPUT_VAT);
      const apAccount = await this.resolveAccount(tx, companyId, 'accounts_payable_code', DEFAULT_ACCOUNTS_PAYABLE);

      return tx.journalEntry.create({
        data: {
          number,
          description: `Purchase ${invoice.documentNumber}`,
          reference,
          status: 'POSTED',
          totalDebit: Number(invoice.total),
          totalCredit: Number(invoice.total),
          postedAt: new Date(),
          companyId,
          accountingPeriodId: period.id,
          createdById: companyId,
          lines: {
            create: [
              {
                debit: Number(invoice.subtotal),
                credit: 0,
                description: `Inventory - ${invoice.documentNumber}`,
                accountId: inventoryAccount.id,
                companyId,
              },
              {
                debit: Number(invoice.taxTotal),
                credit: 0,
                description: `Input VAT - ${invoice.documentNumber}`,
                accountId: inputVatAccount.id,
                companyId,
              },
              {
                debit: 0,
                credit: Number(invoice.total),
                description: `Accounts Payable - ${invoice.documentNumber}`,
                accountId: apAccount.id,
                companyId,
              },
            ],
          },
        },
        include: { lines: true },
      });
    });
  }

  async generateCreditNoteEntry(creditNoteId: string) {
    const creditNote = await this.prisma.invoice.findUnique({
      where: { id: creditNoteId },
    });
    if (!creditNote) throw new NotFoundException('Credit note not found');
    if (!creditNote.customerId) throw new BadRequestException('Credit note has no customer');
    const companyId = creditNote.companyId;

    const reference = `CREDIT_NOTE:${creditNoteId}`;
    const existing = await this.prisma.journalEntry.findFirst({
      where: { companyId, reference },
    });
    if (existing) throw new ConflictException('Journal entry already exists for this credit note');

    const period = await this.getOrCreatePeriod(companyId, creditNote.issueDate);

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

      const arAccount = await this.resolveAccount(tx, companyId, 'account_receivable_code', DEFAULT_ACCOUNTS_RECEIVABLE);
      const revenueAccount = await this.resolveAccount(tx, companyId, 'sales_revenue_code', DEFAULT_SALES_REVENUE);
      const vatAccount = await this.resolveAccount(tx, companyId, 'output_vat_code', DEFAULT_OUTPUT_VAT);

      return tx.journalEntry.create({
        data: {
          number,
          description: `Credit Note ${creditNote.documentNumber}`,
          reference,
          status: 'POSTED',
          totalDebit: Number(creditNote.total),
          totalCredit: Number(creditNote.total),
          postedAt: new Date(),
          companyId,
          accountingPeriodId: period.id,
          createdById: companyId,
          lines: {
            create: [
              {
                debit: Number(creditNote.subtotal),
                credit: 0,
                description: `Sales Returns - ${creditNote.documentNumber}`,
                accountId: revenueAccount.id,
                companyId,
              },
              {
                debit: Number(creditNote.taxTotal),
                credit: 0,
                description: `Output VAT Reversal - ${creditNote.documentNumber}`,
                accountId: vatAccount.id,
                companyId,
              },
              {
                debit: 0,
                credit: Number(creditNote.total),
                description: `Accounts Receivable - ${creditNote.documentNumber}`,
                accountId: arAccount.id,
                companyId,
              },
            ],
          },
        },
        include: { lines: true },
      });
    });
  }

  async generateClosingEntry(companyId: string, periodId: string, userId: string) {
    const period = await this.prisma.accountingPeriod.findFirst({
      where: { id: periodId, companyId },
    });
    if (!period) throw new NotFoundException('Accounting period not found');

    const reference = `CLOSING:${periodId}`;
    const existing = await this.prisma.journalEntry.findFirst({
      where: { companyId, reference },
    });
    if (existing) throw new ConflictException('Closing entry already exists for this period');

    const incomeAccounts = await this.prisma.account.findMany({
      where: { companyId, type: 'INCOME', isActive: true },
    });

    const expenseAccounts = await this.prisma.account.findMany({
      where: { companyId, type: 'EXPENSE', isActive: true },
    });

    const incomeBalances = await Promise.all(
      incomeAccounts.map((acc) =>
        this.prisma.journalEntryLine.aggregate({
          where: {
            companyId,
            accountId: acc.id,
            journalEntry: { accountingPeriodId: periodId, status: 'POSTED' },
          },
          _sum: { debit: true, credit: true },
        }).then((r) => ({
          accountId: acc.id,
          balance: (r._sum.debit?.toNumber() ?? 0) - (r._sum.credit?.toNumber() ?? 0),
        })),
      ),
    );

    const expenseBalances = await Promise.all(
      expenseAccounts.map((acc) =>
        this.prisma.journalEntryLine.aggregate({
          where: {
            companyId,
            accountId: acc.id,
            journalEntry: { accountingPeriodId: periodId, status: 'POSTED' },
          },
          _sum: { debit: true, credit: true },
        }).then((r) => ({
          accountId: acc.id,
          balance: (r._sum.debit?.toNumber() ?? 0) - (r._sum.credit?.toNumber() ?? 0),
        })),
      ),
    );

    const totalIncome = incomeBalances.reduce((sum, ib) => sum + ib.balance, 0);
    const totalExpense = expenseBalances.reduce((sum, eb) => sum + Math.abs(eb.balance), 0);
    const netIncome = totalIncome - totalExpense;

    const lines: any[] = [];

    for (const ib of incomeBalances) {
      if (ib.balance === 0) continue;
      lines.push({
        debit: 0,
        credit: Math.abs(ib.balance),
        description: 'Close income account',
        accountId: ib.accountId,
        companyId,
      });
    }

    for (const eb of expenseBalances) {
      if (eb.balance === 0) continue;
      lines.push({
        debit: Math.abs(eb.balance),
        credit: 0,
        description: 'Close expense account',
        accountId: eb.accountId,
        companyId,
      });
    }

    const reAccount = await this.prisma.account.findFirst({
      where: { companyId, code: DEFAULT_RETAINED_EARNINGS },
    });
    if (!reAccount) throw new NotFoundException(`Retained earnings account (${DEFAULT_RETAINED_EARNINGS}) not found`);

    if (netIncome >= 0) {
      lines.push({
        debit: netIncome,
        credit: 0,
        description: 'Net income to retained earnings',
        accountId: reAccount.id,
        companyId,
      });
    } else {
      lines.push({
        debit: 0,
        credit: Math.abs(netIncome),
        description: 'Net loss to retained earnings',
        accountId: reAccount.id,
        companyId,
      });
    }

    const totalDebit = lines.reduce((s: number, l: any) => s + l.debit, 0);
    const totalCredit = lines.reduce((s: number, l: any) => s + l.credit, 0);

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
          description: `Closing entry for period ${period.year}-${String(period.month).padStart(2, '0')}`,
          reference,
          status: 'POSTED',
          totalDebit,
          totalCredit,
          postedAt: new Date(),
          companyId,
          accountingPeriodId: periodId,
          createdById: userId,
          lines: { create: lines },
        },
        include: { lines: true },
      });
    });
  }

  private async resolveAccount(tx: any, companyId: string, settingKey: string, defaultCode: string) {
    const setting = await tx.companySetting.findUnique({
      where: { companyId_key: { companyId, key: settingKey } },
    });
    const code = setting?.value ?? defaultCode;
    const account = await tx.account.findFirst({
      where: { companyId, code },
    });
    if (!account) throw new NotFoundException(`Account with code ${code} not found (setting: ${settingKey})`);
    return account;
  }

  private async getOrCreatePeriod(companyId: string, date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    let period = await this.prisma.accountingPeriod.findUnique({
      where: { companyId_year_month: { companyId, year, month } },
    });

    if (!period) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      period = await this.prisma.accountingPeriod.create({
        data: { year, month, startDate, endDate, companyId },
      });
    }

    return period;
  }
}
