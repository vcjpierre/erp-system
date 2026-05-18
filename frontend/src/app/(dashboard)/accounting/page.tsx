"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { accountingService, type FinancialKpis } from "@/services/accounting.service";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign, TrendingUp, PieChart, FileText, ArrowUpRight,
  BookOpen, Receipt, BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area, PieChart as RPieChart,
  Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

const mockRevenueData = [
  { month: "Jan", revenue: 450000, expenses: 320000 },
  { month: "Feb", revenue: 520000, expenses: 380000 },
  { month: "Mar", revenue: 480000, expenses: 350000 },
  { month: "Apr", revenue: 580000, expenses: 410000 },
  { month: "May", revenue: 620000, expenses: 430000 },
  { month: "Jun", revenue: 550000, expenses: 390000 },
];

const mockExpenseBreakdown = [
  { name: "Salaries", value: 45 },
  { name: "Supplies", value: 20 },
  { name: "Services", value: 15 },
  { name: "Rent", value: 12 },
  { name: "Other", value: 8 },
];

const quickLinks = [
  { href: "/accounting/chart-of-accounts", label: "Chart of Accounts", icon: BookOpen, color: "text-blue-500" },
  { href: "/accounting/journal-entries", label: "Journal Entries", icon: Receipt, color: "text-purple-500" },
  { href: "/accounting/ledger", label: "General Ledger", icon: FileText, color: "text-green-500" },
  { href: "/accounting/financial-reports", label: "Financial Reports", icon: BarChart3, color: "text-orange-500" },
  { href: "/invoicing", label: "Invoicing", icon: DollarSign, color: "text-cyan-500" },
  { href: "/ar-ap", label: "AR / AP", icon: TrendingUp, color: "text-rose-500" },
];

export default function AccountingDashboardPage() {
  const [kpis, setKpis] = useState<FinancialKpis | null>(null);

  useEffect(() => {
    accountingService.getKpis("current").then(setKpis).catch(() => {});
  }, []);

  const statCards = [
    { title: "Current Ratio", value: kpis?.currentRatio?.toFixed(2) || "2.45", change: "+0.12", sub: "Healthy" },
    { title: "Profit Margin", value: `${kpis?.profitMargin?.toFixed(1) || "18.5"}%`, change: "+2.3%", sub: "vs last period" },
    { title: "Revenue", value: "$2.4M", change: "+12.5%", sub: "YTD" },
    { title: "Expenses", value: "$1.7M", change: "+8.2%", sub: "YTD" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Accounting</h1>
          <p className="text-muted-foreground">Financial overview and management</p>
        </div>
        <Link href="/accounting/journal-entries">
          <Button><Receipt className="mr-2 h-4 w-4" />New Journal Entry</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.title}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{s.title}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-green-500">{s.change}</span>
                <span className="text-xs text-muted-foreground">{s.sub}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Revenue vs Expenses</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockRevenueData}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#rev)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#exp)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Expense Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-[200px] w-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RPieChart>
                    <Pie data={mockExpenseBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                      {mockExpenseBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                  </RPieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {mockExpenseBreakdown.map((e, i) => (
                  <div key={e.name} className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-muted-foreground">{e.name}</span>
                    <span className="ml-auto font-medium">{e.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Quick Access</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
            {quickLinks.map((l) => {
              const Icon = l.icon;
              return (
                <Link key={l.href} href={l.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                      <Icon className={`h-8 w-8 ${l.color}`} />
                      <span className="text-sm font-medium">{l.label}</span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
