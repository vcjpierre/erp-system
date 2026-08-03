"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";

interface Bom {
  id: string;
  code: string;
  name: string;
  product: string;
  quantity: number;
  componentCount: number;
  status: string;
}

const columns: Column<Bom>[] = [
  { key: "code", label: "Code", sortable: true },
  { key: "name", label: "Name", sortable: true },
  { key: "product", label: "Product", sortable: true },
  { key: "quantity", label: "Quantity", sortable: true },
  { key: "componentCount", label: "Component Count", sortable: true },
  { key: "status", label: "Status", sortable: true, render: (b) => <Badge variant="secondary">{b.status}</Badge> },
];

export default function BomsPage() {
  const [data, setData] = useState<Bom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Bom[]>("/manufacturing/boms").then(setData).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Bill of Materials" description="BOM structure and component management" />
      <DataTable columns={columns} data={data} keyExtractor={(b) => b.id} loading={loading} searchPlaceholder="Search BOMs..." />
    </div>
  );
}
