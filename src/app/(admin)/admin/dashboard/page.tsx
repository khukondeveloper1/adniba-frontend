"use client";

import React from "react";
import Link from "next/link";
import { Smartphone, Users, Clock, ArrowRight } from "lucide-react";
import { useAdminApps } from "@/hooks/use-admin-data";
import { useAdminUsers } from "@/hooks/use-admin-data";
import { useAdminLimitRequests } from "@/hooks/use-admin-data";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/badge";
import { formatDisplayDate, getInitials, truncate } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

export default function AdminDashboardPage() {
  const { data: apps = [], isLoading: appsLoading } = useAdminApps();
  const { data: usersData, isLoading: usersLoading } = useAdminUsers();
  const { data: pendingRequests = [], isLoading: requestsLoading } = useAdminLimitRequests("pending");

  const stats = usersData?.stats;
  const suspendedApps = apps.filter((a) => a.is_suspended).length;
  const activeApps = apps.filter((a) => a.app_status && !a.is_suspended).length;
  const recentApps = [...apps]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="dashboard-content">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Apps" value={apps.length} sub={`${activeApps} active`} icon={Smartphone} loading={appsLoading} />
        <StatCard label="Developers" value={stats?.total_users ?? 0} sub={`${stats?.active_users ?? 0} active`} icon={Users} iconClass="bg-purple-50 text-purple-600" loading={usersLoading} />
        <StatCard label="Suspended" value={suspendedApps} sub={suspendedApps > 0 ? "Review needed" : "All clear"} icon={Smartphone} iconClass={suspendedApps > 0 ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-400"} loading={appsLoading} />
        <StatCard label="Pending Requests" value={pendingRequests.length} sub="Limit increase queue" icon={Clock} iconClass={pendingRequests.length > 0 ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-400"} loading={requestsLoading} />
      </div>

      {pendingRequests.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-700 font-medium">
            {pendingRequests.length} pending limit request{pendingRequests.length > 1 ? "s" : ""} awaiting review.
          </p>
          <Link href={ROUTES.adminLimitRequests} className="text-sm text-amber-700 underline font-medium">Review →</Link>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Recent Apps</h2>
            <Link href={ROUTES.adminApps} className="flex items-center gap-1 text-xs text-primary hover:underline">View all <ArrowRight className="h-3 w-3" /></Link>
          </div>
          {appsLoading ? (
            <div className="divide-y divide-slate-100">{Array.from({ length: 4 }).map((_, i) => (<div key={i} className="flex items-center gap-3 px-5 py-3.5"><Skeleton className="h-8 w-8 rounded-xl" /><div className="flex-1 space-y-1.5"><Skeleton className="h-3.5 w-32" /><Skeleton className="h-3 w-24" /></div></div>))}</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentApps.map((app) => (
                <div key={app.id} className="flex items-center gap-3 px-5 py-3.5">
                  {app.app_logo
                    ? <img src={app.app_logo} alt="" className="h-8 w-8 rounded-xl object-cover border border-slate-100 shrink-0" />
                    : <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">{getInitials(app.name)}</div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{truncate(app.name, 28)}</p>
                    <p className="text-xs text-slate-400 font-mono truncate">{truncate(app.package_name, 30)}</p>
                  </div>
                  {app.is_suspended ? <Badge variant="suspended">Suspended</Badge> : <Badge variant={app.app_status ? "active" : "inactive"}>{app.app_status ? "Active" : "Inactive"}</Badge>}
                  <span className="text-xs text-slate-300 hidden sm:block">{formatDisplayDate(app.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Recent Developers</h2>
            <Link href={ROUTES.adminDevelopers} className="flex items-center gap-1 text-xs text-primary hover:underline">View all <ArrowRight className="h-3 w-3" /></Link>
          </div>
          {usersLoading ? (
            <div className="divide-y divide-slate-100">{Array.from({ length: 4 }).map((_, i) => (<div key={i} className="flex items-center gap-3 px-5 py-3.5"><Skeleton className="h-8 w-8 rounded-full" /><div className="flex-1 space-y-1.5"><Skeleton className="h-3.5 w-28" /><Skeleton className="h-3 w-36" /></div></div>))}</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {(usersData?.users ?? []).slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">{getInitials(user.name)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{truncate(user.name, 24)}</p>
                    <p className="text-xs text-slate-400 truncate">{truncate(user.email, 30)}</p>
                  </div>
                  <Badge variant={user.status ? "active" : "inactive"}>{user.apps_count} apps</Badge>
                  <span className="text-xs text-slate-300 hidden sm:block">{formatDisplayDate(user.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
