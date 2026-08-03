"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, Column } from "@/components/shared/data-table";

interface Department {
  id: string;
  code: string;
  name: string;
  description: string;
  parentDepartment: string;
  employeesCount: number;
}

export default function DepartmentsPage() {
  const [data, setData] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try { setLoading(true); const res = await api.get<Department[]>("/hr/departments"); setData(res); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const columns: Column<Department>[] = [
    { key: "code", label: "Code", sortable: true },
    { key: "name", label: "Name", sortable: true },
    { key: "description", label: "Description" },
    { key: "parentDepartment", label: "Parent Department" },
    { key: "employeesCount", label: "Employees Count", sortable: true },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Departments" description="Organizational structure and departments" />
      <DataTable columns={columns} data={data} keyExtractor={(d) => d.id} loading={loading} searchKeys={["code", "name", "description"]} />
    </div>
  );
}
