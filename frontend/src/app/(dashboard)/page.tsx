"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth-store";
import { generateAvatar, formatCurrency } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users,
  ArrowUpRight, ArrowDownRight, MoreHorizontal,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";

const stats = [
  { title: "Revenue", value: "$284,500", change: "+12.5%", trend: "up", icon: DollarSign },
  { title: "Orders", value: "1,842", change: "+8.2%", trend: "up", icon: ShoppingCart },
  { title: "Inventory", value: "4,321", change: "-3.1%", trend: "down", icon: Package },
  { title: "Active Users", value: "128", change: "+5.7%", trend: "up", icon: Users },
];

const revenueData = [
  { month: "Jan", revenue: 40000, expenses: 28000 },
  { month: "Feb", revenue: 35000, expenses: 25000 },
  { month: "Mar", revenue: 52000, expenses: 31000 },
  { month: "Apr", revenue: 48000, expenses: 29000 },
  { month: "May", revenue: 58000, expenses: 34000 },
  { month: "Jun", revenue: 62000, expenses: 35000 },
  { month: "Jul", revenue: 55000, expenses: 32000 },
  { month: "Aug", revenue: 68000, expenses: 38000 },
  { month: "Sep", revenue: 72000, expenses: 40000 },
  { month: "Oct", revenue: 65000, expenses: 37000 },
  { month: "Nov", revenue: 78000, expenses: 42000 },
  { month: "Dec", revenue: 85000, expenses: 45000 },
];

const salesByCategory = [
  { name: "Electronics", value: 35 },
  { name: "Clothing", value: 25 },
  { name: "Food", value: 20 },
  { name: "Services", value: 15 },
  { name: "Other", value: 5 },
];

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

const recentOrders = [
  { id: "ORD-001", customer: "Tech Corp", amount: 12450, status: "completed" as const, date: "2 min ago" },
  { id: "ORD-002", customer: "Global Services", amount: 8900, status: "pending" as const, date: "15 min ago" },
  { id: "ORD-003", customer: "Retail Store", amount: 3200, status: "processing" as const, date: "1 hr ago" },
  { id: "ORD-004", customer: "Manufacturing Inc", amount: 28700, status: "completed" as const, date: "3 hr ago" },
  { id: "ORD-005", customer: "Health Plus", amount: 5600, status: "cancelled" as const, date: "5 hr ago" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function StatCard({ stat, index }: { stat: (typeof stats)[0]; index: number }) {
  const Icon = stat.icon;
  return (
    <motion.div variants={item}>
      <Card className="overflow-hidden transition-all hover:shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
              <div className="flex items-center gap-1">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                  {stat.change}
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </div>
            <div className="rounded-lg bg-primary/10 p-3">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.firstName}
          </h1>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening today.</p>
        </div>
        <Badge variant="success" className="text-xs">
          System Online
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.title} stat={stat} index={index} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-medium">Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue vs expenses</CardDescription>
            </div>
            <Badge variant="outline">This year</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs text-muted-foreground" />
                  <YAxis className="text-xs text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#revenueGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="none" strokeWidth={2} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base font-medium">Sales by Category</CardTitle>
            <CardDescription>Distribution across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {salesByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {salesByCategory.map((cat, index) => (
                <div key={cat.name} className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-muted-foreground">{cat.name}</span>
                  <span className="ml-auto font-medium">{cat.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base font-medium">Recent Orders</CardTitle>
            <CardDescription>Latest transactions across the company</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            View all
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left font-medium text-muted-foreground pb-3">Order</th>
                  <th className="text-left font-medium text-muted-foreground pb-3">Customer</th>
                  <th className="text-right font-medium text-muted-foreground pb-3">Amount</th>
                  <th className="text-right font-medium text-muted-foreground pb-3">Status</th>
                  <th className="text-right font-medium text-muted-foreground pb-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-3 font-medium">{order.id}</td>
                    <td className="py-3 text-muted-foreground">{order.customer}</td>
                    <td className="py-3 text-right font-medium">{formatCurrency(order.amount)}</td>
                    <td className="py-3 text-right">
                      <Badge
                        variant={
                          order.status === "completed" ? "success" :
                          order.status === "pending" ? "warning" :
                          order.status === "cancelled" ? "destructive" : "secondary"
                        }
                        className="capitalize"
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right text-muted-foreground">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
