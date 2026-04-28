"use client";

import React, { useState } from "react";
import { Check, X } from "lucide-react";
import { useAdminLimitRequests, useAdminApproveRequest, useAdminRejectRequest } from "@/hooks/use-admin-data";
import { useApiError } from "@/hooks/use-api-error";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/badge";
import { FormField } from "@/components/ui/input";
import { formatDisplayDate } from "@/lib/utils";
import type { LimitRequest } from "@/types";

export default function AdminLimitRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected" | undefined>("pending");
  const { data: requests = [], isLoading } = useAdminLimitRequests(statusFilter);
  const { mutateAsync: approveRequest, isPending: approving } = useAdminApproveRequest();
  const { mutateAsync: rejectRequest, isPending: rejecting } = useAdminRejectRequest();
  const { handleError } = useApiError();

  const [actionTarget, setActionTarget] = useState<{ req: LimitRequest; action: "approve" | "reject" } | null>(null);
  const [note, setNote] = useState("");

  const handleAction = async () => {
    if (!actionTarget) return;
    try {
      if (actionTarget.action === "approve") {
        await approveRequest({ id: actionTarget.req.id, input: { note: note || undefined } });
      } else {
        await rejectRequest({ id: actionTarget.req.id, input: { note: note || undefined } });
      }
      setActionTarget(null);
      setNote("");
    } catch (err) { handleError(err); }
  };

  const filters = [
    { label: "Pending", value: "pending" as const },
    { label: "Approved", value: "approved" as const },
    { label: "Rejected", value: "rejected" as const },
  ];

  return (
    <div className="dashboard-content">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Limit Requests</h1>
        <div className="flex gap-1">
          {filters.map((f) => (
            <Button key={f.value} size="sm" variant={statusFilter === f.value ? "default" : "outline"} onClick={() => setStatusFilter(f.value)}>
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-card divide-y divide-slate-100">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="px-5 py-4"><Skeleton className="h-10 w-full" /></div>)
          : requests.length === 0
            ? <p className="py-10 text-center text-sm text-slate-400">No {statusFilter} requests.</p>
            : requests.map((req) => (
              <div key={req.id} className="flex items-start justify-between gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-slate-900">
                      User #{req.user_id} → {req.requested_limit} apps
                    </p>
                    <Badge variant={req.status === "approved" ? "success" : req.status === "rejected" ? "destructive" : "warning"} className="capitalize">
                      {req.status}
                    </Badge>
                  </div>
                  {req.reason && <p className="text-xs text-slate-500 mb-1">&ldquo;{req.reason}&rdquo;</p>}
                  {req.admin_note && <p className="text-xs text-slate-400 italic">Note: {req.admin_note}</p>}
                  <p className="text-xs text-slate-300 mt-1">{formatDisplayDate(req.created_at)}</p>
                </div>
                {req.status === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => { setActionTarget({ req, action: "approve" }); setNote(""); }}>
                      <Check className="h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => { setActionTarget({ req, action: "reject" }); setNote(""); }}>
                      <X className="h-3.5 w-3.5" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
      </div>

      <Dialog open={!!actionTarget} onOpenChange={(o) => !o && setActionTarget(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle className="capitalize">{actionTarget?.action} Request</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-slate-600 mb-3">
              User #{actionTarget?.req.user_id} requested {actionTarget?.req.requested_limit} apps.
            </p>
            <FormField
              label="Admin note (optional)"
              placeholder="Reason for decision…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setActionTarget(null)}>Cancel</Button>
            <Button
              size="sm"
              variant={actionTarget?.action === "reject" ? "destructive" : "default"}
              loading={approving || rejecting}
              onClick={handleAction}
              className={actionTarget?.action === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {actionTarget?.action === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
