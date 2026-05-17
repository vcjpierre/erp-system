"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const routeLabels: Record<string, string> = {
  "": "Dashboard",
  finance: "Finance",
  sales: "Sales",
  inventory: "Inventory",
  warehouses: "Warehouses",
  purchases: "Purchases",
  production: "Production",
  projects: "Projects",
  hr: "Human Resources",
  reports: "Reports",
  companies: "Companies",
  users: "Users",
  settings: "Settings",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground">
      <Link href="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
        const isLast = index === segments.length - 1;

        return (
          <span key={segment} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="text-foreground font-medium">{label}</span>
            ) : (
              <Link href={href} className="hover:text-foreground transition-colors">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
