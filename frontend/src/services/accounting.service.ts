import { api } from "@/lib/api";
import type { PaginatedResponse } from "@/types";

export interface Account {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: "ASSET" | "LIABILITY" | "EQUITY" | "INCOME" | "EXPENSE";
  nature: number;
  level: number;
  isActive: boolean;
  children?: Account[];
}

export interface JournalEntry {
  id: string;
  number: number;
  description: string;
  reference?: string;
  status: "DRAFT" | "POSTED" | "CANCELLED";
  totalDebit: number;
  totalCredit: number;
  postedAt?: string;
  createdAt: string;
  lines: JournalEntryLine[];
}

export interface JournalEntryLine {
  id: string;
  debit: number;
  credit: number;
  description?: string;
  accountId: string;
  account: Account;
  costCenterId?: string;
}

export interface BalanceSheet {
  assets: { code: string; name: string; balance: number }[];
  liabilities: { code: string; name: string; balance: number }[];
  equity: { code: string; name: string; balance: number }[];
  totals: { assets: number; liabilities: number; equity: number };
}

export interface IncomeStatement {
  revenues: { code: string; name: string; amount: number }[];
  expenses: { code: string; name: string; amount: number }[];
  totals: { revenue: number; expenses: number; netIncome: number };
}

export interface FinancialKpis {
  currentRatio: number;
  debtRatio: number;
  profitMargin: number;
  roa: number;
}

export const accountingService = {
  // Chart of Accounts
  getChartOfAccounts: () => api.get<Account[]>("/accounting/accounts/tree"),
  createAccount: (data: Partial<Account>) => api.post<Account>("/accounting/accounts", data),
  updateAccount: (id: string, data: Partial<Account>) => api.put<Account>(`/accounting/accounts/${id}`, data),

  // Journal Entries
  getJournalEntries: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<JournalEntry>>("/accounting/journal-entries", params),
  getJournalEntry: (id: string) => api.get<JournalEntry>(`/accounting/journal-entries/${id}`),
  createJournalEntry: (data: unknown) => api.post<JournalEntry>("/accounting/journal-entries", data),
  postJournalEntry: (id: string) => api.post<JournalEntry>(`/accounting/journal-entries/${id}/post`),
  cancelJournalEntry: (id: string, reason: string) =>
    api.post<JournalEntry>(`/accounting/journal-entries/${id}/cancel`, { reason }),

  // Financial Reports
  getBalanceSheet: (periodId: string) =>
    api.get<BalanceSheet>("/financial-reports/balance-sheet", { periodId }),
  getIncomeStatement: (periodId: string) =>
    api.get<IncomeStatement>("/financial-reports/income-statement", { periodId }),
  getTrialBalance: (periodId: string) =>
    api.get<unknown[]>("/financial-reports/trial-balance", { periodId }),
  getKpis: (periodId: string) =>
    api.get<FinancialKpis>("/financial-reports/kpis", { periodId }),

  // Periods
  getOpenPeriods: () => api.get<{ id: string; year: number; month: number; status: string }[]>("/accounting-periods/open"),
};
