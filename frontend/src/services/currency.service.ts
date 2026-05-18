import { api } from "@/lib/api";
import type { Currency } from "@/types";

export interface ExchangeRateEntry {
  id: string;
  rate: number;
  date: string;
  createdAt: string;
}

export interface CurrentRate {
  currencyId: string;
  code: string;
  name: string;
  symbol: string;
  currentRate: number;
  isDefault: boolean;
}

export interface RevaluationResult {
  id: string;
  date: string;
  description: string;
  status: string;
  totalGainLoss: number;
  createdAt: string;
  lines: RevaluationLine[];
}

export interface RevaluationLine {
  id: string;
  currencyCode: string;
  previousRate: number;
  currentRate: number;
  balanceBefore: number;
  balanceAfter: number;
  gainLoss: number;
  accountId: string;
  account?: { code: string; name: string };
}

export const currencyService = {
  list: () => api.get<Currency[]>("/currencies"),
  create: (data: Partial<Currency>) => api.post<Currency>("/currencies", data),
  update: (id: string, data: Partial<Currency>) =>
    api.put<Currency>(`/currencies/${id}`, data),
  remove: (id: string) => api.delete(`/currencies/${id}`),

  getExchangeRates: (currencyId: string) =>
    api.get<ExchangeRateEntry[]>(`/currencies/${currencyId}/exchange-rates`),
  createExchangeRate: (currencyId: string, data: { rate: number; date?: string }) =>
    api.post<ExchangeRateEntry>(`/currencies/${currencyId}/exchange-rates`, data),
  getCurrentRates: () => api.get<CurrentRate[]>("/exchange-rates/current"),

  runRevaluation: (data: { accountingPeriodId: string; date?: string; description?: string }) =>
    api.post<RevaluationResult>("/accounting/revaluation/run", data),
  getRevaluations: () => api.get<RevaluationResult[]>("/accounting/revaluation"),
  getRevaluation: (id: string) => api.get<RevaluationResult>(`/accounting/revaluation/${id}`),
};
