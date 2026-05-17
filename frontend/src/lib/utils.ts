import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "MXN"): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(date: string | Date, format: "short" | "long" | "relative" = "short"): string {
  const d = typeof date === "string" ? new Date(date) : date;

  if (format === "relative") {
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
  }

  return d.toLocaleDateString("es-MX", {
    year: "numeric",
    month: format === "long" ? "long" : "2-digit",
    day: "2-digit",
  });
}

export function truncate(str: string, length = 50): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + "...";
}

export function generateAvatar(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}
