"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw, Package, CheckCircle2, AlertTriangle,
  ArrowUpDown, ShoppingCart, Warehouse, Play,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type SyncStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";

interface SyncActivity {
  id: string;
  entityType: string;
  entityId: string;
  status: SyncStatus;
  syncedAt: string;
}

const statsCards = [
  { title: "Pending Syncs", value: "23", icon: RefreshCw, color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/20" },
  { title: "Completed", value: "1,847", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/20" },
  { title: "Failed", value: "12", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/20" },
  { title: "Products in Catalog", value: "4,321", icon: Package, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/20" },
];

const recentSyncs: SyncActivity[] = [
  { id: "S-001", entityType: "Product", entityId: "PRD-001", status: "COMPLETED", syncedAt: "2 min ago" },
  { id: "S-002", entityType: "Stock", entityId: "STK-045", status: "IN_PROGRESS", syncedAt: "5 min ago" },
  { id: "S-003", entityType: "Order", entityId: "ORD-2024-892", status: "PENDING", syncedAt: "10 min ago" },
  { id: "S-004", entityType: "Product", entityId: "PRD-023", status: "FAILED", syncedAt: "15 min ago" },
  { id: "S-005", entityType: "Stock", entityId: "STK-012", status: "COMPLETED", syncedAt: "20 min ago" },
  { id: "S-006", entityType: "Order", entityId: "ORD-2024-893", status: "PENDING", syncedAt: "25 min ago" },
  { id: "S-007", entityType: "Product", entityId: "PRD-067", status: "COMPLETED", syncedAt: "30 min ago" },
  { id: "S-008", entityType: "Stock", entityId: "STK-078", status: "FAILED", syncedAt: "1 hr ago" },
];

function statusBadge(status: SyncStatus) {
  const config = {
    PENDING: { variant: "warning" as const, label: "Pending" },
    IN_PROGRESS: { variant: "secondary" as const, label: "In Progress" },
    COMPLETED: { variant: "success" as const, label: "Completed" },
    FAILED: { variant: "destructive" as const, label: "Failed" },
  };
  return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function StatCard({ stat }: { stat: typeof statsCards[number] }) {
  const Icon = stat.icon;
  return (
    <motion.div variants={item}>
      <Card className="transition-all hover:shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
            <div className={cn("rounded-lg p-3", stat.bg)}>
              <Icon className={cn("h-5 w-5", stat.color)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function EcommerceSyncPage() {
  return (
    <motion.div initial="hidden" animate="show" variants={container} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ecommerce Sync</h1>
        <p className="text-muted-foreground">Catalog, stock and order synchronization</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <StatCard key={stat.title} stat={stat} />
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button className="gap-2">
          <RefreshCw className="h-4 w-4" /> Sync Products
        </Button>
        <Button variant="outline" className="gap-2">
          <Warehouse className="h-4 w-4" /> Sync Stock
        </Button>
        <Button variant="secondary" className="gap-2">
          <Play className="h-4 w-4" /> Process Pending
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium">Recent Sync Activity</CardTitle>
            <p className="text-sm text-muted-foreground">Latest synchronization records</p>
          </div>
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            <ArrowUpDown className="h-3 w-3" /> Filter
          </Button>
        </CardHeader>
        <CardContent>
          {recentSyncs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <RefreshCw className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <h3 className="text-sm font-medium">No sync activity</h3>
              <p className="text-xs text-muted-foreground">Recent syncs will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left font-medium text-muted-foreground">Entity</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">ID</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">Synced At</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSyncs.map((sync) => (
                    <tr key={sync.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="py-3 font-medium">{sync.entityType}</td>
                      <td className="py-3 text-muted-foreground">{sync.entityId}</td>
                      <td className="py-3">{statusBadge(sync.status)}</td>
                      <td className="py-3 text-right text-muted-foreground">{sync.syncedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
