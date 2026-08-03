"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, Column } from "@/components/shared/data-table";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Dashboard {
  id: string;
  name: string;
  widgetsCount: number;
  createdAt: string;
  status: string;
}

export default function DashboardsPage() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Dashboard[]>("/bi/dashboards")
      .then(setDashboards)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<Dashboard>[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "widgetsCount", label: "Widgets Count", sortable: true },
    { key: "createdAt", label: "Created At", render: (item) => formatDate(item.createdAt, "short"), sortable: true },
    { key: "status", label: "Status", render: (item) => (
      <Badge variant={item.status === "active" ? "success" : "secondary"}>{item.status}</Badge>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboards" description="Custom dashboard management with drag-and-drop widgets" action={{ label: "Create Dashboard", onClick: () => {} }} />
      <DataTable columns={columns} data={dashboards} keyExtractor={(item) => item.id} loading={loading} />
    </div>
  );
}
