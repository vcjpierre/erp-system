"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: { value: number; positive: boolean };
  className?: string;
}

export function StatCard({ title, value, icon, description, trend, className }: StatCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-4 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="p-2 rounded-md bg-primary/10 text-primary">{icon}</div>
      </div>
      <p className="text-2xl font-bold mt-2">{value}</p>
      {(description || trend) && (
        <p className="text-xs text-muted-foreground mt-1">
          {trend && <span className={trend.positive ? "text-green-600" : "text-red-600"}>{trend.positive ? "+" : ""}{trend.value}% </span>}
          {description}
        </p>
      )}
    </div>
  );
}
