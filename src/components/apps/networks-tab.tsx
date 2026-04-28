"use client";

import React, { useState } from "react";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { useAppNetworks, useAddNetwork, useToggleNetwork, useDeleteNetwork } from "@/hooks/use-developer-data";
import { usePublicNetworks } from "@/hooks/use-public-data";
import { useApiError } from "@/hooks/use-api-error";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogBody, DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Switch, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import type { AppNetwork } from "@/types";

export function NetworksTab({ appId }: { appId: number }) {
  const { data: appNetworks = [], isLoading } = useAppNetworks(appId);
  const { data: globalNetworks = [] } = usePublicNetworks();
  const { mutateAsync: addNetwork, isPending: adding } = useAddNetwork(appId);
  const { mutateAsync: toggleNetwork } = useToggleNetwork(appId);
  const { mutateAsync: deleteNetwork } = useDeleteNetwork(appId);
  const { handleError } = useApiError();

  const [addOpen, setAddOpen] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AppNetwork | null>(null);

  // Filter out already-connected networks
  const connectedNames = new Set(appNetworks.map((n) => n.name));
  const available = globalNetworks.filter(
    (n) => n.is_active && !connectedNames.has(n.name),
  );

  const handleAdd = async () => {
    if (!selectedName) return;
    try {
      await addNetwork({ name: selectedName, enabled: true });
      setAddOpen(false);
      setSelectedName("");
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{appNetworks.length} network{appNetworks.length !== 1 ? "s" : ""} connected</p>
        <Button size="sm" onClick={() => setAddOpen(true)} disabled={available.length === 0}>
          <Plus className="h-4 w-4" /> Add Network
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-card divide-y divide-slate-100">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-4">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-4 w-32 flex-1" />
              <Skeleton className="h-5 w-10 rounded-full" />
            </div>
          ))
        ) : appNetworks.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">
            No networks yet. Add one to start configuring ad units.
          </div>
        ) : (
          appNetworks.map((network) => {
            const global = globalNetworks.find((g) => g.name === network.name);
            return (
              <div key={network.id} className="flex items-center gap-3 px-5 py-4">
                {global?.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={global.logo_url} alt={network.name} className="h-9 w-9 object-contain rounded-lg border border-slate-100 p-1" />
                ) : (
                  <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                    {getInitials(network.name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{global?.display_name ?? network.name}</p>
                  <p className="text-xs text-slate-400">{network.name}</p>
                </div>
                <Badge variant={network.enabled ? "active" : "inactive"}>
                  {network.enabled ? "Enabled" : "Disabled"}
                </Badge>
                <Switch
                  checked={network.enabled}
                  onCheckedChange={async (checked) => {
                    try { await toggleNetwork({ networkId: network.id, input: { enabled: checked } }); }
                    catch (err) { handleError(err); }
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-slate-300 hover:text-red-500"
                  onClick={() => setDeleteTarget(network)}
                  title="Remove network"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })
        )}
      </div>

      {/* Add network dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Add Ad Network</DialogTitle>
            <DialogDescription>Select a network to connect to this app.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Select value={selectedName} onValueChange={setSelectedName}>
              <SelectTrigger>
                <SelectValue placeholder="Select a network…" />
              </SelectTrigger>
              <SelectContent>
                {available.map((n) => (
                  <SelectItem key={n.id} value={n.name}>
                    {n.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {available.length === 0 && (
              <p className="mt-2 text-xs text-slate-400">All active networks are already connected.</p>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAdd} loading={adding} disabled={!selectedName}>
              Add Network
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete with cascade warning */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Remove ${deleteTarget?.name}?`}
        description="This will also delete all ad units associated with this network. This cannot be undone."
        confirmLabel="Remove Network"
        onConfirm={async () => {
          if (!deleteTarget) return;
          try { await deleteNetwork(deleteTarget.id); setDeleteTarget(null); }
          catch (err) { handleError(err); }
        }}
      />
    </div>
  );
}
