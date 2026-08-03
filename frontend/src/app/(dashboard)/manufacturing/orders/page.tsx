"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, Column } from "@/components/shared/data-table";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ProductionOrder {
  id: string;
  orderNumber: string;
  product: string;
  quantity: number;
  status: "PLANNED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  startDate: string;
  endDate: string;
}

const statusVariant: Record<string, "default" | "success" | "warning" | "secondary" | "destructive"> = {
  PLANNED: "default",
  CONFIRMED: "warning",
  IN_PROGRESS: "success",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
};

const columns: Column<ProductionOrder>[] = [
  { key: "orderNumber", label: "Order #", sortable: true },
  { key: "product", label: "Product", sortable: true },
  { key: "quantity", label: "Quantity", sortable: true },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (o) => <Badge variant={statusVariant[o.status]}>{o.status}</Badge>,
  },
  { key: "startDate", label: "Start Date", sortable: true, render: (o) => formatDate(o.startDate) },
  { key: "endDate", label: "End Date", sortable: true, render: (o) => formatDate(o.endDate) },
];

export default function ProductionOrdersPage() {
  const [data, setData] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ProductionOrder[]>("/manufacturing/orders").then(setData).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Production Orders" description="Create and track production orders" />
      <DataTable columns={columns} data={data} keyExtractor={(o) => o.id} loading={loading} searchPlaceholder="Search orders..." />
    </div>
  );
}
