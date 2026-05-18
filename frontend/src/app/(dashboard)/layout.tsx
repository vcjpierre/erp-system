"use client";

import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isSidebarOpen } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div
        className="flex flex-1 flex-col transition-all duration-300"
        style={{ marginLeft: isSidebarOpen ? 260 : 72 }}
      >
        <Navbar />
        <main className="flex-1 p-4 lg:p-6">
          <div className="mb-4">
            <Breadcrumbs />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
