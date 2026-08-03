"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Role {
  id: string;
  name: string;
  description: string;
  usersCount: number;
  permissionsCount: number;
  type: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Role[]>("/security/roles")
      .then(setRoles)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<Role>[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "description", label: "Description" },
    { key: "usersCount", label: "Users Count", sortable: true },
    { key: "permissionsCount", label: "Permissions Count", sortable: true },
    { key: "type", label: "Type", render: (item) => (
      <Badge variant={item.type === "system" ? "secondary" : "default"}>{item.type === "system" ? "System" : "Custom"}</Badge>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Roles" description="Role-based access control management" action={{ label: "Create Role", onClick: () => {} }} />
      <DataTable columns={columns} data={roles} keyExtractor={(item) => item.id} loading={loading} />
    </div>
  );
}
