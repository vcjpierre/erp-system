"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, Column } from "@/components/shared/data-table";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface AuditLog {
  id: string;
  date: string;
  user: string;
  action: string;
  entity: string;
  entityId: string;
  description: string;
  ipAddress: string;
}

const actionVariant: Record<string, "success" | "default" | "destructive" | "warning" | "secondary"> = {
  CREATE: "success",
  UPDATE: "default",
  DELETE: "destructive",
  LOGIN: "warning",
  EXPORT: "secondary",
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<AuditLog[]>("/audit/logs", { page: 1, limit: 50 })
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<AuditLog>[] = [
    { key: "date", label: "Date", render: (item) => formatDate(item.date, "relative"), sortable: true },
    { key: "user", label: "User", sortable: true },
    { key: "action", label: "Action", render: (item) => (
      <Badge variant={actionVariant[item.action] || "default"}>{item.action}</Badge>
    )},
    { key: "entity", label: "Entity", sortable: true },
    { key: "entityId", label: "Entity ID" },
    { key: "description", label: "Description", sortable: true },
    { key: "ipAddress", label: "IP Address", className: "font-mono text-xs" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Trail" description="Complete audit log with search, filters, and entity history" />
      <DataTable
        columns={columns}
        data={logs}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search by user, action, entity or description..."
        searchKeys={["user", "action", "entity", "description"]}
        pageSize={50}
        loading={loading}
      />
    </div>
  );
}
