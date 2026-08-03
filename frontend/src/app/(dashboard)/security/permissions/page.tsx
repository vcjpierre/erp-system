"use client";

import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";

interface Permission {
  id: string;
  module: string;
  action: string;
  description: string;
}

const moduleColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  users: "default",
  roles: "success",
  inventory: "warning",
  sales: "destructive",
  reports: "secondary",
};

const actionVariant: Record<string, "default" | "success" | "destructive" | "warning"> = {
  create: "success",
  read: "default",
  update: "warning",
  delete: "destructive",
};

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Permission[]>("/security/permissions")
      .then(setPermissions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, Permission[]>();
    for (const p of permissions) {
      const existing = map.get(p.module) || [];
      existing.push(p);
      map.set(p.module, existing);
    }
    return Array.from(map.entries());
  }, [permissions]);

  const columns: Column<Permission>[] = [
    { key: "module", label: "Module", render: (item) => (
      <Badge variant={moduleColors[item.module.toLowerCase()] || "default"}>{item.module}</Badge>
    )},
    { key: "action", label: "Action", render: (item) => (
      <Badge variant={actionVariant[item.action.toLowerCase()] || "default"}>{item.action}</Badge>
    )},
    { key: "description", label: "Description" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Permissions" description="Granular permission management by module" />
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : (
        grouped.map(([module, perms]) => (
          <div key={module}>
            <h3 className="text-lg font-semibold mb-2 capitalize">{module} Permissions</h3>
            <DataTable
              columns={columns}
              data={perms}
              keyExtractor={(item) => item.id}
              searchable={false}
              pageSize={perms.length}
            />
          </div>
        ))
      )}
    </div>
  );
}
