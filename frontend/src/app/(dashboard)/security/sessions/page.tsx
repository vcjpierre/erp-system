"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, Column } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface Session {
  id: string;
  user: string;
  ipAddress: string;
  device: string;
  lastActivity: string;
  expiresAt: string;
  status: string;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [terminatingId, setTerminatingId] = useState<string | null>(null);

  useEffect(() => {
    api.get<Session[]>("/security/sessions")
      .then(setSessions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleTerminate = async () => {
    if (!terminatingId) return;
    try {
      await api.delete(`/security/sessions/${terminatingId}`);
      setSessions((prev) => prev.filter((s) => s.id !== terminatingId));
    } catch {
    } finally {
      setTerminatingId(null);
    }
  };

  const columns: Column<Session>[] = [
    { key: "user", label: "User", sortable: true },
    { key: "ipAddress", label: "IP Address", className: "font-mono text-xs" },
    { key: "device", label: "Device" },
    { key: "lastActivity", label: "Last Activity", render: (item) => formatDate(item.lastActivity, "relative"), sortable: true },
    { key: "expiresAt", label: "Expires At", render: (item) => formatDate(item.expiresAt, "relative"), sortable: true },
    { key: "status", label: "Status", render: (item) => (
      <Badge variant={item.status === "active" ? "success" : "secondary"}>{item.status}</Badge>
    )},
  ];

  const actions = [
    { label: "Terminate", icon: <LogOut className="h-4 w-4" />, variant: "destructive" as const, onClick: (item: Session) => setTerminatingId(item.id) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Active Sessions" description="Monitor and manage user sessions" />
      <DataTable columns={columns} data={sessions} keyExtractor={(item) => item.id} actions={actions} loading={loading} />
      <ConfirmDialog
        open={!!terminatingId}
        onClose={() => setTerminatingId(null)}
        onConfirm={handleTerminate}
        title="Terminate Session"
        message="Are you sure you want to terminate this session? The user will be logged out."
      />
    </div>
  );
}
