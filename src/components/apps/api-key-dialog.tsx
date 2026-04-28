"use client";

import React, { useState } from "react";
import { Copy, Check, RefreshCw, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useRotateApiKey } from "@/hooks/use-developer-data";
import { useApiError } from "@/hooks/use-api-error";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogBody, DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appId: number;
  apiKey: string;
  appName: string;
}

export function ApiKeyDialog({ open, onOpenChange, appId, apiKey, appName }: Props) {
  const [currentKey, setCurrentKey] = useState(apiKey);
  const [revealed, setRevealed] = useState(false);
  const [confirmRotate, setConfirmRotate] = useState(false);
  const { copy, copied } = useCopyToClipboard();
  const { mutateAsync: rotateKey, isPending: rotating } = useRotateApiKey(appId);
  const { handleError } = useApiError();

  const handleRotate = async () => {
    try {
      const newKey = await rotateKey();
      setCurrentKey(newKey);
      setConfirmRotate(false);
      setRevealed(true);
      toast.success("API key rotated. Update your SDK immediately.");
    } catch (err) {
      handleError(err);
    }
  };

  const maskedKey = currentKey.slice(0, 8) + "•".repeat(24) + currentKey.slice(-4);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>API Key — {appName}</DialogTitle>
            <DialogDescription>
              Keep this key secret. Never expose it in client-side code or version control.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            {/* Key display */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <code className="flex-1 text-xs font-mono text-slate-700 break-all leading-relaxed">
                  {revealed ? currentKey : maskedKey}
                </code>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setRevealed(!revealed)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                    aria-label="Toggle visibility"
                  >
                    {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => copy(currentKey)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-primary hover:bg-blue-50 transition-colors"
                    aria-label="Copy key"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Rotate warning */}
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>
                Rotating generates a new key immediately. Your current SDK integration will
                stop working until updated.
              </p>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="text-amber-600 border-amber-200 hover:bg-amber-50 mr-auto"
              onClick={() => setConfirmRotate(true)}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Rotate Key
            </Button>
            <Button size="sm" onClick={() => { copy(currentKey); }}>
              {copied ? <><Check className="h-4 w-4" /> Copied</> : <><Copy className="h-4 w-4" /> Copy Key</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmRotate}
        onOpenChange={setConfirmRotate}
        title="Rotate API Key?"
        description="This will immediately invalidate your current key. Any SDK integrations using the old key will stop working until you update them."
        confirmLabel="Rotate Key"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleRotate}
        loading={rotating}
      />
    </>
  );
}
