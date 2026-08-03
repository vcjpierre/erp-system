"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";

interface Employee {
  id: string;
  code: string;
  name: string;
  department: string;
  position: string;
  email: string;
  status: string;
}

export default function EmployeesPage() {
  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try { setLoading(true); const res = await api.get<Employee[]>("/hr/employees"); setData(res); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const columns: Column<Employee>[] = [
    { key: "code", label: "Code", sortable: true },
    { key: "name", label: "Name", sortable: true },
    { key: "department", label: "Department", sortable: true },
    { key: "position", label: "Position", sortable: true },
    { key: "email", label: "Email" },
    { key: "status", label: "Status", render: (e) => (
      <Badge variant={e.status === "ACTIVE" ? "success" : "secondary"}>{e.status}</Badge>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Employees" description="Manage employee records and contracts" action={{ label: "Add Employee", onClick: () => {} }} />
      <DataTable columns={columns} data={data} keyExtractor={(e) => e.id} loading={loading} searchKeys={["code", "name", "email", "department", "position"]} />
    </div>
  );
}
