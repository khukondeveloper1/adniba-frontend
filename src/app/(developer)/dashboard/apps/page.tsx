"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Key,
  Loader2,
  MoreVertical,
  Plus,
  Settings,
  Smartphone,
  Trash2,
} from "lucide-react";
import {
  useApps,
  useDeleteApp,
  useMe,
  useToggleAdsEnabled,
  useToggleAppStatus,
} from "@/hooks/use-developer-data";
import { useApiError } from "@/hooks/use-api-error";
import { CreateAppDialog } from "@/components/apps/create-app-dialog";
import { ApiKeyDialog } from "@/components/apps/api-key-dialog";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge, Skeleton } from "@/components/ui/badge";
import { Switch } from "@/components/ui/select";
import { getInitials, formatDisplayDate } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import type { App } from "@/types";

export default function AppsPage() {
  const { data: appsData, isLoading } = useApps();
  const { data: me } = useMe();
  const { mutateAsync: deleteApp, isPending: deleting } = useDeleteApp();
  const { handleError } = useApiError();

  const [createOpen, setCreateOpen] = useState(false);
  const [keyDialog, setKeyDialog] = useState<App | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<App | null>(null);

  const apps = appsData?.data ?? [];
  const atLimit = me ? me.remaining_slots <= 0 : false;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteApp(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div className="dashboard-content">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Apps</h1>
          {me && (
            <p className="mt-0.5 text-sm text-slate-500">
              {me.apps_used} of {me.app_limit} apps used
            </p>
          )}
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          disabled={atLimit}
          title={atLimit ? "App limit reached. Request an increase in Settings." : undefined}
        >
          <Plus className="h-4 w-4" /> New App
        </Button>
      </div>

      {atLimit && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          You&apos;ve reached your app limit ({me?.app_limit}).{" "}
          <Link href={ROUTES.devSettings} className="font-medium underline">
            Request an increase
          </Link>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <Smartphone className="h-7 w-7 text-slate-400" />
          </div>
          <h2 className="mb-1 text-base font-semibold text-slate-900">No apps yet</h2>
          <p className="mb-5 max-w-xs text-sm text-slate-500">
            Create your first app to start serving ads through Adniba.
          </p>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Create App
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              onGetKey={() => setKeyDialog(app)}
              onDelete={() => setDeleteTarget(app)}
            />
          ))}
        </div>
      )}

      <CreateAppDialog open={createOpen} onOpenChange={setCreateOpen} />

      {keyDialog && (
        <ApiKeyDialog
          open={!!keyDialog}
          onOpenChange={(open) => !open && setKeyDialog(null)}
          appId={keyDialog.id}
          apiKey={keyDialog.api_key}
          appName={keyDialog.name}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This will permanently delete the app, all its ad units, networks and settings. This cannot be undone."
        confirmLabel="Delete App"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}

function AppCard({
  app,
  onGetKey,
  onDelete,
}: {
  app: App;
  onGetKey: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { mutateAsync: toggleStatus, isPending: statusPending } = useToggleAppStatus(app.id);
  const { mutateAsync: toggleAds, isPending: adsPending } = useToggleAdsEnabled(app.id);

  return (
    <div className="relative rounded-xl border border-slate-200 bg-white shadow-card transition-shadow hover:shadow-card-hover">
      {app.is_suspended && (
        <div className="rounded-t-xl border-b border-red-200 bg-red-50 px-4 py-2 text-xs font-medium text-red-600">
          Suspended - {app.suspension_reason ?? "Contact support"}
        </div>
      )}

      <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
        <Link href={ROUTES.appDetail(app.id)} className="flex min-w-0 flex-1 items-start gap-3">
          {app.app_logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={app.app_logo}
              alt={app.name}
              className="h-12 w-12 shrink-0 rounded-xl border border-slate-100 object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
              {getInitials(app.name)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold text-slate-900">{app.name}</p>
              <StatusBadge app={app} />
            </div>
            <p className="mt-0.5 truncate font-mono text-xs text-slate-400">{app.package_name}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>{app.ad_units_count} units</span>
              <span>Updated {formatDisplayDate(app.updated_at)}</span>
            </div>
          </div>
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <ToggleRow
            label="Active"
            checked={app.app_status}
            disabled={app.is_suspended || statusPending}
            loading={statusPending}
            onCheckedChange={(checked) =>
              toggleStatus({ active: checked }).catch(() => undefined)
            }
          />
          <ToggleRow
            label="Global Ads"
            checked={app.global_ad_enabled}
            disabled={app.is_suspended || !app.app_status || adsPending}
            loading={adsPending}
            onCheckedChange={(checked) =>
              toggleAds({ enabled: checked }).catch(() => undefined)
            }
          />

          <div className="flex items-center gap-1 self-end sm:self-auto">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onGetKey}
              title="Get API Key"
              className="text-slate-400 hover:text-slate-700"
            >
              <Key className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              asChild
              className="text-slate-400 hover:text-slate-700"
            >
              <Link href={ROUTES.appDetail(app.id)}>
                <Settings className="h-3.5 w-3.5" />
              </Link>
            </Button>

            <div className="relative">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-slate-400 hover:text-slate-700"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-8 z-20 w-36 rounded-lg border border-slate-200 bg-white py-1 shadow-dialog">
                    <button
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete();
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete App
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  disabled,
  loading,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  loading: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex min-w-[150px] items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <div className="flex items-center gap-2">
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
        <Switch checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} />
      </div>
    </div>
  );
}

function StatusBadge({
  app,
}: {
  app: Pick<App, "app_status" | "is_suspended" | "global_ad_enabled">;
}) {
  if (app.is_suspended) return <Badge variant="suspended">Suspended</Badge>;
  if (!app.app_status) return <Badge variant="inactive">Inactive</Badge>;
  if (!app.global_ad_enabled) return <Badge variant="warning">Ads Off</Badge>;
  return <Badge variant="active">Active</Badge>;
}
