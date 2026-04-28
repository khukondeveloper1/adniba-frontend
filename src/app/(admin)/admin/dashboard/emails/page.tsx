"use client";

import React, { useState } from "react";
import { Radio, Send } from "lucide-react";
import { useAdminEmailLogs, useAdminBroadcast } from "@/hooks/use-admin-data";
import { useAdminUsers } from "@/hooks/use-admin-data";
import { useApiError } from "@/hooks/use-api-error";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/badge";
import { FormField } from "@/components/ui/input";
import { formatDisplayDate, truncate } from "@/lib/utils";

export default function AdminEmailsPage() {
  const { data: logs = [], isLoading } = useAdminEmailLogs();
  const { data: usersData } = useAdminUsers({ status: "active" });
  const { mutateAsync: broadcast, isPending: broadcasting } = useAdminBroadcast();
  const { handleError } = useApiError();

  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const activeCount = usersData?.stats?.active_users ?? 0;

  const handleBroadcast = async () => {
    try {
      await broadcast({ subject, body });
      setBroadcastOpen(false);
      setConfirmOpen(false);
      setSubject("");
      setBody("");
    } catch (err) { handleError(err); }
  };

  const statusVariant = (s: string) =>
    s === "sent" ? "success" : s === "failed" ? "destructive" : "warning";

  return (
    <div className="dashboard-content">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Email Logs</h1>
        <Button onClick={() => setBroadcastOpen(true)} className="gap-2">
          <Radio className="h-4 w-4" /> Broadcast
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100">
            <tr>
              {["To", "Subject", "Type", "Status", "Sent At"].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={5} className="px-5 py-3"><Skeleton className="h-4 w-full" /></td></tr>)
              : logs.length === 0
                ? <tr><td colSpan={5} className="py-10 text-center text-sm text-slate-400">No email logs yet.</td></tr>
                : logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 text-slate-600">{truncate(log.to_email, 28)}</td>
                    <td className="px-5 py-3 text-slate-900">{truncate(log.subject, 32)}</td>
                    <td className="px-5 py-3"><Badge variant="secondary" className="capitalize text-xs">{log.type}</Badge></td>
                    <td className="px-5 py-3"><Badge variant={statusVariant(log.status) as any} className="capitalize">{log.status}</Badge></td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{log.sent_at ? formatDisplayDate(log.sent_at) : "—"}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Compose broadcast dialog */}
      <Dialog open={broadcastOpen} onOpenChange={(o) => !o && setBroadcastOpen(false)}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Broadcast Email</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-sm text-amber-700">
              This will send to all <strong>{activeCount}</strong> active developers immediately. This action cannot be undone.
            </div>
            <FormField label="Subject" required value={subject} onChange={(e) => setSubject(e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Body <span className="text-destructive">*</span></label>
              <textarea
                rows={6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
                placeholder="Email body (HTML supported)…"
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setBroadcastOpen(false)}>Cancel</Button>
            <Button size="sm" disabled={!subject || !body} onClick={() => setConfirmOpen(true)}>
              <Send className="h-4 w-4" /> Review & Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2-step destructive confirm (R10) */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(o) => !o && setConfirmOpen(false)}
        title="Send broadcast to all developers?"
        description={`This will immediately send "${subject}" to ${activeCount} active developers. There is no undo.`}
        confirmLabel={`Send to ${activeCount} developers`}
        variant="destructive"
        onConfirm={handleBroadcast}
        loading={broadcasting}
      />
    </div>
  );
}
