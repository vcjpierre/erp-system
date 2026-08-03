"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface Evaluation {
  id: string;
  employee: string;
  period: string;
  score: number;
  reviewer: string;
  status: string;
  evaluatedAt: string;
}

const statusVariant: Record<string, "success" | "warning" | "secondary"> = {
  COMPLETED: "success",
  PENDING: "warning",
  DRAFT: "secondary",
};

export default function EvaluationsPage() {
  const [data, setData] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try { setLoading(true); const res = await api.get<Evaluation[]>("/hr/evaluations"); setData(res); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const columns: Column<Evaluation>[] = [
    { key: "employee", label: "Employee", sortable: true },
    { key: "period", label: "Period", sortable: true },
    { key: "score", label: "Score", sortable: true },
    { key: "reviewer", label: "Reviewer" },
    { key: "status", label: "Status", render: (e) => (
      <Badge variant={statusVariant[e.status] || "secondary"}>{e.status}</Badge>
    )},
    { key: "evaluatedAt", label: "Evaluated At", render: (e) => e.evaluatedAt ? formatDate(e.evaluatedAt) : "-" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Evaluations" description="Performance review management" />
      <DataTable columns={columns} data={data} keyExtractor={(e) => e.id} loading={loading} searchKeys={["employee", "reviewer", "period"]} />
    </div>
  );
}
