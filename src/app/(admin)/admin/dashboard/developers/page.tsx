"use client";

import React, { useState } from "react";
import { Search, UserCheck, UserX, Settings2, Mail } from "lucide-react";
import {
  useAdminUsers, useAdminToggleUserStatus,
  useAdminSetAppLimit, useAdminSendEmail,
} from "@/hooks/use-admin-data";
import { useApiError } from "@/hooks/use-api-error";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/badge";
import { FormField } from "@/components/ui/input";
import { formatDisplayDate, getInitials, truncate } from "@/lib/utils";
import type { AdminDeveloper } from "@/types";

export default function AdminDevelopersPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAdminUsers({ search: search || undefined });
  const { mutateAsync: toggleStatus, isPending: toggling } = useAdminToggleUserStatus();
  const { mutateAsync: setLimit, isPending: settingLimit } = useAdminSetAppLimit();
  const { mutateAsync: sendEmail, isPending: sending } = useAdminSendEmail();
  const { handleError } = useApiError();

  const [toggleTarget, setToggleTarget] = useState<AdminDeveloper | null>(null);
  const [deactivateReason, setDeactivateReason] = useState("");
  const [limitTarget, setLimitTarget] = useState<AdminDeveloper | null>(null);
  const [limitValue, setLimitValue] = useState("");
  const [emailTarget, setEmailTarget] = useState<AdminDeveloper | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const users = data?.users ?? [];
  const stats = data?.stats;
  const isDeactivating = Boolean(toggleTarget?.status);
  const trimmedDeactivateReason = deactivateReason.trim();

  const handleToggle = async () => {
    if (!toggleTarget) return;
    const active = !toggleTarget.status;
    if (!active && !trimmedDeactivateReason) return;

    try {
      await toggleStatus({
        id: toggleTarget.id,
        input: active
          ? { active }
          : { active, reason: trimmedDeactivateReason },
      });
      setToggleTarget(null);
      setDeactivateReason("");
    } catch (err) { handleError(err); }
  };

  const closeToggleDialog = () => {
    setToggleTarget(null);
    setDeactivateReason("");
  };

  const handleSetLimit = async () => {
    if (!limitTarget) return;
    try {
      await setLimit({ id: limitTarget.id, input: { limit: Number(limitValue) } });
      setLimitTarget(null);
      setLimitValue("");
    } catch (err) { handleError(err); }
  };

  const handleSendEmail = async () => {
    if (!emailTarget) return;
    try {
      await sendEmail({ id: emailTarget.id, input: { subject: emailSubject, body: emailBody } });
      setEmailTarget(null);
      setEmailSubject("");
      setEmailBody("");
    } catch (err) { handleError(err); }
  };

  return (
    <div className="dashboard-content">
      {/* Header + stats */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Developers</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search developers…"
            className="h-9 pl-9 pr-4 rounded-md border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-64" />
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total", value: stats.total_users },
            { label: "Active", value: stats.active_users },
            { label: "Inactive", value: stats.inactive_users },
            { label: "Total Apps", value: stats.total_apps },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-card">
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100">
            <tr>
              {["Developer", "Apps", "Limit", "Status", "Joined", "Actions"].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={6} className="px-5 py-3"><Skeleton className="h-4 w-full" /></td></tr>)
              : users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{truncate(user.name, 24)}</p>
                        <p className="text-xs text-slate-400">{truncate(user.email, 30)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{user.apps_count}</td>
                  <td className="px-5 py-3.5 text-slate-600">{user.app_limit}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={user.status ? "active" : "inactive"}>{user.status ? "Active" : "Inactive"}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">{formatDisplayDate(user.created_at)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="text-slate-400 hover:text-slate-700" onClick={() => { setToggleTarget(user); setDeactivateReason(""); }} title={user.status ? "Deactivate" : "Activate"}>
                        {user.status ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="ghost" className="text-slate-400 hover:text-slate-700" onClick={() => { setLimitTarget(user); setLimitValue(String(user.app_limit + 5)); }} title="Set app limit">
                        <Settings2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-slate-400 hover:text-slate-700" onClick={() => setEmailTarget(user)} title="Send email">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Toggle status confirm */}
      {isDeactivating ? (
        <Dialog open={!!toggleTarget} onOpenChange={(o) => !o && closeToggleDialog()}>
          <DialogContent size="sm">
            <DialogHeader><DialogTitle>Deactivate {toggleTarget?.name}?</DialogTitle></DialogHeader>
            <DialogBody className="space-y-3">
              <p className="text-sm text-slate-500">The developer will lose access to their dashboard.</p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Reason <span className="text-destructive">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={deactivateReason}
                  onChange={(e) => setDeactivateReason(e.target.value)}
                  placeholder="Policy violation"
                  className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                />
              </div>
            </DialogBody>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={closeToggleDialog}>Cancel</Button>
              <Button
                size="sm"
                variant="destructive"
                loading={toggling}
                onClick={handleToggle}
                disabled={!trimmedDeactivateReason}
              >
                Deactivate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <ConfirmDialog
          open={!!toggleTarget}
          onOpenChange={(o) => !o && closeToggleDialog()}
          title={`Activate ${toggleTarget?.name}?`}
          description="The developer will regain access."
          confirmLabel="Activate"
          variant="default"
          onConfirm={handleToggle}
          loading={toggling}
        />
      )}

      {/* Set limit dialog */}
      <Dialog open={!!limitTarget} onOpenChange={(o) => !o && setLimitTarget(null)}>
        <DialogContent size="sm">
          <DialogHeader><DialogTitle>Set App Limit — {limitTarget?.name}</DialogTitle></DialogHeader>
          <DialogBody>
            <FormField
              label="New app limit"
              type="number"
              required
              min={1}
              max={100}
              value={limitValue}
              onChange={(e) => setLimitValue(e.target.value)}
              hint={`Current: ${limitTarget?.app_limit}`}
            />
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setLimitTarget(null)}>Cancel</Button>
            <Button size="sm" loading={settingLimit} onClick={handleSetLimit}>Update Limit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send email dialog */}
      <Dialog open={!!emailTarget} onOpenChange={(o) => !o && setEmailTarget(null)}>
        <DialogContent size="md">
          <DialogHeader><DialogTitle>Email — {emailTarget?.name}</DialogTitle></DialogHeader>
          <DialogBody className="space-y-3">
            <FormField label="Subject" required value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Body <span className="text-destructive">*</span></label>
              <textarea
                rows={5}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEmailTarget(null)}>Cancel</Button>
            <Button size="sm" loading={sending} onClick={handleSendEmail} disabled={!emailSubject || !emailBody}>Send Email</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
