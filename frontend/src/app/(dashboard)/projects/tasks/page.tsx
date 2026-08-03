"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, Column } from "@/components/shared/data-table";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Task {
  id: string;
  title: string;
  project: string;
  assignee: string;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string;
}

const statusVariant: Record<string, "default" | "success" | "warning" | "secondary" | "destructive"> = {
  TODO: "secondary",
  IN_PROGRESS: "default",
  REVIEW: "warning",
  DONE: "success",
  CANCELLED: "destructive",
};

const priorityColor: Record<string, string> = {
  LOW: "text-slate-500",
  MEDIUM: "text-blue-600",
  HIGH: "text-orange-600",
  URGENT: "text-red-600",
};

const columns: Column<Task>[] = [
  { key: "title", label: "Title", sortable: true },
  { key: "project", label: "Project", sortable: true },
  { key: "assignee", label: "Assignee", sortable: true },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (t) => <Badge variant={statusVariant[t.status]}>{t.status}</Badge>,
  },
  {
    key: "priority",
    label: "Priority",
    sortable: true,
    render: (t) => <span className={`font-medium ${priorityColor[t.priority]}`}>{t.priority}</span>,
  },
  { key: "dueDate", label: "Due Date", sortable: true, render: (t) => formatDate(t.dueDate) },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Task[]>("/projects/tasks").then(setTasks).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Tasks" description="Project task management with Gantt view" />
      <DataTable columns={columns} data={tasks} keyExtractor={(t) => t.id} loading={loading} searchPlaceholder="Search tasks..." />
    </div>
  );
}
