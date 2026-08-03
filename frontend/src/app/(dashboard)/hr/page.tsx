"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Users, FileText, CalendarCheck, Clock } from "lucide-react";

export default function HrDashboardPage() {
  const [stats, setStats] = useState({ employees: 0, activeContracts: 0, todayAttendance: 0, pendingLeaves: 0 });

  const fetch = useCallback(async () => {
    try {
      const [employees, contracts, attendance, leaves] = await Promise.all([
        api.get<any[]>("/hr/employees").catch(() => []),
        api.get<any[]>("/hr/contracts").catch(() => []),
        api.get<any[]>("/hr/attendance").catch(() => []),
        api.get<any[]>("/hr/leaves").catch(() => []),
      ]);
      const today = new Date().toISOString().split("T")[0];
      setStats({
        employees: employees?.length ?? 0,
        activeContracts: contracts?.filter((c: any) => c.status === "ACTIVE").length ?? 0,
        todayAttendance: attendance?.filter((a: any) => (a.date ?? "").startsWith(today)).length ?? 0,
        pendingLeaves: leaves?.filter((l: any) => l.status === "PENDING").length ?? 0,
      });
    } catch { /* ignore */ }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="space-y-6">
      <PageHeader title="HR Dashboard" description="Employee management, payroll, attendance and more" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Employees" value={stats.employees} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Active Contracts" value={stats.activeContracts} icon={<FileText className="h-5 w-5" />} />
        <StatCard title="Today's Attendance" value={stats.todayAttendance} icon={<CalendarCheck className="h-5 w-5" />} />
        <StatCard title="Pending Leaves" value={stats.pendingLeaves} icon={<Clock className="h-5 w-5" />} />
      </div>
    </div>
  );
}
