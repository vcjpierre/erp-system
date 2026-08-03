"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";

interface MrpItem {
  id: string;
  product: string;
  currentStock: number;
  minStock: number;
  recommendedQty: number;
  type: "PURCHASE" | "PRODUCE";
  status: "PENDING" | "EXECUTED" | "DISMISSED";
}

const typeVariant: Record<string, "default" | "warning"> = {
  PURCHASE: "warning",
  PRODUCE: "default",
};

const statusVariant: Record<string, "default" | "success" | "warning" | "secondary"> = {
  PENDING: "warning",
  EXECUTED: "success",
  DISMISSED: "secondary",
};

const columns: Column<MrpItem>[] = [
  { key: "product", label: "Product", sortable: true },
  { key: "currentStock", label: "Current Stock", sortable: true },
  { key: "minStock", label: "Min Stock", sortable: true },
  { key: "recommendedQty", label: "Recommended Qty", sortable: true },
  {
    key: "type",
    label: "Type",
    sortable: true,
    render: (m) => <Badge variant={typeVariant[m.type]}>{m.type}</Badge>,
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (m) => <Badge variant={statusVariant[m.status]}>{m.status}</Badge>,
  },
];

export default function MrpPage() {
  const [data, setData] = useState<MrpItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<MrpItem[]>("/manufacturing/mrp").then(setData).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="MRP" description="Material requirements planning" />
      <DataTable columns={columns} data={data} keyExtractor={(m) => m.id} loading={loading} searchPlaceholder="Search MRP..." />
    </div>
  );
}
