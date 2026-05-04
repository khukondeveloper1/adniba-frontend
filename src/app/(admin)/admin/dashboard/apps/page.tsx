"use client";

import React, { useState } from "react";
import { History, RefreshCw, Search, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import {
  useAdminApps,
  useAdminAppEvents,
  useAdminDeleteApp,
  useAdminRotateKey,
  useAdminSendEmail,
  useAdminSuspendApp,
  useAdminUnsuspendApp,
  useAdminUsers,
} from "@/hooks/use-admin-data";
import { useApiError } from "@/hooks/use-api-error";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { ConfirmDialog } from "@/components/ui/dialog";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge, Skeleton } from "@/components/ui/badge";
import { FormField } from "@/components/ui/input";
import { formatDisplayDate, getInitials, truncate } from "@/lib/utils";
import type { App, AppEvent } from "@/types";

export default function AdminAppsPage() {
  const { data: apps = [], isLoading } = useAdminApps();
  const { data: usersData } = useAdminUsers();
  const { mutateAsync: deleteApp, isPending: deleting } = useAdminDeleteApp();
  const { mutateAsync: sendEmail } = useAdminSendEmail();
  const { mutateAsync: suspendApp, isPending: suspending } = useAdminSuspendApp();
  const { mutateAsync: unsuspendApp, isPending: unsuspending } = useAdminUnsuspendApp();
  const { mutateAsync: rotateKey } = useAdminRotateKey();
  const { handleError } = useApiError();
  const { copy, copied } = useCopyToClipboard();

  const [search, setSearch] = useState("");
  const [suspendTarget, setSuspendTarget] = useState<App | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [unsuspendTarget, setUnsuspendTarget] = useState<App | null>(null);
  const [removeTarget, setRemoveTarget] = useState<App | null>(null);
  const [timelineTarget, setTimelineTarget] = useState<App | null>(null);
  const [newKey, setNewKey] = useState<{ key: string; appName: string } | null>(null);

  const users = usersData?.users ?? [];
  const userMap = new Map(users.map((user) => [user.id, user]));

  const filtered = apps.filter(
    (app) =>
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.package_name.toLowerCase().includes(search.toLowerCase()),
  );

  const resolveOwner = (app: App) =>
    app.user ?? (app.user_id ? userMap.get(app.user_id) : undefined);

  const handleSuspend = async () => {
    if (!suspendTarget || suspendReason.trim().length < 10) return;

    try {
      await suspendApp({
        id: suspendTarget.id,
        input: { reason: suspendReason.trim() },
      });
      setSuspendTarget(null);
      setSuspendReason("");
    } catch (err) {
      handleError(err);
    }
  };

  const handleUnsuspend = async () => {
    if (!unsuspendTarget) return;

    try {
      await unsuspendApp(unsuspendTarget.id);
      setUnsuspendTarget(null);
    } catch (err) {
      handleError(err);
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;

    const owner = resolveOwner(removeTarget);

    try {
      await deleteApp(removeTarget.id);

      if (owner?.id) {
        await sendEmail({
          id: owner.id,
          input: {
            subject: `Your app "${removeTarget.name}" has been removed`,
            body: `
              <p>Hello ${owner.name},</p>
              <p>Your app <strong>${removeTarget.name}</strong> (${removeTarget.package_name}) has been removed from the Adniba platform by an administrator.</p>
              <p>This app API key is no longer valid.</p>
              <p>If you need help, please contact support.</p>
            `.trim(),
          },
        });
      }

      setRemoveTarget(null);
    } catch (err) {
      handleError(err);
    }
  };

  const handleRotate = async (app: App) => {
    try {
      const key = await rotateKey(app.id);
      setNewKey({ key, appName: app.name });
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div className="dashboard-content">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Apps ({apps.length})</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search apps..."
            className="h-9 w-64 rounded-md border border-slate-200 bg-white pl-9 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100">
            <tr>
              {["App", "Developer", "Networks", "Units", "Status", "Created", "Actions"].map((heading) => (
                <th
                  key={heading}
                  className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index}>
                    <td colSpan={7} className="px-5 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  </tr>
                ))
              : filtered.map((app) => {
                  const owner = resolveOwner(app);

                  return (
                    <tr key={app.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          {app.app_logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={app.app_logo}
                              alt=""
                              className="h-8 w-8 rounded-lg border border-slate-100 object-cover"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                              {getInitials(app.name)}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-slate-900">{truncate(app.name, 24)}</p>
                            <p className="font-mono text-xs text-slate-400">{truncate(app.package_name, 28)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {owner ? (
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">{truncate(owner.name, 22)}</p>
                            <p className="truncate text-xs text-slate-400">{truncate(owner.email, 28)}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">{app.user_id ?? "-"}</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{app.ad_networks_count}</td>
                      <td className="px-5 py-3.5 text-slate-600">{app.ad_units_count}</td>
                      <td className="px-5 py-3.5">
                        {app.is_suspended ? (
                          <Badge variant="suspended">Suspended</Badge>
                        ) : app.app_status ? (
                          <Badge variant="active">Active</Badge>
                        ) : (
                          <Badge variant="inactive">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-400">{formatDisplayDate(app.created_at)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          {app.is_suspended ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-200 text-green-600"
                              onClick={() => setUnsuspendTarget(app)}
                            >
                              <ShieldCheck className="h-3.5 w-3.5" /> Reinstate
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-600"
                              onClick={() => setSuspendTarget(app)}
                            >
                              <ShieldOff className="h-3.5 w-3.5" /> Suspend
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-slate-400"
                            onClick={() => setTimelineTarget(app)}
                            title="View event history"
                          >
                            <History className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-slate-400"
                            onClick={() => handleRotate(app)}
                            title="Rotate API key"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => setRemoveTarget(app)}
                            title="Remove app"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      <Dialog open={!!suspendTarget} onOpenChange={(open) => !open && setSuspendTarget(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Suspend "{suspendTarget?.name}"</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <FormField
              label="Reason (shown to developer)"
              required
              placeholder="Minimum 10 characters..."
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              error={suspendReason.length > 0 && suspendReason.length < 10}
              errorMessage={
                suspendReason.length > 0 && suspendReason.length < 10
                  ? "At least 10 characters required"
                  : undefined
              }
            />
            <p className="mt-3 text-xs text-slate-500">
              Suspending an app should block its API key and notify the developer from the backend.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSuspendTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              loading={suspending}
              onClick={handleSuspend}
              disabled={suspendReason.trim().length < 10}
            >
              Suspend App
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!unsuspendTarget}
        onOpenChange={(open) => !open && setUnsuspendTarget(null)}
        title={`Reinstate "${unsuspendTarget?.name}"?`}
        description="The developer will regain full access to this app."
        confirmLabel="Reinstate"
        variant="default"
        onConfirm={handleUnsuspend}
        loading={unsuspending}
      />

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title={`Remove "${removeTarget?.name}" permanently?`}
        description="This will delete the app, send the developer an email, and the app API key will stop working."
        confirmLabel="Remove App"
        variant="destructive"
        onConfirm={handleRemove}
        loading={deleting}
      />

      <EventTimelineDialog
        app={timelineTarget}
        open={!!timelineTarget}
        onOpenChange={(open) => !open && setTimelineTarget(null)}
      />

      <Dialog open={!!newKey} onOpenChange={(open) => !open && setNewKey(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>New API Key - {newKey?.appName}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-700">
              The old key is now invalid. Share this new key with the developer.
            </p>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <code className="break-all text-xs font-mono text-slate-700">{newKey?.key}</code>
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

function EventTimelineDialog({
  app,
  open,
  onOpenChange,
}: {
  app: App | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: events = [], isLoading } = useAdminAppEvents(app?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Timeline - {app?.name}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              No app events recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <TimelineItem key={event.id} event={event} />
              ))}
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

function TimelineItem({ event }: { event: AppEvent }) {
  const actorLabel =
    event.actor_type.charAt(0).toUpperCase() + event.actor_type.slice(1);

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="inactive">{actorLabel}</Badge>
          <span className="text-sm font-semibold text-slate-900">{event.event_type}</span>
          {event.from_status && event.to_status && (
            <span className="text-xs text-slate-500">
              {event.from_status} to {event.to_status}
            </span>
          )}
        </div>
        <span className="text-xs text-slate-400">{formatDisplayDate(event.created_at)}</span>
      </div>
      {event.reason && (
        <p className="mt-2 text-sm text-slate-600">Reason: {event.reason}</p>
      )}
    </div>
  );
}
