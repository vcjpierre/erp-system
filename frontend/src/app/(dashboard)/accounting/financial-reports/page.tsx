"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { FileText, Download } from "lucide-react";

const mockBalanceSheet = {
  assets: [
    { code: "1.1.1", name: "Cash & Cash Equivalents", balance: 850000 },
    { code: "1.1.2", name: "Accounts Receivable", balance: 420000 },
    { code: "1.2.1", name: "Inventory", balance: 380000 },
    { code: "1.3.1", name: "Fixed Assets", balance: 1200000 },
  ],
  liabilities: [
    { code: "2.1.1", name: "Accounts Payable", balance: 310000 },
    { code: "2.2.1", name: "Short-term Debt", balance: 180000 },
    { code: "2.3.1", name: "Long-term Debt", balance: 650000 },
  ],
  equity: [
    { code: "3.1.1", name: "Share Capital", balance: 1000000 },
    { code: "3.1.2", name: "Retained Earnings", balance: 710000 },
  ],
  totals: { assets: 2850000, liabilities: 1140000, equity: 1710000 },
};

const mockIncomeStatement = {
  revenues: [
    { code: "4.1.1", name: "Product Sales", amount: 1250000 },
    { code: "4.1.2", name: "Services", amount: 680000 },
    { code: "4.1.3", name: "Other Income", amount: 45000 },
  ],
  expenses: [
    { code: "5.1.1", name: "Cost of Goods Sold", amount: 780000 },
    { code: "5.2.1", name: "Salaries & Wages", amount: 520000 },
    { code: "5.2.2", name: "Rent & Utilities", amount: 180000 },
    { code: "5.3.1", name: "Operating Expenses", amount: 240000 },
  ],
  totals: { revenue: 1985000, expenses: 1720000, netIncome: 265000 },
};

export default function FinancialReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financial Reports</h1>
          <p className="text-muted-foreground">Balance sheet, income statement, and cash flow</p>
        </div>
        <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
      </div>

      <Tabs defaultValue="balance-sheet">
        <TabsList>
          <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
          <TabsTrigger value="income-statement">Income Statement</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="balance-sheet" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>Balance Sheet</CardTitle><CardDescription>As of current period</CardDescription></CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-blue-600 mb-2">Assets</h3>
                  <div className="divide-y divide-border">
                    {mockBalanceSheet.assets.map((a) => (
                      <div key={a.code} className="flex items-center justify-between py-2 text-sm">
                        <span><span className="text-muted-foreground mr-2">{a.code}</span>{a.name}</span>
                        <span className="font-medium">{formatCurrency(a.balance)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between py-2 text-sm font-bold">
                      <span>Total Assets</span>
                      <span>{formatCurrency(mockBalanceSheet.totals.assets)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-orange-600 mb-2">Liabilities</h3>
                  <div className="divide-y divide-border">
                    {mockBalanceSheet.liabilities.map((l) => (
                      <div key={l.code} className="flex items-center justify-between py-2 text-sm">
                        <span><span className="text-muted-foreground mr-2">{l.code}</span>{l.name}</span>
                        <span className="font-medium">{formatCurrency(l.balance)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between py-2 text-sm font-bold">
                      <span>Total Liabilities</span>
                      <span>{formatCurrency(mockBalanceSheet.totals.liabilities)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-green-600 mb-2">Equity</h3>
                  <div className="divide-y divide-border">
                    {mockBalanceSheet.equity.map((e) => (
                      <div key={e.code} className="flex items-center justify-between py-2 text-sm">
                        <span><span className="text-muted-foreground mr-2">{e.code}</span>{e.name}</span>
                        <span className="font-medium">{formatCurrency(e.balance)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between py-2 text-sm font-bold">
                      <span>Total Equity</span>
                      <span>{formatCurrency(mockBalanceSheet.totals.equity)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income-statement" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>Income Statement</CardTitle><CardDescription>Current period</CardDescription></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-green-600 mb-2">Revenue</h3>
                  <div className="divide-y divide-border">
                    {mockIncomeStatement.revenues.map((r) => (
                      <div key={r.code} className="flex items-center justify-between py-2 text-sm">
                        <span><span className="text-muted-foreground mr-2">{r.code}</span>{r.name}</span>
                        <span className="font-medium">{formatCurrency(r.amount)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between py-2 text-sm font-bold">
                      <span>Total Revenue</span>
                      <span>{formatCurrency(mockIncomeStatement.totals.revenue)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-red-600 mb-2">Expenses</h3>
                  <div className="divide-y divide-border">
                    {mockIncomeStatement.expenses.map((e) => (
                      <div key={e.code} className="flex items-center justify-between py-2 text-sm">
                        <span><span className="text-muted-foreground mr-2">{e.code}</span>{e.name}</span>
                        <span className="font-medium">{formatCurrency(e.amount)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between py-2 text-sm font-bold">
                      <span>Total Expenses</span>
                      <span>{formatCurrency(mockIncomeStatement.totals.expenses)}</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex items-center justify-between text-base font-bold">
                    <span>Net Income</span>
                    <span className={mockIncomeStatement.totals.netIncome >= 0 ? "text-green-600" : "text-red-600"}>
                      {formatCurrency(mockIncomeStatement.totals.netIncome)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cash-flow" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>Cash Flow Statement</CardTitle><CardDescription>Current period</CardDescription></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border border-border p-4">
                  <h3 className="text-sm font-semibold mb-2">Operating Activities</h3>
                  <div className="divide-y divide-border text-sm">
                    <div className="flex justify-between py-1"><span>Net Income</span><span className="font-medium text-green-600">{formatCurrency(265000)}</span></div>
                    <div className="flex justify-between py-1"><span>Depreciation & Amortization</span><span className="font-medium">+{formatCurrency(45000)}</span></div>
                    <div className="flex justify-between py-1"><span>Accounts Receivable Change</span><span className="font-medium text-red-600">-{formatCurrency(32000)}</span></div>
                    <div className="flex justify-between py-1 font-bold"><span>Net Operating Cash Flow</span><span className="text-green-600">{formatCurrency(278000)}</span></div>
                  </div>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <h3 className="text-sm font-semibold mb-2">Investing Activities</h3>
                  <div className="divide-y divide-border text-sm">
                    <div className="flex justify-between py-1"><span>Equipment Purchase</span><span className="font-medium text-red-600">-{formatCurrency(85000)}</span></div>
                    <div className="flex justify-between py-1 font-bold"><span>Net Investing Cash Flow</span><span className="text-red-600">-{formatCurrency(85000)}</span></div>
                  </div>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <h3 className="text-sm font-semibold mb-2">Financing Activities</h3>
                  <div className="divide-y divide-border text-sm">
                    <div className="flex justify-between py-1"><span>Loan Proceeds</span><span className="font-medium text-green-600">{formatCurrency(50000)}</span></div>
                    <div className="flex justify-between py-1 font-bold"><span>Net Financing Cash Flow</span><span className="text-green-600">{formatCurrency(50000)}</span></div>
                  </div>
                </div>
                <div className="border-t border-border pt-3 flex justify-between text-base font-bold">
                  <span>Net Change in Cash</span><span className="text-green-600">{formatCurrency(243000)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
