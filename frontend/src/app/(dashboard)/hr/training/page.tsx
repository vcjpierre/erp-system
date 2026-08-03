"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { CheckCircle, Clock } from "lucide-react";

interface Training {
  id: string;
  employee: string;
  title: string;
  startDate: string;
  endDate: string;
  hours: number;
  status: string;
}

export default function TrainingPage() {
  const [data, setData] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try { setLoading(true); const res = await api.get<Training[]>("/hr/training"); setData(res); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const columns: Column<Training>[] = [
    { key: "employee", label: "Employee", sortable: true },
    { key: "title", label: "Title", sortable: true },
    { key: "startDate", label: "Start Date", render: (t) => formatDate(t.startDate), sortable: true },
    { key: "endDate", label: "End Date", render: (t) => formatDate(t.endDate) },
    { key: "hours", label: "Hours", sortable: true },
    { key: "status", label: "Status", render: (t) => (
      t.status === "COMPLETED"
        ? <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>
        : <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Training" description="Employee training and development" />
      <DataTable columns={columns} data={data} keyExtractor={(t) => t.id} loading={loading} searchKeys={["employee", "title"]} />
    </div>
  );
}
