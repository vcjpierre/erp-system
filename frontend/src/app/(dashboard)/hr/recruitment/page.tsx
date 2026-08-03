"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";

interface Recruitment {
  id: string;
  title: string;
  position: string;
  openings: number;
  candidatesCount: number;
  status: string;
}

const statusVariant: Record<string, "success" | "secondary" | "destructive"> = {
  PUBLISHED: "success",
  DRAFT: "secondary",
  CLOSED: "destructive",
};

export default function RecruitmentPage() {
  const [data, setData] = useState<Recruitment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try { setLoading(true); const res = await api.get<Recruitment[]>("/hr/recruitment"); setData(res); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const columns: Column<Recruitment>[] = [
    { key: "title", label: "Title", sortable: true },
    { key: "position", label: "Position", sortable: true },
    { key: "openings", label: "Openings", sortable: true },
    { key: "candidatesCount", label: "Candidates Count", sortable: true },
    { key: "status", label: "Status", render: (r) => (
      <Badge variant={statusVariant[r.status] || "secondary"}>{r.status}</Badge>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Recruitment" description="Job postings and candidate tracking" />
      <DataTable columns={columns} data={data} keyExtractor={(r) => r.id} loading={loading} searchKeys={["title", "position"]} />
    </div>
  );
}
