"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Smartphone, MoreVertical, Trash2, Settings, Key } from "lucide-react";
import { useApps, useDeleteApp } from "@/hooks/use-developer-data";
import { useMe } from "@/hooks/use-developer-data";
import { useApiError } from "@/hooks/use-api-error";
import { CreateAppDialog } from "@/components/apps/create-app-dialog";
import { ApiKeyDialog } from "@/components/apps/api-key-dialog";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/badge";
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
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Apps</h1>
          {me && (
            <p className="text-sm text-slate-500 mt-0.5">
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

      {/* Limit warning */}
      {atLimit && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          You&apos;ve reached your app limit ({me?.app_limit}).{" "}
          <Link href={ROUTES.devSettings} className="font-medium underline">
            Request an increase
          </Link>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Smartphone className="h-7 w-7 text-slate-400" />
          </div>
          <h2 className="text-base font-semibold text-slate-900 mb-1">No apps yet</h2>
          <p className="text-sm text-slate-500 mb-5 max-w-xs">
            Create your first app to start serving ads through AdNex.
          </p>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Create App
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* Dialogs */}
      <CreateAppDialog open={createOpen} onOpenChange={setCreateOpen} />

      {keyDialog && (
        <ApiKeyDialog
          open={!!keyDialog}
          onOpenChange={(o) => !o && setKeyDialog(null)}
          appId={keyDialog.id}
          apiKey={keyDialog.api_key}
          appName={keyDialog.name}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This will permanently delete the app, all its ad units, networks and settings. This cannot be undone."
        confirmLabel="Delete App"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}

// ── App card ──────────────────────────────────────────────────────

function AppCard({ app, onGetKey, onDelete }: {
  app: App;
  onGetKey: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative group bg-white rounded-xl border border-slate-200 shadow-card hover:shadow-card-hover transition-shadow flex flex-col">
      {/* Suspended banner */}
      {app.is_suspended && (
        <div className="rounded-t-xl bg-red-50 border-b border-red-200 px-4 py-2 text-xs text-red-600 font-medium">
          Suspended — {app.suspension_reason ?? "Contact support"}
        </div>
      )}

      <Link href={ROUTES.appDetail(app.id)} className="flex items-start gap-3 p-4 flex-1">
        {/* Logo */}
        {app.app_logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={app.app_logo} alt={app.name} className="h-12 w-12 rounded-xl object-cover border border-slate-100 shrink-0" />
        ) : (
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
            {getInitials(app.name)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{app.name}</p>
          <p className="text-xs text-slate-400 font-mono truncate mt-0.5">{app.package_name}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <StatusBadge app={app} />
            <span className="text-xs text-slate-300">·</span>
            <span className="text-xs text-slate-400">{app.ad_units_count} units</span>
          </div>
        </div>
      </Link>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
        <span className="text-xs text-slate-400">{formatDisplayDate(app.updated_at)}</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onGetKey}
            title="Get API Key"
            className="text-slate-400 hover:text-slate-700"
          >
            <Key className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm" asChild className="text-slate-400 hover:text-slate-700">
            <Link href={ROUTES.appDetail(app.id)}><Settings className="h-3.5 w-3.5" /></Link>
          </Button>

          {/* Overflow menu */}
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
                <div className="absolute right-0 bottom-8 z-20 w-36 rounded-lg border border-slate-200 bg-white shadow-dialog py-1">
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    onClick={() => { setMenuOpen(false); onDelete(); }}
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
  );
}

function StatusBadge({ app }: { app: Pick<App, "app_status" | "is_suspended" | "global_ad_enabled"> }) {
  if (app.is_suspended) return <Badge variant="suspended">Suspended</Badge>;
  if (!app.app_status) return <Badge variant="inactive">Inactive</Badge>;
  if (!app.global_ad_enabled) return <Badge variant="warning">Ads Off</Badge>;
  return <Badge variant="active">Active</Badge>;
}
