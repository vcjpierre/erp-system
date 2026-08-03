"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, Column } from "@/components/shared/data-table";
import { formatCurrency } from "@/lib/utils";

interface Budget {
  id: string;
  project: string;
  budget: number;
  spent: number;
  remaining: number;
  pctUsed: number;
}

const columns: Column<Budget>[] = [
  { key: "project", label: "Project", sortable: true },
  { key: "budget", label: "Budget", sortable: true, render: (b) => formatCurrency(b.budget) },
  { key: "spent", label: "Spent", sortable: true, render: (b) => formatCurrency(b.spent) },
  { key: "remaining", label: "Remaining", sortable: true, render: (b) => formatCurrency(b.remaining) },
  {
    key: "pctUsed",
    label: "% Used",
    sortable: true,
    render: (b) => (
      <div className="flex items-center gap-2">
        <div className="h-2 w-24 rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${Math.min(b.pctUsed, 100)}%` }}
          />
        </div>
        <span className="text-xs font-medium">{b.pctUsed.toFixed(1)}%</span>
      </div>
    ),
  },
];

export default function BudgetsPage() {
  const [data, setData] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Budget[]>("/projects/budgets").then(setData).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Budgets" description="Project budget planning and control" />
      <DataTable columns={columns} data={data} keyExtractor={(b) => b.id} loading={loading} searchPlaceholder="Search budgets..." />
    </div>
  );
}
