"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, Column } from "@/components/shared/data-table";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}

const statusVariant: Record<string, "success" | "warning" | "destructive"> = {
  active: "success",
  inactive: "warning",
  suspended: "destructive",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<User[]>("/security/users")
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<User>[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "role", label: "Role", sortable: true },
    { key: "status", label: "Status", render: (item) => (
      <Badge variant={statusVariant[item.status] || "secondary"}>{item.status}</Badge>
    )},
    { key: "lastLogin", label: "Last Login", render: (item) => formatDate(item.lastLogin, "relative"), sortable: true },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" description="Manage users, roles and account status" action={{ label: "Invite User", onClick: () => {} }} />
      <DataTable columns={columns} data={users} keyExtractor={(item) => item.id} searchPlaceholder="Search users..." searchKeys={["name", "email", "role"]} loading={loading} />
    </div>
  );
}
