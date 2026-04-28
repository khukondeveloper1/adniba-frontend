"use client";

import React from "react";
import Link from "next/link";
import { Smartphone, CheckCircle, AlertCircle, Plus, ArrowRight } from "lucide-react";
import { useMe, useApps } from "@/hooks/use-developer-data";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/badge";
import { formatDisplayDate, getInitials } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import type { App } from "@/types";

export default function DashboardPage() {
  const { data: me, isLoading: meLoading } = useMe();
  const { data: appsData, isLoading: appsLoading } = useApps();

  const apps = appsData?.data ?? [];
  const activeApps = apps.filter((a) => a.app_status && !a.is_suspended).length;
  const suspendedApps = apps.filter((a) => a.is_suspended).length;
  const recentApps = [...apps]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  return (
    <div className="dashboard-content">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Apps" value={me?.apps_used ?? 0} sub={`Limit: ${me?.app_limit ?? "—"}`} icon={Smartphone} loading={meLoading} />
        <StatCard label="Active Apps" value={activeApps} sub="Serving ads" icon={CheckCircle} iconClass="bg-green-50 text-green-600" loading={appsLoading} />
        <StatCard label="Remaining Slots" value={me?.remaining_slots ?? 0} sub="Available" icon={Plus} iconClass="bg-indigo-50 text-indigo-600" loading={meLoading} />
        <StatCard label="Suspended" value={suspendedApps} sub={suspendedApps > 0 ? "Action required" : "All clear"} icon={AlertCircle} iconClass={suspendedApps > 0 ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-400"} loading={appsLoading} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild><Link href={ROUTES.apps}><Plus className="h-4 w-4" /> Create App</Link></Button>
        <Button variant="outline" asChild><Link href={ROUTES.externalApi}>View API Docs</Link></Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Recent Apps</h2>
          <Link href={ROUTES.apps} className="flex items-center gap-1 text-xs text-primary hover:underline">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {appsLoading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <Skeleton className="h-9 w-9 rounded-xl" />
                <div className="space-y-1.5 flex-1"><Skeleton className="h-3.5 w-36" /><Skeleton className="h-3 w-24" /></div>
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            ))}
          </div>
        ) : recentApps.length === 0 ? (
          <div className="py-12 text-center">
            <Smartphone className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-4">No apps yet.</p>
            <Button size="sm" asChild><Link href={ROUTES.apps}>Create your first app</Link></Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentApps.map((app) => (
              <Link key={app.id} href={ROUTES.appDetail(app.id)} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                {app.app_logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={app.app_logo} alt={app.name} className="h-9 w-9 rounded-xl object-cover border border-slate-100" />
                ) : (
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{getInitials(app.name)}</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{app.name}</p>
                  <p className="text-xs text-slate-400 truncate font-mono">{app.package_name}</p>
                </div>
                <AppHealthBadge app={app} />
                <span className="text-xs text-slate-300 hidden sm:block ml-2">{formatDisplayDate(app.updated_at)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AppHealthBadge({ app }: { app: Pick<App, "app_status" | "is_suspended" | "global_ad_enabled"> }) {
  if (app.is_suspended) return <Badge variant="suspended">Suspended</Badge>;
  if (!app.app_status) return <Badge variant="inactive">Inactive</Badge>;
  if (!app.global_ad_enabled) return <Badge variant="warning">Ads Off</Badge>;
  return <Badge variant="active">Active</Badge>;
}
