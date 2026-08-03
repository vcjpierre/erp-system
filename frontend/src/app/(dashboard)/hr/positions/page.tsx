"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface Position {
  id: string;
  code: string;
  name: string;
  department: string;
  salaryMin: number;
  salaryMax: number;
  status: string;
}

export default function PositionsPage() {
  const [data, setData] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try { setLoading(true); const res = await api.get<Position[]>("/hr/positions"); setData(res); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const columns: Column<Position>[] = [
    { key: "code", label: "Code", sortable: true },
    { key: "name", label: "Name", sortable: true },
    { key: "department", label: "Department", sortable: true },
    { key: "salaryRange", label: "Salary Range", render: (p) => `${formatCurrency(p.salaryMin)} - ${formatCurrency(p.salaryMax)}` },
    { key: "status", label: "Status", render: (p) => (
      <Badge variant={p.status === "ACTIVE" ? "success" : "secondary"}>{p.status}</Badge>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Positions" description="Job positions and descriptions" />
      <DataTable columns={columns} data={data} keyExtractor={(p) => p.id} loading={loading} searchKeys={["code", "name", "department"]} />
    </div>
  );
}
