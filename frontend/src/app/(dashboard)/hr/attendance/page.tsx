"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface Attendance {
  id: string;
  employee: string;
  date: string;
  checkIn: string;
  checkOut: string;
  hoursWorked: number;
  status: string;
}

export default function AttendancePage() {
  const [data, setData] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try { setLoading(true); const res = await api.get<Attendance[]>("/hr/attendance"); setData(res); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const columns: Column<Attendance>[] = [
    { key: "employee", label: "Employee", sortable: true },
    { key: "date", label: "Date", render: (a) => formatDate(a.date), sortable: true },
    { key: "checkIn", label: "Check In" },
    { key: "checkOut", label: "Check Out" },
    { key: "hoursWorked", label: "Hours Worked", sortable: true },
    { key: "status", label: "Status", render: (a) => (
      <Badge variant={a.status === "PRESENT" ? "success" : "destructive"}>{a.status}</Badge>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" description="Daily check-in/check-out tracking" />
      <DataTable columns={columns} data={data} keyExtractor={(a) => a.id} loading={loading} searchKeys={["employee"]} />
    </div>
  );
}
