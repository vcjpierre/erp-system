"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { DataTable, Column } from "@/components/shared/data-table";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Users, AlertTriangle, Shield } from "lucide-react";

interface Session {
  id: string;
  status: string;
}

interface MonitoringMetrics {
  registeredUsers: number;
  failedLogins: number;
  activePolicies: number;
}

interface LoginHistoryEntry {
  id: string;
  user: string;
  date: string;
  ip: string;
  success: boolean;
  failureReason?: string;
}

export default function SecurityPage() {
  const [activeSessions, setActiveSessions] = useState(0);
  const [metrics, setMetrics] = useState<MonitoringMetrics | null>(null);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<Session[]>("/security/sessions"),
      api.get<MonitoringMetrics>("/monitoring/metrics"),
      api.get<LoginHistoryEntry[]>("/security/login-history", { limit: 10 }),
    ])
      .then(([sessions, metricsData, history]) => {
        setActiveSessions(sessions.filter((s) => s.status === "active").length);
        setMetrics(metricsData);
        setLoginHistory(history);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { title: "Active Sessions", value: activeSessions, icon: <Activity className="h-5 w-5" />, description: "Currently active" },
    { title: "Registered Users", value: metrics?.registeredUsers ?? "-", icon: <Users className="h-5 w-5" />, description: "Total accounts" },
    { title: "Failed Logins", value: metrics?.failedLogins ?? "-", icon: <AlertTriangle className="h-5 w-5" />, description: "Last 24 hours" },
    { title: "Active Policies", value: metrics?.activePolicies ?? "-", icon: <Shield className="h-5 w-5" />, description: "Security policies" },
  ];

  const columns: Column<LoginHistoryEntry>[] = [
    { key: "user", label: "User", sortable: true },
    { key: "date", label: "Date", render: (item) => formatDate(item.date, "relative"), sortable: true },
    { key: "ip", label: "IP Address", className: "font-mono text-xs" },
    { key: "success", label: "Success", render: (item) => (
      <Badge variant={item.success ? "success" : "destructive"}>{item.success ? "Yes" : "No"}</Badge>
    )},
    { key: "failureReason", label: "Failure Reason", render: (item) => item.failureReason || "-" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Security Dashboard" description="Security overview with active sessions and login history" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Login History</h2>
        <DataTable columns={columns} data={loginHistory} keyExtractor={(item) => item.id} searchable={false} pageSize={10} loading={loading} />
      </div>
    </div>
  );
}
