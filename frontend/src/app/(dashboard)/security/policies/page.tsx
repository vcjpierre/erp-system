"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, Column } from "@/components/shared/data-table";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Policy {
  id: string;
  name: string;
  config: Record<string, unknown>;
  status: string;
  updatedAt: string;
}

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Policy[]>("/security/policies")
      .then(setPolicies)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<Policy>[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "config", label: "Config", render: (item) => (
      <code className="text-xs bg-muted px-2 py-0.5 rounded max-w-[200px] block truncate">{JSON.stringify(item.config)}</code>
    )},
    { key: "status", label: "Status", render: (item) => (
      <Badge variant={item.status === "active" ? "success" : "secondary"}>{item.status}</Badge>
    )},
    { key: "updatedAt", label: "Updated At", render: (item) => formatDate(item.updatedAt, "relative"), sortable: true },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Security Policies" description="Configure password policies, MFA, session timeout" action={{ label: "Add Policy", onClick: () => {} }} />
      <DataTable columns={columns} data={policies} keyExtractor={(item) => item.id} loading={loading} />
    </div>
  );
}
