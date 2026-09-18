"use client";

import { useState } from "react";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type NotificationType = "info" | "success" | "warning" | "error";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

// TODO(API): replace with GET /api/notifications (or backend notifications
// module endpoint) once available. No notifications module exists in
// backend/src/modules/* yet, so these typed mocks seed the UI.
const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    type: "warning",
    title: "Low stock alert",
    description: "Product SKU-1042 is below minimum level (4 left).",
    time: "5m ago",
    read: false,
  },
  {
    id: "2",
    type: "success",
    title: "Payment received",
    description: "Invoice INV-2024-0318 was paid ($12,400 MXN).",
    time: "1h ago",
    read: false,
  },
  {
    id: "3",
    type: "info",
    title: "New sales order",
    description: "Order SO-1024 created by Ana Lopez for approval.",
    time: "3h ago",
    read: false,
  },
  {
    id: "4",
    type: "error",
    title: "Sync failed",
    description: "E-commerce inventory sync failed for 2 items. Retry pending.",
    time: "Yesterday",
    read: true,
  },
];

const TYPE_ICON: Record<NotificationType, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};

const TYPE_TILE: Record<NotificationType, string> = {
  info: "bg-primary/10 text-primary",
  success: "bg-green-500/10 text-green-600 dark:text-green-400",
  warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  error: "bg-destructive/10 text-destructive",
};

export function NotificationsDropdown() {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markAsRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {unreadCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="px-1.5 py-0 text-[11px]">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Mark all as read
            </button>
          </div>

          <DropdownMenu.Separator className="h-px bg-border" />

          {/* List */}
          <div
            role="list"
            aria-label="Notification list"
            className="scrollbar-thin max-h-80 overflow-y-auto p-1"
          >
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                You are all caught up.
              </p>
            ) : (
              notifications.map((notification) => {
                const Icon = TYPE_ICON[notification.type];
                return (
                  <DropdownMenu.Item
                    key={notification.id}
                    role="listitem"
                    onSelect={() => markAsRead(notification.id)}
                    className="flex cursor-pointer items-start gap-3 rounded-md px-3 py-2.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        TYPE_TILE[notification.type],
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="truncate font-medium leading-tight">
                          {notification.title}
                        </span>
                        {!notification.read && (
                          <span
                            aria-label="Unread"
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                          />
                        )}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-xs leading-snug text-muted-foreground">
                        {notification.description}
                      </span>
                      <span className="mt-1 block text-[11px] text-muted-foreground">
                        {notification.time}
                      </span>
                    </span>
                  </DropdownMenu.Item>
                );
              })
            )}
          </div>

          <DropdownMenu.Separator className="h-px bg-border" />

          {/* Footer */}
          <div className="p-1">
            {/* TODO(API): point to real /notifications page once the route exists. */}
            <DropdownMenu.Item asChild>
              <Link
                href="/notifications"
                className="flex cursor-pointer items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-primary outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
              >
                View all
              </Link>
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
