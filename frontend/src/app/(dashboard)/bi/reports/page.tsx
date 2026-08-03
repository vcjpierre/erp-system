"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, Column } from "@/components/shared/data-table";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Report {
  id: string;
  name: string;
  type: string;
  format: string;
  createdBy: string;
  createdAt: string;
}

const typeVariant: Record<string, "default" | "success" | "warning" | "destructive"> = {
  sales: "default",
  inventory: "success",
  financial: "warning",
  hr: "destructive",
};

const formatVariant: Record<string, "default" | "secondary" | "outline"> = {
  pdf: "default",
  excel: "secondary",
  csv: "outline",
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Report[]>("/bi/reports")
      .then(setReports)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<Report>[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "type", label: "Type", render: (item) => (
      <Badge variant={typeVariant[item.type.toLowerCase()] || "default"}>{item.type}</Badge>
    )},
    { key: "format", label: "Format", render: (item) => (
      <Badge variant={formatVariant[item.format.toLowerCase()] || "secondary"}>{item.format.toUpperCase()}</Badge>
    )},
    { key: "createdBy", label: "Created By", sortable: true },
    { key: "createdAt", label: "Created At", render: (item) => formatDate(item.createdAt, "short"), sortable: true },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Dynamic report builder with PDF and Excel export" action={{ label: "New Report", onClick: () => {} }} />
      <DataTable columns={columns} data={reports} keyExtractor={(item) => item.id} loading={loading} />
    </div>
  );
}
