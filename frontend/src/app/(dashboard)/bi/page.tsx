"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, Column } from "@/components/shared/data-table";
import { StatCard } from "@/components/shared/stat-card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, ShoppingCart, Users, Package, UserCheck, Clock } from "lucide-react";

interface KpiData {
  revenue: number;
  salesOrders: number;
  customers: number;
  products: number;
  activeEmployees: number;
  pendingApprovals: number;
}

interface ActivityItem {
  id: string;
  date: string;
  user: string;
  action: string;
  entity: string;
  description: string;
}

export default function BiPage() {
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<KpiData>("/bi/kpis"),
      api.get<ActivityItem[]>("/bi/activity"),
    ])
      .then(([kpiData, activityData]) => {
        setKpis(kpiData);
        setActivities(activityData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { title: "Revenue", value: kpis ? formatCurrency(kpis.revenue) : "-", icon: <DollarSign className="h-5 w-5" />, description: "Total revenue" },
    { title: "Sales Orders", value: kpis?.salesOrders ?? "-", icon: <ShoppingCart className="h-5 w-5" />, description: "Active orders" },
    { title: "Customers", value: kpis?.customers ?? "-", icon: <Users className="h-5 w-5" />, description: "Registered accounts" },
    { title: "Products", value: kpis?.products ?? "-", icon: <Package className="h-5 w-5" />, description: "Active SKUs" },
    { title: "Active Employees", value: kpis?.activeEmployees ?? "-", icon: <UserCheck className="h-5 w-5" />, description: "Current headcount" },
    { title: "Pending Approvals", value: kpis?.pendingApprovals ?? "-", icon: <Clock className="h-5 w-5" />, description: "Needs attention" },
  ];

  const columns: Column<ActivityItem>[] = [
    { key: "date", label: "Date", render: (item) => formatDate(item.date, "relative"), sortable: true },
    { key: "user", label: "User", sortable: true },
    { key: "action", label: "Action" },
    { key: "entity", label: "Entity" },
    { key: "description", label: "Description" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Executive Dashboard" description="Real-time business intelligence with KPIs" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <DataTable columns={columns} data={activities} keyExtractor={(item) => item.id} searchable={false} pageSize={10} loading={loading} />
      </div>
    </div>
  );
}
