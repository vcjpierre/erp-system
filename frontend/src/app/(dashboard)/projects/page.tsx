"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, Column } from "@/components/shared/data-table";
import { StatCard } from "@/components/shared/stat-card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, ListTodo, Clock, Wallet } from "lucide-react";

interface Project {
  id: string;
  name: string;
  status: "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
  manager: string;
  startDate: string;
  endDate: string;
  budget: number;
}

const statusVariant: Record<string, "default" | "success" | "warning" | "secondary" | "destructive"> = {
  PLANNING: "default",
  ACTIVE: "success",
  ON_HOLD: "warning",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
};

const columns: Column<Project>[] = [
  { key: "name", label: "Name", sortable: true },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (p) => <Badge variant={statusVariant[p.status]}>{p.status}</Badge>,
  },
  { key: "manager", label: "Manager", sortable: true },
  { key: "startDate", label: "Start Date", sortable: true, render: (p) => formatDate(p.startDate) },
  { key: "endDate", label: "End Date", sortable: true, render: (p) => formatDate(p.endDate) },
  { key: "budget", label: "Budget", sortable: true, render: (p) => formatCurrency(p.budget) },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [taskCount, setTaskCount] = useState(0);
  const [timesheetCount, setTimesheetCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<Project[]>("/projects"),
      api.get<unknown[]>("/projects/tasks"),
      api.get<unknown[]>("/projects/timesheets"),
    ]).then(([p, t, ts]) => {
      setProjects(p);
      setTaskCount(t.length);
      setTimesheetCount(ts.length);
    }).finally(() => setLoading(false));
  }, []);

  const activeCount = projects.filter((p) => !["COMPLETED", "CANCELLED"].includes(p.status)).length;
  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Projects" description="Project management and tracking" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Projects" value={activeCount} icon={<FolderKanban className="h-5 w-5" />} />
        <StatCard title="Total Tasks" value={taskCount} icon={<ListTodo className="h-5 w-5" />} />
        <StatCard title="Open Timesheets" value={timesheetCount} icon={<Clock className="h-5 w-5" />} />
        <StatCard title="Project Budget" value={formatCurrency(totalBudget)} icon={<Wallet className="h-5 w-5" />} />
      </div>
      <DataTable columns={columns} data={projects} keyExtractor={(p) => p.id} loading={loading} searchPlaceholder="Search projects..." />
    </div>
  );
}
