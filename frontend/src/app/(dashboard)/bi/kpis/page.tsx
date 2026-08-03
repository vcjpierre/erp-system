"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, ShoppingCart, Users, Package, UserCheck, Clock } from "lucide-react";

interface KpiData {
  revenue: number;
  salesOrders: number;
  customers: number;
  products: number;
  activeEmployees: number;
  pendingApprovals: number;
}

export default function KpisPage() {
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<KpiData>("/bi/kpis")
      .then(setKpis)
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

  return (
    <div className="space-y-6">
      <PageHeader title="KPIs & Metrics" description="Key performance indicators and business metrics" />
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {statCards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>
      )}
    </div>
  );
}
