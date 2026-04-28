"use client";

import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useAppUnits, useAppNetworks, useCreateUnit,
  useUpdateUnit, useDeleteUnit, useToggleUnit,
} from "@/hooks/use-developer-data";
import { useApiError } from "@/hooks/use-api-error";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogBody, DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/badge";
import { FormField } from "@/components/ui/input";
import { AD_TYPES, AD_TYPE_LABELS, AD_TYPE_BADGE_CLASSES } from "@/constants/ad";
import { cn } from "@/lib/utils";
import type { AdUnit, AdType } from "@/types";

const unitSchema = z.object({
  network_id: z.number({ required_error: "Select a network" }).int().positive(),
  ad_type: z.enum(["banner", "interstitial", "rewarded", "native", "app_open"] as const),
  placement: z.string().min(1, "Placement name required").max(100),
  unit_id: z.string().min(1, "Ad unit ID required").max(255),
  priority: z.number().int().min(1).max(100),
  enabled: z.boolean(),
});
type UnitFormInput = z.infer<typeof unitSchema>;

export function AdUnitsTab({ appId }: { appId: number }) {
  const { data: units = [], isLoading } = useAppUnits(appId);
  const { data: networks = [] } = useAppNetworks(appId);
  const { mutateAsync: createUnit, isPending: creating } = useCreateUnit(appId);
  const { mutateAsync: updateUnit, isPending: updating } = useUpdateUnit(appId);
  const { mutateAsync: deleteUnit } = useDeleteUnit(appId);
  const { mutateAsync: toggleUnit } = useToggleUnit(appId);
  const { handleError } = useApiError();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdUnit | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdUnit | null>(null);

  const { register, handleSubmit, setValue, watch, reset, setError, formState: { errors } } =
    useForm<UnitFormInput>({
      resolver: zodResolver(unitSchema),
      defaultValues: { enabled: true, priority: 1, ad_type: "banner" },
    });

  const openCreate = () => { reset({ enabled: true, priority: units.length + 1, ad_type: "banner" }); setEditing(null); setFormOpen(true); };
  const openEdit = (unit: AdUnit) => {
    setEditing(unit);
    reset({ network_id: unit.network_id, ad_type: unit.ad_type, placement: unit.placement, unit_id: unit.unit_id, priority: unit.priority, enabled: unit.enabled });
    setFormOpen(true);
  };

  const onSubmit = async (data: UnitFormInput) => {
    try {
      if (editing) {
        await updateUnit({ unitId: editing.id, input: { unit_id: data.unit_id, priority: data.priority } });
      } else {
        await createUnit(data);
      }
      setFormOpen(false);
    } catch (err) { handleError(err, { setError }); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{units.length} ad unit{units.length !== 1 ? "s" : ""}</p>
        <Button size="sm" onClick={openCreate} disabled={networks.length === 0}>
          <Plus className="h-4 w-4" /> Add Unit
        </Button>
      </div>

      {networks.length === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Add at least one network before creating ad units.
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-card divide-y divide-slate-100">
        {isLoading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 m-1 rounded-lg" />) :
         units.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">No ad units yet.</p>
        ) : units.map((unit) => (
          <div key={unit.id} className="flex items-center gap-3 px-5 py-3.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold", AD_TYPE_BADGE_CLASSES[unit.ad_type])}>
                  {AD_TYPE_LABELS[unit.ad_type]}
                </span>
                <span className="text-sm font-medium text-slate-900">{unit.placement}</span>
                <span className="text-xs text-slate-400 font-mono truncate max-w-[140px]">{unit.unit_id}</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {unit.network?.name} · Priority {unit.priority}
              </p>
            </div>
            <Switch
              checked={unit.enabled}
              onCheckedChange={async (checked) => {
                try { await toggleUnit({ unitId: unit.id, input: { enabled: checked } }); }
                catch (err) { handleError(err); }
              }}
            />
            <Button variant="ghost" size="icon-sm" className="text-slate-400 hover:text-slate-700" onClick={() => openEdit(unit)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="text-slate-400 hover:text-red-500" onClick={() => setDeleteTarget(unit)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={formOpen} onOpenChange={(o) => { if (!o) setFormOpen(false); }}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Ad Unit" : "Create Ad Unit"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <DialogBody className="space-y-4">
              {/* Network — locked when editing */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Network <span className="text-destructive">*</span></label>
                <Select
                  value={watch("network_id")?.toString() ?? ""}
                  onValueChange={(v) => setValue("network_id", Number(v))}
                  disabled={!!editing}
                >
                  <SelectTrigger error={!!errors.network_id}>
                    <SelectValue placeholder="Select network…" />
                  </SelectTrigger>
                  <SelectContent>
                    {networks.map((n) => <SelectItem key={n.id} value={n.id.toString()}>{n.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.network_id && <p className="mt-1.5 text-xs text-destructive">{errors.network_id.message}</p>}
              </div>

              {/* Ad Type — locked when editing */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Ad Type <span className="text-destructive">*</span></label>
                <Select
                  value={watch("ad_type")}
                  onValueChange={(v) => setValue("ad_type", v as AdType)}
                  disabled={!!editing}
                >
                  <SelectTrigger error={!!errors.ad_type}>
                    <SelectValue placeholder="Select type…" />
                  </SelectTrigger>
                  <SelectContent>
                    {AD_TYPES.map((t) => <SelectItem key={t} value={t}>{AD_TYPE_LABELS[t]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Placement — free-text on creation (R1) */}
              <FormField
                label="Placement"
                required
                placeholder="home, splash, exit…"
                disabled={!!editing}
                error={!!errors.placement}
                errorMessage={errors.placement?.message}
                hint={editing ? undefined : "Free-text identifier used in SDK calls."}
                {...register("placement")}
              />

              <FormField
                label="Ad Unit ID"
                required
                placeholder="ca-app-pub-xxxxx/yyyyy"
                error={!!errors.unit_id}
                errorMessage={errors.unit_id?.message}
                className="font-mono text-sm"
                {...register("unit_id")}
              />

              <FormField
                label="Priority"
                required
                type="number"
                min={1}
                max={100}
                error={!!errors.priority}
                errorMessage={errors.priority?.message}
                hint="1–100. Lower number = served first."
                {...register("priority", { valueAsNumber: true })}
              />
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm" loading={creating || updating}>
                {editing ? "Save Changes" : "Create Unit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete ad unit?"
        description={`Delete the "${deleteTarget?.placement}" ${deleteTarget?.ad_type} unit? This cannot be undone.`}
        confirmLabel="Delete Unit"
        onConfirm={async () => {
          if (!deleteTarget) return;
          try { await deleteUnit(deleteTarget.id); setDeleteTarget(null); }
          catch (err) { handleError(err); }
        }}
      />
    </div>
  );
}
