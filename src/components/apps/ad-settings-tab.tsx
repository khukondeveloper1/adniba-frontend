"use client";

import React, { useState } from "react";
import { Plus, Pencil, Trash2, GitBranch, Crosshair } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useAppSettings, useAppUnits, useAppNetworks,
  useUpsertSetting, useDeleteSetting,
} from "@/hooks/use-developer-data";
import { useApiError } from "@/hooks/use-api-error";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogBody, DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/badge";
import { AD_TYPE_LABELS, AD_TYPE_BADGE_CLASSES } from "@/constants/ad";
import { cn } from "@/lib/utils";
import type { AdSetting, AdType, AppNetwork } from "@/types";

// ─────────────────────────────────────────────────────────────────
// AD SETTINGS TAB
// Placement dropdown derived from existing ad units (R1).
// Network dropdown only shown in Force mode.
// ─────────────────────────────────────────────────────────────────

const settingSchema = z.discriminatedUnion("fallback_enabled", [
  z.object({
    ad_type: z.enum(["banner", "interstitial", "rewarded", "native", "app_open"] as const),
    placement: z.string().min(1, "Select a placement"),
    fallback_enabled: z.literal(true),
    network_id: z.null(),
  }),
  z.object({
    ad_type: z.enum(["banner", "interstitial", "rewarded", "native", "app_open"] as const),
    placement: z.string().min(1, "Select a placement"),
    fallback_enabled: z.literal(false),
    network_id: z.number({ required_error: "Select a network for force mode" }).int().positive(),
  }),
]);

type SettingFormInput = z.infer<typeof settingSchema>;

export function AdSettingsTab({ appId }: { appId: number }) {
  const { data: settings = [], isLoading } = useAppSettings(appId);
  const { data: units = [] } = useAppUnits(appId);
  const { data: networks = [] } = useAppNetworks(appId);
  const { mutateAsync: upsertSetting, isPending: saving } = useUpsertSetting(appId);
  const { mutateAsync: deleteSetting } = useDeleteSetting(appId);
  const { handleError } = useApiError();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdSetting | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdSetting | null>(null);

  // Derive unique placement+adType combos from existing units (R1)
  const placementOptions = Array.from(
    new Map(units.map((u) => [`${u.ad_type}:${u.placement}`, u])).values(),
  );

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } =
    useForm<SettingFormInput>({
      resolver: zodResolver(settingSchema),
      defaultValues: { fallback_enabled: true, network_id: null, ad_type: "banner", placement: "" },
    });

  const mode = watch("fallback_enabled");
  const selectedAdType = watch("ad_type");
  const selectedPlacement = watch("placement");

  // Filter networks that have units for selected ad_type+placement
  const relevantNetworkIds = new Set(
    units
      .filter((u) => u.ad_type === selectedAdType && u.placement === selectedPlacement)
      .map((u) => u.network_id),
  );
  const relevantNetworks = networks.filter((n) => relevantNetworkIds.has(n.id));

  const openCreate = () => {
    reset({ fallback_enabled: true, network_id: null, ad_type: "banner", placement: "" });
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (s: AdSetting) => {
    setEditing(s);
    reset({
      ad_type: s.ad_type,
      placement: s.placement,
      fallback_enabled: s.fallback_enabled as true,
      network_id: null,
      ...(s.fallback_enabled ? {} : { fallback_enabled: false, network_id: s.network_id as number }),
    } as SettingFormInput);
    setFormOpen(true);
  };

  const onSubmit = async (data: SettingFormInput) => {
    try {
      await upsertSetting({
        ad_type: data.ad_type,
        placement: data.placement,
        fallback_enabled: data.fallback_enabled,
        network_id: data.fallback_enabled ? null : data.network_id,
      });
      setFormOpen(false);
    } catch (err) { handleError(err); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{settings.length} setting{settings.length !== 1 ? "s" : ""} configured</p>
        <Button size="sm" onClick={openCreate} disabled={placementOptions.length === 0}>
          <Plus className="h-4 w-4" /> Add Setting
        </Button>
      </div>

      {placementOptions.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          Create ad units first — placements are derived from your existing units.
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-card divide-y divide-slate-100">
        {isLoading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 m-1 rounded-lg" />) :
         settings.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">
            No settings yet. Default is fallback mode for all placements.
          </p>
        ) : settings.map((s) => (
          <div key={s.id} className="flex items-center gap-3 px-5 py-3.5">
            {/* Mode icon */}
            <div className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              s.fallback_enabled ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600",
            )}>
              {s.fallback_enabled
                ? <GitBranch className="h-4 w-4" />
                : <Crosshair className="h-4 w-4" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold", AD_TYPE_BADGE_CLASSES[s.ad_type])}>
                  {AD_TYPE_LABELS[s.ad_type]}
                </span>
                <span className="text-sm font-medium text-slate-900">{s.placement}</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {s.fallback_enabled
                  ? "Fallback mode — cycles through all networks by priority"
                  : `Force mode — always uses network ID ${s.network_id}`}
              </p>
            </div>

            <Button variant="ghost" size="icon-sm" className="text-slate-400 hover:text-slate-700" onClick={() => openEdit(s)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="text-slate-400 hover:text-red-500" onClick={() => setDeleteTarget(s)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={formOpen} onOpenChange={(o) => !o && setFormOpen(false)}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Ad Setting" : "Create Ad Setting"}</DialogTitle>
            <DialogDescription>
              Configure mediation behaviour for a specific placement.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <DialogBody className="space-y-4">
              {/* Placement — dropdown from existing units (R1) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Placement <span className="text-destructive">*</span>
                </label>
                <Select
                  value={`${watch("ad_type")}:${watch("placement")}`}
                  onValueChange={(v) => {
                    const [adType, placement] = v.split(":") as [AdType, string];
                    setValue("ad_type", adType);
                    setValue("placement", placement);
                  }}
                  disabled={!!editing}
                >
                  <SelectTrigger error={!!errors.placement}>
                    <SelectValue placeholder="Select placement…" />
                  </SelectTrigger>
                  <SelectContent>
                    {placementOptions.map((u) => (
                      <SelectItem key={`${u.ad_type}:${u.placement}`} value={`${u.ad_type}:${u.placement}`}>
                        {AD_TYPE_LABELS[u.ad_type]} — {u.placement}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.placement && <p className="mt-1.5 text-xs text-destructive">{errors.placement.message}</p>}
              </div>

              {/* Mode selector */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: true, label: "Fallback", desc: "Cycle through networks by priority", icon: GitBranch, color: "green" },
                    { value: false, label: "Force", desc: "Always use one specific network", icon: Crosshair, color: "amber" },
                  ].map(({ value, label, desc, icon: Icon, color }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        setValue("fallback_enabled", value as true);
                        if (value) setValue("network_id", null);
                      }}
                      className={cn(
                        "flex flex-col items-start gap-1.5 rounded-lg border-2 p-3 text-left transition-colors",
                        mode === value
                          ? color === "green"
                            ? "border-green-500 bg-green-50"
                            : "border-amber-500 bg-amber-50"
                          : "border-slate-200 hover:border-slate-300",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={cn("h-4 w-4", color === "green" ? "text-green-600" : "text-amber-600")} />
                        <span className="text-sm font-semibold text-slate-900">{label}</span>
                      </div>
                      <p className="text-xs text-slate-500">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Network selector — only in Force mode */}
              {!mode && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Forced Network <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={watch("network_id")?.toString() ?? ""}
                    onValueChange={(v) => setValue("network_id", Number(v) as never)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select network…" />
                    </SelectTrigger>
                    <SelectContent>
                      {relevantNetworks.length === 0
                        ? <SelectItem value="none" disabled>No networks with units for this placement</SelectItem>
                        : relevantNetworks.map((n) => (
                          <SelectItem key={n.id} value={n.id.toString()}>{n.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm" loading={saving}>Save Setting</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Reset to default?"
        description={`Remove the setting for "${deleteTarget?.placement}"? The placement will revert to default fallback mode.`}
        confirmLabel="Reset Setting"
        variant="default"
        onConfirm={async () => {
          if (!deleteTarget) return;
          try { await deleteSetting(deleteTarget.id); setDeleteTarget(null); }
          catch (err) { handleError(err); }
        }}
      />
    </div>
  );
}
