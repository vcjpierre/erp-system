"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Contract {
  id: string;
  employee: string;
  type: string;
  startDate: string;
  endDate: string;
  salary: number;
  status: string;
}

export default function ContractsPage() {
  const [data, setData] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try { setLoading(true); const res = await api.get<Contract[]>("/hr/contracts"); setData(res); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const columns: Column<Contract>[] = [
    { key: "employee", label: "Employee", sortable: true },
    { key: "type", label: "Type", render: (c) => <Badge variant="outline">{c.type}</Badge> },
    { key: "startDate", label: "Start Date", render: (c) => formatDate(c.startDate), sortable: true },
    { key: "endDate", label: "End Date", render: (c) => formatDate(c.endDate) },
    { key: "salary", label: "Salary", render: (c) => formatCurrency(c.salary), sortable: true },
    { key: "status", label: "Status", render: (c) => (
      <Badge variant={c.status === "ACTIVE" ? "success" : "secondary"}>{c.status}</Badge>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Contracts" description="Employment contract management" />
      <DataTable columns={columns} data={data} keyExtractor={(c) => c.id} loading={loading} searchKeys={["employee", "type"]} />
    </div>
  );
}
