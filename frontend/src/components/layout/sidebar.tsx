"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import {
  LayoutDashboard,
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  Factory,
  Projector,
  Settings,
  Building2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Warehouse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: TrendingUp, label: "Finance", href: "/finance" },
  { icon: ShoppingCart, label: "Sales", href: "/sales" },
  { icon: Package, label: "Inventory", href: "/inventory" },
  { icon: Warehouse, label: "Warehouses", href: "/warehouses" },
  { icon: ShoppingCart, label: "Purchases", href: "/purchases" },
  { icon: Factory, label: "Production", href: "/production" },
  { icon: Projector, label: "Projects", href: "/projects" },
  { icon: Users, label: "HR", href: "/hr" },
  { icon: FileText, label: "Reports", href: "/reports" },
  { icon: Building2, label: "Companies", href: "/companies" },
  { icon: Users, label: "Users", href: "/users" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar } = useAuthStore();

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
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
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
