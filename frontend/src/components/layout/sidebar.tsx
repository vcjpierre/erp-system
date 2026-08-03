"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useState } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  Settings,
  Building2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Warehouse,
  CreditCard,
  HandCoins,
  DollarSign,
  Receipt,
  BookOpen,
  Calculator,
  CalendarRange,
  PieChart,
  UserCheck,
  UserCog,
  Building,
  BadgePercent,
  MapPin,
  FileDigit,
  ChevronDown,
  RefreshCw,
  Crosshair,
  Phone,
  GitBranch,
  ShoppingBag,
  ClipboardList,
  ClipboardCheck,
  UserPlus,
  Award,
  Repeat,
  Monitor,
  Cpu,
  Zap,
  ArrowLeftRight,
  Layers,
  Truck,
  Globe,
  Kanban,
  Briefcase,
  Clock,
  Factory,
  BarChart3,
  Shield,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface SubMenuItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  children?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  {
    icon: TrendingUp,
    label: "Accounting",
    children: [
      { label: "Dashboard", href: "/accounting", icon: LayoutDashboard },
      { label: "Chart of Accounts", href: "/accounting/chart-of-accounts", icon: BookOpen },
      { label: "Journal Entries", href: "/accounting/journal-entries", icon: FileText },
      { label: "General Ledger", href: "/accounting/ledger", icon: Calculator },
      { label: "Financial Reports", href: "/accounting/financial-reports", icon: PieChart },
      { label: "Accounting Periods", href: "/accounting/periods", icon: CalendarRange },
      { label: "Cost Centers", href: "/accounting/cost-centers", icon: DollarSign },
      { label: "Revaluation", href: "/accounting/revaluation", icon: RefreshCw },
    ],
  },
  {
    icon: Users,
    label: "CRM",
    children: [
      { label: "Leads", href: "/leads", icon: UserPlus },
      { label: "Pipeline", href: "/deals", icon: GitBranch },
      { label: "Activities", href: "/activities", icon: Phone },
      { label: "Follow-ups", href: "/follow-ups", icon: Repeat },
    ],
  },
  {
    icon: ShoppingCart,
    label: "Sales",
    children: [
      { label: "Customers", href: "/customers", icon: UserCheck },
      { label: "Quotes", href: "/quotes", icon: FileText },
      { label: "Orders", href: "/sales-orders", icon: ShoppingBag },
      { label: "Invoices", href: "/invoicing", icon: Receipt },
      { label: "Subscriptions", href: "/subscriptions", icon: Repeat },
      { label: "Targets", href: "/sales-targets", icon: Crosshair },
      { label: "Commissions", href: "/commissions", icon: Award },
      { label: "Accounts Receivable", href: "/ar-ap/receivable", icon: HandCoins },
    ],
  },
  {
    icon: ShoppingCart,
    label: "Purchases",
    children: [
      { label: "Suppliers", href: "/suppliers", icon: UserCog },
      { label: "Requests", href: "/purchase-requests", icon: ClipboardList },
      { label: "Orders", href: "/purchase-orders", icon: Package },
      { label: "Receivings", href: "/receivings", icon: Warehouse },
      { label: "Supplier Eval", href: "/supplier-evaluations", icon: Award },
      { label: "Accounts Payable", href: "/ar-ap/payable", icon: CreditCard },
    ],
  },
  {
    icon: CreditCard,
    label: "Payments",
    href: "/payments",
  },
  {
    icon: Monitor,
    label: "POS",
    children: [
      { label: "Quick Sale", href: "/pos", icon: ShoppingCart },
      { label: "Sessions", href: "/pos/sessions", icon: Monitor },
    ],
  },
  {
    icon: Globe,
    label: "Ecommerce",
    children: [
      { label: "Sync", href: "/ecommerce", icon: RefreshCw },
      { label: "Catalog", href: "/ecommerce/catalog", icon: Package },
    ],
  },
  {
    icon: Package,
    label: "Inventory",
    children: [
      { label: "Products", href: "/products", icon: Package },
      { label: "Stock", href: "/inventory", icon: Package },
      { label: "Locations", href: "/inventory/locations", icon: MapPin },
      { label: "Transfers", href: "/inventory/transfers", icon: ArrowLeftRight },
      { label: "Adjustments", href: "/inventory/adjustments", icon: Calculator },
      { label: "Physical Counts", href: "/inventory/physical-counts", icon: ClipboardCheck },
      { label: "Kardex", href: "/inventory/kardex", icon: FileText },
      { label: "Lots", href: "/inventory/lots", icon: Layers },
      { label: "Serials", href: "/inventory/serials", icon: Cpu },
      { label: "Traceability", href: "/inventory/trace", icon: GitBranch },
      { label: "Valuation", href: "/inventory/valuation", icon: DollarSign },
      { label: "Warehouses", href: "/warehouses", icon: Warehouse },
    ],
  },
  {
    icon: Truck,
    label: "Logistics",
    children: [
      { label: "Dashboard", href: "/logistics", icon: LayoutDashboard },
      { label: "Picking", href: "/logistics/picking", icon: ClipboardList },
      { label: "Packing", href: "/logistics/packing", icon: Package },
      { label: "Dispatch", href: "/logistics/dispatch", icon: Truck },
    ],
  },
  {
    icon: Users,
    label: "HR",
    children: [
      { label: "Dashboard", href: "/hr", icon: LayoutDashboard },
      { label: "Employees", href: "/hr/employees", icon: UserPlus },
      { label: "Departments", href: "/hr/departments", icon: Building },
      { label: "Positions", href: "/hr/positions", icon: Briefcase },
      { label: "Contracts", href: "/hr/contracts", icon: FileText },
      { label: "Attendance", href: "/hr/attendance", icon: Clock },
      { label: "Leaves", href: "/hr/leaves", icon: CalendarRange },
      { label: "Payroll", href: "/hr/payroll", icon: DollarSign },
      { label: "Evaluations", href: "/hr/evaluations", icon: Award },
      { label: "Recruitment", href: "/hr/recruitment", icon: UserPlus },
      { label: "Training", href: "/hr/training", icon: BookOpen },
    ],
  },
  {
    icon: Kanban,
    label: "Projects",
    children: [
      { label: "Dashboard", href: "/projects", icon: LayoutDashboard },
      { label: "Tasks", href: "/projects/tasks", icon: ClipboardList },
      { label: "Timesheets", href: "/projects/timesheets", icon: Clock },
      { label: "Budgets", href: "/projects/budgets", icon: DollarSign },
    ],
  },
  {
    icon: Factory,
    label: "Manufacturing",
    children: [
      { label: "Dashboard", href: "/manufacturing", icon: LayoutDashboard },
      { label: "Orders", href: "/manufacturing/orders", icon: ClipboardList },
      { label: "BOM", href: "/manufacturing/boms", icon: FileText },
      { label: "Work Centers", href: "/manufacturing/work-centers", icon: Settings },
      { label: "MRP", href: "/manufacturing/mrp", icon: Cpu },
    ],
  },
  {
    icon: BarChart3,
    label: "BI & Analytics",
    children: [
      { label: "Executive Dashboard", href: "/bi", icon: LayoutDashboard },
      { label: "Dashboards", href: "/bi/dashboards", icon: BarChart3 },
      { label: "Reports", href: "/bi/reports", icon: FileText },
      { label: "KPIs", href: "/bi/kpis", icon: PieChart },
    ],
  },
  {
    icon: ClipboardList,
    label: "Audit",
    children: [
      { label: "Audit Trail", href: "/audit", icon: ClipboardList },
    ],
  },
  {
    icon: Shield,
    label: "Security",
    children: [
      { label: "Dashboard", href: "/security", icon: LayoutDashboard },
      { label: "Roles", href: "/security/roles", icon: Shield },
      { label: "Permissions", href: "/security/permissions", icon: FileText },
      { label: "Sessions", href: "/security/sessions", icon: Monitor },
      { label: "Policies", href: "/security/policies", icon: Settings },
      { label: "Users", href: "/security/users", icon: Users },
    ],
  },
  {
    icon: Activity,
    label: "Monitoring",
    children: [
      { label: "System Health", href: "/monitoring", icon: Activity },
    ],
  },
  {
    icon: Cpu,
    label: "Automations",
    children: [
      { label: "Approvals", href: "/approvals", icon: ClipboardList },
      { label: "Business Rules", href: "/business-rules", icon: Zap },
    ],
  },
  {
    icon: Building2,
    label: "Administration",
    children: [
      { label: "Companies", href: "/companies", icon: Building },
      { label: "Branches", href: "/branches", icon: MapPin },
      { label: "Currencies", href: "/currencies", icon: DollarSign },
      { label: "Exchange Rates", href: "/exchange-rates", icon: TrendingUp },
      { label: "Taxes", href: "/taxes", icon: BadgePercent },
      { label: "Users", href: "/users", icon: Users },
      { label: "Document Sequences", href: "/document-sequences", icon: FileDigit },
    ],
  },
  { icon: Settings, label: "Settings", href: "/settings" },
];

function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar } = useAuthStore();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    menuItems.forEach((item) => {
      if (item.children) {
        initial[item.label] = item.children.some((child) => isActive(child.href, pathname));
      }
    });
    return initial;
  });

  const toggleSection = (label: string) => {
    setExpandedSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isSidebarOpen ? 260 : 72 }}
      className="fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-border bg-sidebar text-sidebar-foreground"
    >
      <div className="flex h-14 items-center border-b border-sidebar-accent px-4">
        <AnimatePresence mode="wait">
          {isSidebarOpen ? (
            <motion.div
              key="logo-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                E
              </div>
              <span className="text-sm font-semibold">ERP System</span>
            </motion.div>
          ) : (
            <motion.div
              key="logo-icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold"
            >
              E
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 py-4">
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            if (item.href) {
              const active = isActive(item.href, pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <AnimatePresence mode="wait">
                    {isSidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="overflow-hidden whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              );
            }

            if (item.children) {
              const sectionActive = item.children.some((child) => isActive(child.href, pathname));
              const expanded = isSidebarOpen && expandedSections[item.label];
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleSection(item.label)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      sectionActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <AnimatePresence mode="wait">
                      {isSidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className="flex-1 overflow-hidden whitespace-nowrap text-left"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {isSidebarOpen && (
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 transition-transform",
                          expanded && "rotate-180",
                        )}
                      />
                    )}
                  </button>
                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        {item.children.map((child) => {
                          const childActive = pathname === child.href;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={cn(
                                "flex items-center gap-3 rounded-lg py-2 text-sm transition-colors",
                                "ml-8 mr-2 pl-2",
                                childActive
                                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                              )}
                            >
                              {child.icon && <child.icon className="h-4 w-4 shrink-0" />}
                              <span className="overflow-hidden whitespace-nowrap">
                                {child.label}
                              </span>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return null;
          })}
        </nav>
      </div>

      <div className="border-t border-sidebar-accent p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="w-full text-sidebar-foreground/70 hover:bg-sidebar-accent"
        >
          {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
    </motion.aside>
  );
}
