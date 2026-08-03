"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { DataTable, Column } from "@/components/shared/data-table";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Activity, Clock, Package, Database, Server, RefreshCw } from "lucide-react";

interface MonitoringMetrics {
  totalUsers: number;
  activeSessions: number;
  pendingApprovals: number;
  totalProducts: number;
  dbStatus: string;
  cacheStatus: string;
  lastActivity: string;
}

interface ActivityItem {
  id: string;
  date: string;
  user: string;
  action: string;
  entity: string;
}

export default function MonitoringPage() {
  const [metrics, setMetrics] = useState<MonitoringMetrics | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<MonitoringMetrics>("/monitoring/metrics"),
      api.get<ActivityItem[]>("/monitoring/activity"),
    ])
      .then(([metricsData, activityData]) => {
        setMetrics(metricsData);
        setActivities(activityData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { title: "Total Users", value: metrics?.totalUsers ?? "-", icon: <Users className="h-5 w-5" />, description: "Registered accounts" },
    { title: "Active Sessions", value: metrics?.activeSessions ?? "-", icon: <Activity className="h-5 w-5" />, description: "Currently connected" },
    { title: "Pending Approvals", value: metrics?.pendingApprovals ?? "-", icon: <Clock className="h-5 w-5" />, description: "Needs attention" },
    { title: "Total Products", value: metrics?.totalProducts ?? "-", icon: <Package className="h-5 w-5" />, description: "Active SKUs" },
  ];

  const healthCards = [
    { title: "Database Status", value: metrics?.dbStatus ?? "-", icon: <Database className="h-5 w-5" />, variant: metrics?.dbStatus === "healthy" ? "success" : "destructive" as const },
    { title: "Cache Status", value: metrics?.cacheStatus ?? "-", icon: <Server className="h-5 w-5" />, variant: metrics?.cacheStatus === "healthy" ? "success" : "warning" as const },
    { title: "Last Activity", value: metrics?.lastActivity ? formatDate(metrics.lastActivity, "relative") : "-", icon: <RefreshCw className="h-5 w-5" /> },
  ];

  const columns: Column<ActivityItem>[] = [
    { key: "date", label: "Date", render: (item) => formatDate(item.date, "relative"), sortable: true },
    { key: "user", label: "User", sortable: true },
    { key: "action", label: "Action" },
    { key: "entity", label: "Entity" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="System Monitoring" description="System health, performance metrics and observability" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-4">System Health</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {healthCards.map((card) => (
            <div key={card.title} className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <div className="p-2 rounded-md bg-primary/10 text-primary">{card.icon}</div>
              </div>
              <p className="text-xl font-bold mt-2">{card.value}</p>
              {"variant" in card && card.variant && (
                <div className={`mt-2 h-2 w-full rounded-full ${card.variant === "success" ? "bg-green-500" : "bg-red-500"}`} style={{ width: "60%" }} />
              )}
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Activity Feed</h2>
        <DataTable columns={columns} data={activities} keyExtractor={(item) => item.id} searchable={false} pageSize={10} loading={loading} />
      </div>
    </div>
  );
}
