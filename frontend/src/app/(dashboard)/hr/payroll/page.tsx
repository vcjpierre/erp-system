"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Payroll {
  id: string;
  period: string;
  totalSalary: number;
  totalDeductions: number;
  totalNet: number;
  status: string;
  paidAt: string;
}

const statusVariant: Record<string, "success" | "warning" | "secondary"> = {
  PAID: "success",
  PENDING: "warning",
  CANCELLED: "secondary",
};

export default function PayrollPage() {
  const [data, setData] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try { setLoading(true); const res = await api.get<Payroll[]>("/hr/payroll"); setData(res); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const columns: Column<Payroll>[] = [
    { key: "period", label: "Period", sortable: true },
    { key: "totalSalary", label: "Total Salary", render: (p) => formatCurrency(p.totalSalary), sortable: true },
    { key: "totalDeductions", label: "Total Deductions", sortable: true },
    { key: "totalNet", label: "Total Net", render: (p) => formatCurrency(p.totalNet), sortable: true },
    { key: "status", label: "Status", render: (p) => (
      <Badge variant={statusVariant[p.status] || "secondary"}>{p.status}</Badge>
    )},
    { key: "paidAt", label: "Paid At", render: (p) => p.paidAt ? formatDate(p.paidAt) : "-" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Payroll" description="Salary calculation, deductions and payments" />
      <DataTable columns={columns} data={data} keyExtractor={(p) => p.id} loading={loading} searchKeys={["period"]} />
    </div>
  );
}
