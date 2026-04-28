"use client";

import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useAdminGlobalNetworks, useAdminCreateNetwork,
  useAdminUpdateNetwork, useAdminToggleNetwork, useAdminDeleteNetwork,
} from "@/hooks/use-admin-data";
import { useApiError } from "@/hooks/use-api-error";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/badge";
import { FormField } from "@/components/ui/input";
import { getInitials } from "@/lib/utils";
import type { GlobalNetwork } from "@/types";

const networkSchema = z.object({
  name: z.string().min(2).max(50).regex(/^[a-z0-9_]+$/, "Lowercase alphanumeric and underscores only"),
  display_name: z.string().min(1).max(100),
  logo_url: z.string().url().optional().or(z.literal("")),
  description: z.string().max(500).optional(),
  website_url: z.string().url().optional().or(z.literal("")),
  sort_order: z.number().int().min(0).optional(),
});
type NetworkFormInput = z.infer<typeof networkSchema>;

export default function AdminNetworksPage() {
  const { data: networks = [], isLoading } = useAdminGlobalNetworks();
  const { mutateAsync: createNetwork, isPending: creating } = useAdminCreateNetwork();
  const { mutateAsync: updateNetwork, isPending: updating } = useAdminUpdateNetwork();
  const { mutateAsync: toggleNetwork } = useAdminToggleNetwork();
  const { mutateAsync: deleteNetwork } = useAdminDeleteNetwork();
  const { handleError } = useApiError();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GlobalNetwork | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GlobalNetwork | null>(null);

  const { register, handleSubmit, reset, setError, formState: { errors } } =
    useForm<NetworkFormInput>({ resolver: zodResolver(networkSchema) });

  const openCreate = () => { reset({}); setEditing(null); setFormOpen(true); };
  const openEdit = (n: GlobalNetwork) => {
    setEditing(n);
    reset({ name: n.name, display_name: n.display_name, logo_url: n.logo_url ?? "", description: n.description ?? "", website_url: n.website_url ?? "", sort_order: n.sort_order });
    setFormOpen(true);
  };

  const onSubmit = async (data: NetworkFormInput) => {
    try {
      const payload = { ...data, logo_url: data.logo_url || undefined, website_url: data.website_url || undefined };
      if (editing) { await updateNetwork({ id: editing.id, input: payload }); }
      else { await createNetwork(payload); }
      setFormOpen(false);
    } catch (err) { handleError(err, { setError }); }
  };

  return (
    <div className="dashboard-content">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Global Networks ({networks.length})</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Network</Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-card divide-y divide-slate-100">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="flex items-center gap-3 px-5 py-4"><Skeleton className="h-9 w-9 rounded-xl" /><Skeleton className="h-4 flex-1" /></div>)
          : networks.length === 0
            ? <p className="py-10 text-center text-sm text-slate-400">No networks yet.</p>
            : networks.map((n) => (
              <div key={n.id} className="flex items-center gap-3 px-5 py-4">
                {n.logo_url
                  ? <img src={n.logo_url} alt={n.name} className="h-9 w-9 object-contain rounded-lg border border-slate-100 p-1" />
                  : <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">{getInitials(n.display_name)}</div>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{n.display_name}</p>
                  <p className="text-xs text-slate-400 font-mono">{n.name} · order {n.sort_order}</p>
                </div>
                <Badge variant={n.is_active ? "active" : "inactive"}>{n.is_active ? "Active" : "Inactive"}</Badge>
                <Switch
                  checked={n.is_active}
                  onCheckedChange={async (v) => { try { await toggleNetwork({ id: n.id, active: v }); } catch (err) { handleError(err); } }}
                />
                <Button variant="ghost" size="icon-sm" className="text-slate-400 hover:text-slate-700" onClick={() => openEdit(n)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon-sm" className="text-slate-400 hover:text-red-500" onClick={() => setDeleteTarget(n)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            ))}
      </div>

      <Dialog open={formOpen} onOpenChange={(o) => !o && setFormOpen(false)}>
        <DialogContent size="md">
          <DialogHeader><DialogTitle>{editing ? "Edit Network" : "Add Network"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <DialogBody className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Slug (name)" required disabled={!!editing} placeholder="admob" error={!!errors.name} errorMessage={errors.name?.message} hint="Lowercase, no spaces" {...register("name")} />
                <FormField label="Display Name" required placeholder="AdMob" error={!!errors.display_name} errorMessage={errors.display_name?.message} {...register("display_name")} />
                <FormField label="Logo URL" type="url" placeholder="https://…" error={!!errors.logo_url} errorMessage={errors.logo_url?.message} {...register("logo_url")} />
                <FormField label="Website URL" type="url" placeholder="https://…" error={!!errors.website_url} errorMessage={errors.website_url?.message} {...register("website_url")} />
                <FormField label="Sort Order" type="number" min={0} error={!!errors.sort_order} errorMessage={errors.sort_order?.message} {...register("sort_order", { valueAsNumber: true })} />
              </div>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm" loading={creating || updating}>{editing ? "Save" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.display_name}"?`}
        description="This will remove the network from the platform. Apps using it may be affected."
        confirmLabel="Delete Network"
        onConfirm={async () => { if (!deleteTarget) return; try { await deleteNetwork(deleteTarget.id); setDeleteTarget(null); } catch (err) { handleError(err); } }}
      />
    </div>
  );
}
