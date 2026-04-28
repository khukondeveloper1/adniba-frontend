"use client";

import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useAppStats } from "@/hooks/use-developer-data";
import { Skeleton } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPercent, formatCount, formatDisplayDate } from "@/lib/utils";
import { daysAgo, todayApiDate } from "@/lib/utils";
import { AD_TYPE_LABELS } from "@/constants/ad";

// ─────────────────────────────────────────────────────────────────
// ANALYTICS TAB
// Data: summary stats + daily chart from /developer/apps/{id}/stats
// ─────────────────────────────────────────────────────────────────

const PRESETS = [
  { label: "7d",  days: 7 },
  { label: "14d", days: 14 },
  { label: "30d", days: 30 },
];

export function AnalyticsTab({ appId }: { appId: number }) {
  const [preset, setPreset] = useState(7);
  const from = daysAgo(preset);
  const to = todayApiDate();

  const { data: stats, isLoading } = useAppStats(appId, from, to);

  return (
    <div className="space-y-5">
      {/* Date range controls */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500 mr-1">Range:</span>
        {PRESETS.map((p) => (
          <Button
            key={p.days}
            size="sm"
            variant={preset === p.days ? "default" : "outline"}
            onClick={() => setPreset(p.days)}
          >
            {p.label}
          </Button>
        ))}
        <span className="ml-auto text-xs text-slate-400 hidden sm:block">
          {formatDisplayDate(from)} – {formatDisplayDate(to)}
        </span>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Requests",    value: stats ? formatCount(stats.total_requests)   : "—" },
          { label: "Impressions", value: stats ? formatCount(stats.total_impressions) : "—" },
          { label: "CTR",         value: stats ? formatPercent(stats.ctr)             : "—" },
          { label: "Fill Rate",   value: stats ? formatPercent(stats.fill_rate)       : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-card">
            {isLoading ? <Skeleton className="h-8 w-16 mb-1" /> : <p className="text-2xl font-bold text-slate-900">{value}</p>}
            <p className="text-xs text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Daily chart — uses daily breakdown if available, else plots summary */}
      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : stats?.by_network && stats.by_network.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">By Network</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Network", "Requests", "Impressions", "Clicks", "Fails", "CTR"].map((h) => (
                    <th key={h} className="pb-2 text-left text-xs font-semibold text-slate-400 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.by_network.map((row) => (
                  <tr key={row.network}>
                    <td className="py-2.5 pr-4 font-medium text-slate-900">{row.network}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{formatCount(row.requests)}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{formatCount(row.impressions)}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{formatCount(row.clicks)}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{formatCount(row.fails)}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{formatPercent(row.ctr)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* By placement */}
      {!isLoading && stats?.by_placement && stats.by_placement.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">By Placement</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Type", "Placement", "Requests", "Impressions", "Clicks", "CTR"].map((h) => (
                    <th key={h} className="pb-2 text-left text-xs font-semibold text-slate-400 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.by_placement.map((row) => (
                  <tr key={`${row.ad_type}:${row.placement}`}>
                    <td className="py-2.5 pr-4 text-xs text-slate-500">{AD_TYPE_LABELS[row.ad_type]}</td>
                    <td className="py-2.5 pr-4 font-medium text-slate-900">{row.placement}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{formatCount(row.requests)}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{formatCount(row.impressions)}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{formatCount(row.clicks)}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{formatPercent(row.ctr)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isLoading && !stats && (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <p className="text-sm text-slate-400">No analytics data for this period.</p>
        </div>
      )}
    </div>
  );
}
