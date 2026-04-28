"use client";

import React, { useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Key, Power, Tv2, AlertTriangle,
  Globe, Layers, BarChart3, Settings,
} from "lucide-react";
import Link from "next/link";
import {
  useApp, useToggleAppStatus, useToggleAdsEnabled,
} from "@/hooks/use-developer-data";
import { useApiError } from "@/hooks/use-api-error";
import { ApiKeyDialog } from "@/components/apps/api-key-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDisplayDate, getInitials } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

// Lazy-loaded tab content (imported inline to keep file size manageable)
import { NetworksTab } from "@/components/apps/networks-tab";
import { AdUnitsTab } from "@/components/apps/ad-units-tab";
import { AdSettingsTab } from "@/components/apps/ad-settings-tab";
import { AnalyticsTab } from "@/components/apps/analytics-tab";

const TABS = [
  { value: "overview",  label: "Overview",   icon: Settings },
  { value: "networks",  label: "Networks",   icon: Globe },
  { value: "units",     label: "Ad Units",   icon: Layers },
  { value: "settings",  label: "Ad Settings",icon: Tv2 },
  { value: "analytics", label: "Analytics",  icon: BarChart3 },
] as const;

type TabValue = (typeof TABS)[number]["value"];

export default function AppDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const defaultTab = (searchParams.get("tab") ?? "overview") as TabValue;
  const [activeTab, setActiveTab] = useState<TabValue>(defaultTab);
  const [keyDialogOpen, setKeyDialogOpen] = useState(false);

  const { data: app, isLoading } = useApp(id);
  const { mutateAsync: toggleStatus } = useToggleAppStatus(id);
  const { mutateAsync: toggleAds } = useToggleAdsEnabled(id);
  const { handleError } = useApiError();

  const handleTab = (tab: string) => {
    setActiveTab(tab as TabValue);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${ROUTES.appDetail(id)}?${params.toString()}`, { scroll: false });
  };

  if (isLoading) return <AppDetailSkeleton />;

  if (!app) {
    return (
      <div className="dashboard-content text-center py-20">
        <p className="text-slate-500">App not found.</p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link href={ROUTES.apps}>← Back to Apps</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      {/* Breadcrumb */}
      <Link href={ROUTES.apps} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Apps
      </Link>

      {/* App header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
        {app.is_suspended && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3 mb-4 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <span className="font-medium">App suspended.</span>{" "}
              {app.suspension_reason ?? "Contact support for details."}
            </div>
          </div>
        )}

        <div className="flex items-start gap-4">
          {app.app_logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={app.app_logo} alt={app.name} className="h-14 w-14 rounded-xl object-cover border border-slate-100 shrink-0" />
          ) : (
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-base font-bold text-primary shrink-0">
              {getInitials(app.name)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-semibold text-slate-900">{app.name}</h1>
              <AppStatusBadge app={app} />
            </div>
            <p className="text-xs font-mono text-slate-400 mt-0.5">{app.package_name}</p>
            <p className="text-xs text-slate-400 mt-1">Created {formatDisplayDate(app.created_at)}</p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">App Active</span>
              <Switch
                checked={app.app_status}
                disabled={app.is_suspended}
                onCheckedChange={async (checked) => {
                  try { await toggleStatus({ active: checked }); }
                  catch (err) { handleError(err); }
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Ads On</span>
              <Switch
                checked={app.global_ad_enabled}
                disabled={app.is_suspended || !app.app_status}
                onCheckedChange={async (checked) => {
                  try { await toggleAds({ enabled: checked }); }
                  catch (err) { handleError(err); }
                }}
              />
            </div>
            <Button size="sm" variant="outline" onClick={() => setKeyDialogOpen(true)}>
              <Key className="h-3.5 w-3.5" /> API Key
            </Button>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100">
          {[
            { label: "Networks", value: app.ad_networks_count },
            { label: "Ad Units", value: app.ad_units_count },
            { label: "Status", value: app.is_suspended ? "Suspended" : app.app_status ? "Active" : "Inactive" },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-lg font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTab}>
        <TabsList className="flex-wrap h-auto">
          {TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value}>
              <Icon className="h-3.5 w-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <AppOverviewTab app={app} onGetKey={() => setKeyDialogOpen(true)} />
        </TabsContent>
        <TabsContent value="networks">
          <NetworksTab appId={Number(id)} />
        </TabsContent>
        <TabsContent value="units">
          <AdUnitsTab appId={Number(id)} />
        </TabsContent>
        <TabsContent value="settings">
          <AdSettingsTab appId={Number(id)} />
        </TabsContent>
        <TabsContent value="analytics">
          <AnalyticsTab appId={Number(id)} />
        </TabsContent>
      </Tabs>

      {/* API Key dialog */}
      <ApiKeyDialog
        open={keyDialogOpen}
        onOpenChange={setKeyDialogOpen}
        appId={app.id}
        apiKey={app.api_key}
        appName={app.name}
      />
    </div>
  );
}

// ── Overview tab ──────────────────────────────────────────────────

import type { App } from "@/types";

function AppOverviewTab({ app, onGetKey }: { app: App; onGetKey: () => void }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-card divide-y divide-slate-100">
        {[
          { label: "App Name", value: app.name },
          { label: "Package Name", value: <span className="font-mono text-sm">{app.package_name}</span> },
          { label: "Created", value: formatDisplayDate(app.created_at) },
          { label: "Last Updated", value: formatDisplayDate(app.updated_at) },
          app.play_store_url ? { label: "Play Store", value: <a href={app.play_store_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">{app.play_store_url}</a> } : null,
        ].filter(Boolean).map((row) => (
          <div key={row!.label} className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm text-slate-500">{row!.label}</span>
            <span className="text-sm text-slate-900 font-medium">{row!.value}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900">API Key</h3>
          <Button size="sm" variant="outline" onClick={onGetKey}>
            <Key className="h-3.5 w-3.5" /> Get API Key
          </Button>
        </div>
        <p className="text-sm text-slate-500">
          Use this key to authenticate SDK and External API requests for this app.
          Never expose it in public repositories.
        </p>
      </div>
    </div>
  );
}

function AppStatusBadge({ app }: { app: Pick<App, "app_status" | "is_suspended" | "global_ad_enabled"> }) {
  if (app.is_suspended) return <Badge variant="suspended">Suspended</Badge>;
  if (!app.app_status) return <Badge variant="inactive">Inactive</Badge>;
  if (!app.global_ad_enabled) return <Badge variant="warning">Ads Off</Badge>;
  return <Badge variant="active">Active</Badge>;
}

function AppDetailSkeleton() {
  return (
    <div className="dashboard-content">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-32 rounded-xl" />
      <Skeleton className="h-10 w-96 rounded-lg" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
