"use client";

import React from "react";
import { useAdminGuard } from "@/hooks/use-admin-guard";
import { AdminSidebar } from "@/components/dashboard/admin-sidebar";
import { Skeleton } from "@/components/ui/badge";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAdminGuard();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="space-y-3 w-48">
          <Skeleton className="h-4 w-full bg-slate-800" />
          <Skeleton className="h-4 w-3/4 bg-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-40 flex h-14 items-center border-b border-border bg-white/95 backdrop-blur-sm px-6">
          <p className="text-sm font-semibold text-slate-900">Admin Panel</p>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
