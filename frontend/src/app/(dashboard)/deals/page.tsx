"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { cn, formatCurrency, generateAvatar } from "@/lib/utils";
import { DollarSign, Target, User, GripVertical } from "lucide-react";

type Stage = "New" | "Qualification" | "Proposal" | "Negotiation" | "Closed Won" | "Closed Lost";

interface Deal {
  id: string;
  title: string;
  amount: number;
  probability: number;
  assignee: string;
  stage: Stage;
}

const deals: Deal[] = [
  { id: "DL-001", title: "ERP Implementation - TechCorp", amount: 85000, probability: 20, assignee: "María García", stage: "New" },
  { id: "DL-002", title: "Cloud Migration - GlobalTech", amount: 120000, probability: 15, assignee: "Juan Pérez", stage: "New" },
  { id: "DL-003", title: "Consulting Services - FinGroup", amount: 45000, probability: 35, assignee: "Ana López", stage: "Qualification" },
  { id: "DL-004", title: "SaaS Subscription - RetailMax", amount: 28000, probability: 40, assignee: "Carlos Ruiz", stage: "Qualification" },
  { id: "DL-005", title: "Data Analytics Platform", amount: 95000, probability: 55, assignee: "Laura Medina", stage: "Proposal" },
  { id: "DL-006", title: "Security Audit - BankSafe", amount: 67000, probability: 60, assignee: "Pedro Sánchez", stage: "Proposal" },
  { id: "DL-007", title: "Mobile App Development", amount: 78000, probability: 75, assignee: "Sofía Torres", stage: "Negotiation" },
  { id: "DL-008", title: "Infrastructure Upgrade", amount: 156000, probability: 80, assignee: "Diego Ramírez", stage: "Negotiation" },
  { id: "DL-009", title: "Website Redesign - AgencyPro", amount: 32000, probability: 100, assignee: "María García", stage: "Closed Won" },
  { id: "DL-010", title: "Hardware Supply - TechDist", amount: 54000, probability: 100, assignee: "Juan Pérez", stage: "Closed Won" },
  { id: "DL-011", title: "Legacy System Migration", amount: 91000, probability: 0, assignee: "Ana López", stage: "Closed Lost" },
  { id: "DL-012", title: "IT Support Contract", amount: 22000, probability: 0, assignee: "Carlos Ruiz", stage: "Closed Lost" },
];

const stages: Stage[] = ["New", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];

const stageColors: Record<Stage, string> = {
  "New": "border-t-blue-500",
  "Qualification": "border-t-purple-500",
  "Proposal": "border-t-amber-500",
  "Negotiation": "border-t-orange-500",
  "Closed Won": "border-t-green-500",
  "Closed Lost": "border-t-red-500",
};

const stageBadge: Record<Stage, "default" | "secondary" | "warning" | "success" | "destructive"> = {
  "New": "default",
  "Qualification": "secondary",
  "Proposal": "warning",
  "Negotiation": "secondary",
  "Closed Won": "success",
  "Closed Lost": "destructive",
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

function DealCard({ deal }: { deal: Deal }) {
  return (
    <motion.div variants={item}>
      <Card className="group cursor-default transition-all hover:shadow-md">
        <CardContent className="p-3">
          <div className="mb-2 flex items-start justify-between">
            <div className="flex items-center gap-1.5">
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40" />
              <span className="text-xs text-muted-foreground">{deal.id}</span>
            </div>
            <Badge variant={stageBadge[deal.stage]} className="text-[10px]">
              {deal.probability}%
            </Badge>
          </div>
          <h4 className="mb-3 text-sm font-medium leading-tight">{deal.title}</h4>
          <div className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
            <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
            {formatCurrency(deal.amount)}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[9px]">{generateAvatar(deal.assignee)}</AvatarFallback>
            </Avatar>
            <span>{deal.assignee}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function PipelinePage() {
  const wonTotal = deals.filter((d) => d.stage === "Closed Won").reduce((s, d) => s + d.amount, 0);
  const totalPipeline = deals.reduce((s, d) => s + d.amount, 0);

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales Pipeline</h1>
          <p className="text-muted-foreground">Visual deal management and pipeline tracking</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total Pipeline</p>
            <p className="font-bold">{formatCurrency(totalPipeline)}</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Closed Won</p>
            <p className="font-bold text-green-600">{formatCurrency(wonTotal)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 overflow-x-auto md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stages.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage);
          const totalAmount = stageDeals.reduce((s, d) => s + d.amount, 0);
          return (
            <div key={stage} className="flex flex-col">
              <div className={cn("mb-3 rounded-t-lg border-t-2 bg-card pt-3", stageColors[stage])}>
                <div className="flex items-center justify-between px-3 pb-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">{stage}</h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">{stageDeals.length}</span>
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-medium text-muted-foreground">
                      {stageDeals.length}
                    </span>
                  </div>
                </div>
                <div className="px-3 pb-2 text-xs text-muted-foreground">
                  {formatCurrency(totalAmount)}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {stageDeals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8 text-center">
                    <p className="text-xs text-muted-foreground">No deals</p>
                  </div>
                ) : (
                  <motion.div variants={container} className="flex flex-col gap-2">
                    {stageDeals.map((deal) => (
                      <DealCard key={deal.id} deal={deal} />
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
