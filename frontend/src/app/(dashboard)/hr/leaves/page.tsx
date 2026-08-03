"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface Leave {
  id: string;
  employee: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
}

const typeVariant: Record<string, "default" | "destructive" | "warning" | "secondary"> = {
  VACATION: "default",
  SICK: "destructive",
  PERSONAL: "warning",
};

const statusVariant: Record<string, "warning" | "success" | "destructive"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
};

export default function LeavesPage() {
  const [data, setData] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try { setLoading(true); const res = await api.get<Leave[]>("/hr/leaves"); setData(res); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const columns: Column<Leave>[] = [
    { key: "employee", label: "Employee", sortable: true },
    { key: "type", label: "Type", render: (l) => <Badge variant={typeVariant[l.type] || "outline"}>{l.type}</Badge> },
    { key: "startDate", label: "Start Date", render: (l) => formatDate(l.startDate), sortable: true },
    { key: "endDate", label: "End Date", render: (l) => formatDate(l.endDate) },
    { key: "days", label: "Days", sortable: true },
    { key: "status", label: "Status", render: (l) => (
      <Badge variant={statusVariant[l.status] || "secondary"}>{l.status}</Badge>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Leaves" description="Vacation and leave request management" />
      <DataTable columns={columns} data={data} keyExtractor={(l) => l.id} loading={loading} searchKeys={["employee", "type"]} />
    </div>
  );
}
