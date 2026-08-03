"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, Column } from "@/components/shared/data-table";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Timesheet {
  id: string;
  employee: string;
  project: string;
  task: string;
  date: string;
  hours: number;
  description: string;
  status: string;
}

const columns: Column<Timesheet>[] = [
  { key: "employee", label: "Employee", sortable: true },
  { key: "project", label: "Project", sortable: true },
  { key: "task", label: "Task", sortable: true },
  { key: "date", label: "Date", sortable: true, render: (t) => formatDate(t.date) },
  { key: "hours", label: "Hours", sortable: true, render: (t) => `${t.hours}h` },
  { key: "description", label: "Description" },
  { key: "status", label: "Status", sortable: true, render: (t) => <Badge variant="secondary">{t.status}</Badge> },
];

export default function TimesheetsPage() {
  const [data, setData] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Timesheet[]>("/projects/timesheets").then(setData).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Timesheets" description="Time tracking and billing" />
      <DataTable columns={columns} data={data} keyExtractor={(t) => t.id} loading={loading} searchPlaceholder="Search timesheets..." />
    </div>
  );
}
