"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";

interface WorkCenter {
  id: string;
  code: string;
  name: string;
  department: string;
  capacity: number;
  utilization: number;
  status: string;
}

const columns: Column<WorkCenter>[] = [
  { key: "code", label: "Code", sortable: true },
  { key: "name", label: "Name", sortable: true },
  { key: "department", label: "Department", sortable: true },
  { key: "capacity", label: "Capacity", sortable: true },
  {
    key: "utilization",
    label: "Utilization %",
    sortable: true,
    render: (w) => (
      <div className="flex items-center gap-2">
        <div className="h-2 w-24 rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${Math.min(w.utilization, 100)}%` }}
          />
        </div>
        <span className="text-xs font-medium">{w.utilization}%</span>
      </div>
    ),
  },
  { key: "status", label: "Status", sortable: true, render: (w) => <Badge variant="secondary">{w.status}</Badge> },
];

export default function WorkCentersPage() {
  const [data, setData] = useState<WorkCenter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<WorkCenter[]>("/manufacturing/work-centers").then(setData).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Work Centers" description="Production work center management" />
      <DataTable columns={columns} data={data} keyExtractor={(w) => w.id} loading={loading} searchPlaceholder="Search work centers..." />
    </div>
  );
}
