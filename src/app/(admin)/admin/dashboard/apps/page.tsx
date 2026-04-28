"use client";

import React, { useState } from "react";
import { RefreshCw, ShieldOff, ShieldCheck, Search } from "lucide-react";
import { useAdminApps, useAdminSuspendApp, useAdminUnsuspendApp, useAdminRotateKey } from "@/hooks/use-admin-data";
import { useApiError } from "@/hooks/use-api-error";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/badge";
import { FormField } from "@/components/ui/input";
import { getInitials, formatDisplayDate, truncate } from "@/lib/utils";
import type { App } from "@/types";

export default function AdminAppsPage() {
  const { data: apps = [], isLoading } = useAdminApps();
  const { mutateAsync: suspendApp, isPending: suspending } = useAdminSuspendApp();
  const { mutateAsync: unsuspendApp, isPending: unsuspending } = useAdminUnsuspendApp();
  const { mutateAsync: rotateKey, isPending: rotating } = useAdminRotateKey();
  const { handleError } = useApiError();
  const { copy, copied } = useCopyToClipboard();

  const [search, setSearch] = useState("");
  const [suspendTarget, setSuspendTarget] = useState<App | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [unsuspendTarget, setUnsuspendTarget] = useState<App | null>(null);
  const [newKey, setNewKey] = useState<{ key: string; appName: string } | null>(null);

  const filtered = apps.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.package_name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSuspend = async () => {
    if (!suspendTarget || suspendReason.trim().length < 10) return;
    try {
      await suspendApp({ id: suspendTarget.id, input: { reason: suspendReason.trim() } });
      setSuspendTarget(null);
      setSuspendReason("");
    } catch (err) { handleError(err); }
  };

  const handleUnsuspend = async () => {
    if (!unsuspendTarget) return;
    try { await unsuspendApp(unsuspendTarget.id); setUnsuspendTarget(null); }
    catch (err) { handleError(err); }
  };

  const handleRotate = async (app: App) => {
    try {
      const key = await rotateKey(app.id);
      setNewKey({ key, appName: app.name });
    } catch (err) { handleError(err); }
  };

  return (
    <div className="dashboard-content">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Apps ({apps.length})</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search apps…"
            className="h-9 pl-9 pr-4 rounded-md border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100">
            <tr>
              {["App", "Developer", "Networks", "Units", "Status", "Created", "Actions"].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-5 py-3"><Skeleton className="h-4 w-full" /></td></tr>
              ))
              : filtered.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      {app.app_logo
                        ? <img src={app.app_logo} alt="" className="h-8 w-8 rounded-lg object-cover border border-slate-100" />
                        : <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{getInitials(app.name)}</div>
                      }
                      <div>
                        <p className="font-medium text-slate-900">{truncate(app.name, 24)}</p>
                        <p className="text-xs text-slate-400 font-mono">{truncate(app.package_name, 28)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 text-xs">{app.user_id ?? "—"}</td>
                  <td className="px-5 py-3.5 text-slate-600">{app.ad_networks_count}</td>
                  <td className="px-5 py-3.5 text-slate-600">{app.ad_units_count}</td>
                  <td className="px-5 py-3.5">
                    {app.is_suspended
                      ? <Badge variant="suspended">Suspended</Badge>
                      : app.app_status
                        ? <Badge variant="active">Active</Badge>
                        : <Badge variant="inactive">Inactive</Badge>}
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">{formatDisplayDate(app.created_at)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      {app.is_suspended ? (
                        <Button size="sm" variant="outline" className="text-green-600 border-green-200" onClick={() => setUnsuspendTarget(app)}>
                          <ShieldCheck className="h-3.5 w-3.5" /> Reinstate
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => setSuspendTarget(app)}>
                          <ShieldOff className="h-3.5 w-3.5" /> Suspend
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="text-slate-400" onClick={() => handleRotate(app)} title="Rotate API key">
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Suspend dialog */}
      <Dialog open={!!suspendTarget} onOpenChange={(o) => !o && setSuspendTarget(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Suspend &ldquo;{suspendTarget?.name}&rdquo;</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <FormField
              label="Reason (shown to developer)"
              required
              placeholder="Minimum 10 characters…"
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              error={suspendReason.length > 0 && suspendReason.length < 10}
              errorMessage={suspendReason.length > 0 && suspendReason.length < 10 ? "At least 10 characters required" : undefined}
            />
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSuspendTarget(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" loading={suspending} onClick={handleSuspend} disabled={suspendReason.trim().length < 10}>
              Suspend App
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unsuspend confirm */}
      <ConfirmDialog
        open={!!unsuspendTarget}
        onOpenChange={(o) => !o && setUnsuspendTarget(null)}
        title={`Reinstate "${unsuspendTarget?.name}"?`}
        description="The developer will regain full access to this app."
        confirmLabel="Reinstate"
        variant="default"
        onConfirm={handleUnsuspend}
        loading={unsuspending}
      />

      {/* New key dialog */}
      <Dialog open={!!newKey} onOpenChange={(o) => !o && setNewKey(null)}>
        <DialogContent size="sm">
          <DialogHeader><DialogTitle>New API Key — {newKey?.appName}</DialogTitle></DialogHeader>
          <DialogBody>
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 mb-3">
              The old key is now invalid. Share this new key with the developer.
            </p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
              <code className="text-xs font-mono text-slate-700 break-all">{newKey?.key}</code>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button size="sm" onClick={() => newKey && copy(newKey.key)}>
              {copied ? "Copied!" : "Copy Key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
