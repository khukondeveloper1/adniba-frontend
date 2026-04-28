"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { createAppSchema, type CreateAppFormInput } from "@/lib/validations/app";
import { useCreateApp, useFetchFromPlayStore } from "@/hooks/use-developer-data";
import { useApiError } from "@/hooks/use-api-error";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogBody,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/input";

// ─────────────────────────────────────────────────────────────────
// CREATE APP DIALOG — 2-step (R6)
// Step 1: Optional Play Store URL → fetch
// Step 2: Form (pre-filled or blank)
// ─────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAppDialog({ open, onOpenChange }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [playStoreUrl, setPlayStoreUrl] = useState("");
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchedIconUrl, setFetchedIconUrl] = useState("");

  const { mutateAsync: fetchPlayStore, isPending: fetching } = useFetchFromPlayStore();
  const { mutateAsync: createApp, isPending: creating } = useCreateApp();
  const { handleError } = useApiError();

  const { register, handleSubmit, setValue, setError, reset, formState: { errors } } =
    useForm<CreateAppFormInput>({ resolver: zodResolver(createAppSchema) });

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep(1);
      setPlayStoreUrl("");
      setFetchError(null);
      setFetchedIconUrl("");
      reset();
    }, 300);
  };

  // Step 1: Fetch from Play Store
  const handleFetch = async () => {
    if (!playStoreUrl.trim()) { setStep(2); return; }
    setFetchError(null);
    try {
      const result = await fetchPlayStore(playStoreUrl.trim());
      if (result.status === "ok" && result.data) {
        setValue("name", result.data.name);
        setValue("package_name", result.data.package_name);
        setValue("play_store_url", playStoreUrl.trim());
        setFetchedIconUrl(result.data.icon_url);
      } else {
        // Partial: only package_name extracted
        setValue("package_name", result.package_name);
        setValue("play_store_url", playStoreUrl.trim());
        setFetchedIconUrl("");
        setFetchError(result.message ?? "Could not fetch all fields. Please fill in manually.");
      }
    } catch {
      setFetchedIconUrl("");
      setFetchError("Fetch failed. You can still fill in the form manually.");
    }
    setStep(2);
  };

  const onSubmit = async (data: CreateAppFormInput) => {
    try {
      await createApp({
        input: {
          ...data,
          app_logo: fetchedIconUrl || undefined,
          play_store_url: data.play_store_url || undefined,
        },
      });
      handleClose();
    } catch (err) {
      handleError(err, { setError });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>{step === 1 ? "Create New App" : "App Details"}</DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Optionally paste your Play Store URL to auto-fill details."
              : "Fill in your app information below."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <>
            <DialogBody className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Play Store URL <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={playStoreUrl}
                    onChange={(e) => setPlayStoreUrl(e.target.value)}
                    placeholder="https://play.google.com/store/apps/details?id=..."
                    className="flex h-10 flex-1 rounded-md border border-slate-200 bg-white px-3 text-sm placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary hover:border-slate-300 transition-colors"
                    onKeyDown={(e) => e.key === "Enter" && handleFetch()}
                  />
                  <Button type="button" size="icon" onClick={handleFetch} loading={fetching}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  We&apos;ll pre-fill the form with app info from Google Play.
                </p>
              </div>
            </DialogBody>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={handleClose}>Cancel</Button>
              <Button size="sm" onClick={handleFetch} loading={fetching}>
                {playStoreUrl.trim() ? "Fetch & Continue" : "Skip, fill manually"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <DialogBody className="space-y-4">
              {fetchError && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-sm text-amber-700">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  {fetchError}
                </div>
              )}
              <FormField
                label="App Name"
                required
                placeholder="My Awesome App"
                error={!!errors.name}
                errorMessage={errors.name?.message}
                {...register("name")}
              />
              <FormField
                label="Package Name"
                required
                placeholder="com.company.appname"
                error={!!errors.package_name}
                errorMessage={errors.package_name?.message}
                className="font-mono text-sm"
                {...register("package_name")}
              />
              <FormField
                label="Play Store URL"
                type="url"
                placeholder="https://play.google.com/store/apps/details?id=..."
                error={!!errors.play_store_url}
                errorMessage={errors.play_store_url?.message}
                {...register("play_store_url")}
              />
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="ghost" size="sm" onClick={() => setStep(1)}>
                ← Back
              </Button>
              <Button variant="outline" size="sm" type="button" onClick={handleClose}>Cancel</Button>
              <Button size="sm" type="submit" loading={creating}>Create App</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
