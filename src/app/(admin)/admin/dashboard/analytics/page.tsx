"use client";

import React, { useState } from "react";
import { useAdminApps } from "@/hooks/use-admin-data";
import { useAdminStats } from "@/hooks/use-admin-data";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPercent, formatCount, formatDisplayDate, daysAgo, todayApiDate } from "@/lib/utils";
import { AD_TYPE_LABELS } from "@/constants/ad";

const PRESETS = [{ label: "7d", days: 7 }, { label: "14d", days: 14 }, { label: "30d", days: 30 }];

export default function AdminAnalyticsPage() {
  const { data: apps = [], isLoading: appsLoading } = useAdminApps();
  const [selectedAppId, setSelectedAppId] = useState<string>("");
  const [preset, setPreset] = useState(7);

  const from = daysAgo(preset);
  const to = todayApiDate();

  const { data: stats, isLoading: statsLoading } = useAdminStats(
    selectedAppId,
    from,
    to,
  );

  return (
    <div className="dashboard-content">
      <h1 className="text-xl font-semibold text-slate-900">Analytics</h1>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-64">
          {appsLoading ? (
            <Skeleton className="h-10 rounded-md" />
          ) : (
            <Select value={selectedAppId} onValueChange={setSelectedAppId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an app…" />
              </SelectTrigger>
              <SelectContent>
                {apps.map((a) => (
                  <SelectItem key={a.id} value={String(a.id)}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="flex gap-1">
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
        </div>
        <span className="text-xs text-slate-400 ml-auto hidden sm:block">
          {formatDisplayDate(from)} – {formatDisplayDate(to)}
        </span>
      </div>

      {!selectedAppId && (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-sm text-slate-400">
          Select an app to view analytics.
        </div>
      )}

      {selectedAppId && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Requests",    value: stats ? formatCount(stats.total_requests)   : "—" },
              { label: "Impressions", value: stats ? formatCount(stats.total_impressions) : "—" },
              { label: "Clicks",      value: stats ? formatCount(stats.total_clicks)      : "—" },
              { label: "CTR",         value: stats ? formatPercent(stats.ctr)             : "—" },
              { label: "Fill Rate",   value: stats ? formatPercent(stats.fill_rate)       : "—" },
              { label: "Match Rate",  value: stats ? formatPercent(stats.match_rate)      : "—" },
              { label: "Loads",       value: stats ? formatCount(stats.total_loads)       : "—" },
              { label: "Fails",       value: stats ? formatCount(stats.total_fails)       : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-card">
                {statsLoading
                  ? <Skeleton className="h-8 w-16 mb-1" />
                  : <p className="text-2xl font-bold text-slate-900">{value}</p>}
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>

          {/* By network */}
          {!statsLoading && stats?.by_network && stats.by_network.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">By Network</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {["Network", "Requests", "Impressions", "Clicks", "Fails", "CTR"].map((h) => (
                        <th key={h} className="pb-2 text-left text-xs font-semibold text-slate-400 pr-6">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {stats.by_network.map((row) => (
                      <tr key={row.network}>
                        <td className="py-2.5 pr-6 font-medium text-slate-900">{row.network}</td>
                        <td className="py-2.5 pr-6 text-slate-600">{formatCount(row.requests)}</td>
                        <td className="py-2.5 pr-6 text-slate-600">{formatCount(row.impressions)}</td>
                        <td className="py-2.5 pr-6 text-slate-600">{formatCount(row.clicks)}</td>
                        <td className="py-2.5 pr-6 text-slate-600">{formatCount(row.fails)}</td>
                        <td className="py-2.5 pr-6 text-slate-600">{formatPercent(row.ctr)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* By placement */}
          {!statsLoading && stats?.by_placement && stats.by_placement.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">By Placement</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {["Type", "Placement", "Requests", "Impressions", "Clicks", "CTR"].map((h) => (
                        <th key={h} className="pb-2 text-left text-xs font-semibold text-slate-400 pr-6">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {stats.by_placement.map((row) => (
                      <tr key={`${row.ad_type}:${row.placement}`}>
                        <td className="py-2.5 pr-6 text-xs text-slate-500">{AD_TYPE_LABELS[row.ad_type]}</td>
                        <td className="py-2.5 pr-6 font-medium text-slate-900">{row.placement}</td>
                        <td className="py-2.5 pr-6 text-slate-600">{formatCount(row.requests)}</td>
                        <td className="py-2.5 pr-6 text-slate-600">{formatCount(row.impressions)}</td>
                        <td className="py-2.5 pr-6 text-slate-600">{formatCount(row.clicks)}</td>
                        <td className="py-2.5 pr-6 text-slate-600">{formatPercent(row.ctr)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!statsLoading && !stats && (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
              <p className="text-sm text-slate-400">No analytics data for this period.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
