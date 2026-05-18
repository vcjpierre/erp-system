"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const routeLabels: Record<string, string> = {
  "": "Dashboard",
  accounting: "Accounting",
  "chart-of-accounts": "Chart of Accounts",
  "journal-entries": "Journal Entries",
  ledger: "General Ledger",
  "financial-reports": "Financial Reports",
  periods: "Accounting Periods",
  "cost-centers": "Cost Centers",
  "ar-ap": "AR / AP",
  receivable: "Accounts Receivable",
  payable: "Accounts Payable",
  customers: "Customers",
  suppliers: "Suppliers",
  invoicing: "Invoices",
  payments: "Payments",
  inventory: "Inventory",
  warehouses: "Warehouses",
  administration: "Administration",
  companies: "Companies",
  branches: "Branches",
  currencies: "Currencies",
  taxes: "Taxes",
  "exchange-rates": "Exchange Rates",
  revaluation: "Revaluation",
  leads: "Leads",
  deals: "Pipeline",
  activities: "Activities",
  "follow-ups": "Follow-ups",
  quotes: "Quotes",
  "sales-orders": "Orders",
  subscriptions: "Subscriptions",
  "sales-targets": "Targets",
  commissions: "Commissions",
  "purchase-requests": "Requests",
  "purchase-orders": "Orders",
  receivings: "Receivings",
  "supplier-evaluations": "Supplier Eval",
  pos: "POS",
  sessions: "Sessions",
  products: "Products",
  locations: "Locations",
  transfers: "Transfers",
  adjustments: "Adjustments",
  "physical-counts": "Physical Counts",
  kardex: "Kardex",
  lots: "Lots",
  serials: "Serials",
  trace: "Traceability",
  valuation: "Valuation",
  logistics: "Logistics",
  picking: "Picking",
  packing: "Packing",
  dispatch: "Dispatch",
  automations: "Automations",
  approvals: "Approvals",
  "business-rules": "Business Rules",
  users: "Users",
  "document-sequences": "Document Sequences",
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
