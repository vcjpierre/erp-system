"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, Column } from "@/components/shared/data-table";
import { StatCard } from "@/components/shared/stat-card";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Package, ClipboardList, CheckCircle2, AlertTriangle } from "lucide-react";

interface ProductionOrder {
  id: string;
  orderNumber: string;
  product: string;
  quantity: number;
  status: string;
  startDate: string;
}

const columns: Column<ProductionOrder>[] = [
  { key: "orderNumber", label: "Order #", sortable: true },
  { key: "product", label: "Product", sortable: true },
  { key: "quantity", label: "Quantity", sortable: true },
  { key: "status", label: "Status", sortable: true, render: (o) => <Badge variant="secondary">{o.status}</Badge> },
  { key: "startDate", label: "Start Date", sortable: true, render: (o) => formatDate(o.startDate) },
];

export default function ManufacturingPage() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [mrpCount, setMrpCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<ProductionOrder[]>("/manufacturing/orders"),
      api.get<unknown[]>("/manufacturing/mrp"),
    ]).then(([o, m]) => {
      setOrders(o);
      setMrpCount(m.filter((r: any) => r.status === "PENDING").length);
    }).finally(() => setLoading(false));
  }, []);

  const activeOrders = orders.filter((o) => o.status === "IN_PROGRESS" || o.status === "CONFIRMED").length;
  const plannedOrders = orders.filter((o) => o.status === "PLANNED").length;
  const completedThisMonth = orders.filter((o) => {
    if (o.status !== "COMPLETED") return false;
    const d = new Date(o.startDate);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Manufacturing" description="Production order management" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Orders" value={activeOrders} icon={<Package className="h-5 w-5" />} />
        <StatCard title="Planned Orders" value={plannedOrders} icon={<ClipboardList className="h-5 w-5" />} />
        <StatCard title="Completed This Month" value={completedThisMonth} icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard title="Pending MRP" value={mrpCount} icon={<AlertTriangle className="h-5 w-5" />} />
      </div>
      <DataTable columns={columns} data={orders.slice(0, 10)} keyExtractor={(o) => o.id} loading={loading} searchPlaceholder="Search orders..." />
    </div>
  );
}
