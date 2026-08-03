"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, XCircle, Clock, FileText, User, Building2,
  Package, DollarSign, Users, ClipboardList,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ApprovalStatus = "pending" | "approved" | "rejected";

interface Approval {
  id: string;
  entityType: string;
  entityId: string;
  requester: string;
  date: string;
  status: ApprovalStatus;
  description: string;
}

const approvals: Approval[] = [
  { id: "APR-001", entityType: "Purchase Order", entityId: "PO-2024-001", requester: "María García", date: "2024-03-15", status: "pending", description: "Office supplies Q2" },
  { id: "APR-002", entityType: "Sales Order", entityId: "SO-2024-089", requester: "Juan Pérez", date: "2024-03-14", status: "approved", description: "Bulk order - Tech Corp" },
  { id: "APR-003", entityType: "Invoice", entityId: "INV-2024-234", requester: "Ana López", date: "2024-03-13", status: "rejected", description: "Consulting services" },
  { id: "APR-004", entityType: "Purchase Request", entityId: "PR-2024-056", requester: "Carlos Ruiz", date: "2024-03-12", status: "pending", description: "IT equipment renewal" },
  { id: "APR-005", entityType: "Invoice", entityId: "INV-2024-235", requester: "Laura Medina", date: "2024-03-11", status: "approved", description: "Monthly retainer" },
  { id: "APR-006", entityType: "Sales Order", entityId: "SO-2024-090", requester: "Pedro Sánchez", date: "2024-03-10", status: "pending", description: "Hardware wholesale" },
  { id: "APR-007", entityType: "Purchase Order", entityId: "PO-2024-002", requester: "Sofía Torres", date: "2024-03-09", status: "rejected", description: "Marketing materials" },
  { id: "APR-008", entityType: "Purchase Request", entityId: "PR-2024-057", requester: "Diego Ramírez", date: "2024-03-08", status: "approved", description: "Shipping supplies" },
];

const entityIcons: Record<string, typeof FileText> = {
  "Purchase Order": Package,
  "Sales Order": DollarSign,
  "Invoice": FileText,
  "Purchase Request": ClipboardList,
};

const tabs = ["pending", "approved", "rejected", "all"] as const;

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function getStatusBadge(status: ApprovalStatus) {
  const config = {
    pending: { variant: "warning" as const, icon: Clock, label: "Pending" },
    approved: { variant: "success" as const, icon: CheckCircle2, label: "Approved" },
    rejected: { variant: "destructive" as const, icon: XCircle, label: "Rejected" },
  };
  const c = config[status];
  return (
    <Badge variant={c.variant} className="flex items-center gap-1 capitalize">
      <c.icon className="h-3 w-3" />
      {c.label}
    </Badge>
  );
}

export default function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState<string>("pending");

  const filtered = activeTab === "all"
    ? approvals
    : approvals.filter((a) => a.status === activeTab);

  const counts = {
    pending: approvals.filter((a) => a.status === "pending").length,
    approved: approvals.filter((a) => a.status === "approved").length,
    rejected: approvals.filter((a) => a.status === "rejected").length,
    all: approvals.length,
  };

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Approvals</h1>
        <p className="text-muted-foreground">Multi-level approval workflow management</p>
      </div>

      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
              activeTab === tab
                ? "bg-background text-foreground shadow"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="capitalize">{tab}</span>
            <span className={cn(
              "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-medium",
              activeTab === tab ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20 text-muted-foreground",
            )}>
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CheckCircle2 className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h3 className="text-lg font-medium">No {activeTab} approvals</h3>
          <p className="text-sm text-muted-foreground">
            {activeTab === "pending"
              ? "All caught up! No pending approvals."
              : `There are no ${activeTab} approvals to show.`}
          </p>
        </div>
      ) : (
        <motion.div variants={container} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((approval) => {
            const EntityIcon = entityIcons[approval.entityType] || FileText;
            return (
              <motion.div key={approval.id} variants={itemAnim}>
                <Card className="h-full transition-all hover:shadow-lg">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <EntityIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{approval.entityType}</p>
                          <p className="text-sm font-medium">{approval.entityId}</p>
                        </div>
                      </div>
                      {getStatusBadge(approval.status)}
                    </div>
                    <p className="mb-3 text-xs text-muted-foreground">{approval.description}</p>
                    <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{approval.requester}</span>
                      <span className="ml-auto">{approval.date}</span>
                    </div>
                    {approval.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 gap-1 text-destructive">
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
