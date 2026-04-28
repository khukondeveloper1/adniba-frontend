import React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  iconClass?: string;
  trend?: "up" | "down" | "neutral";
  loading?: boolean;
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconClass = "bg-blue-50 text-blue-600",
  loading,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-32" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", iconClass)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
