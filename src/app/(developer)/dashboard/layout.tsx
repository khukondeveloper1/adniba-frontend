"use client";

import React, { useState } from "react";
import { useDeveloperGuard } from "@/hooks/use-developer-guard";
import { DeveloperSidebar, DashboardTopbar } from "@/components/dashboard/developer-sidebar";
import { Skeleton } from "@/components/ui/badge";

export default function DeveloperDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useDeveloperGuard();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="space-y-3 w-64">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-52" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DeveloperSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex flex-1 flex-col min-w-0">
        <DashboardTopbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
