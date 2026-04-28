"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useDeveloperAuth } from "@/components/providers/developer-auth-provider";
import { developerProfileService } from "@/services";
import { useDevLimitRequests, useSubmitLimitRequest } from "@/hooks/use-developer-data";
import { useApiError } from "@/hooks/use-api-error";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/badge";
import { formatDisplayDate } from "@/lib/utils";
import { queryKeys } from "@/lib/query-client";

// ── Schemas ───────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().optional(),
  company: z.string().optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, "Required"),
  new_password: z.string().min(8, "Must be at least 8 characters"),
  new_password_confirmation: z.string().min(1, "Required"),
}).refine((d) => d.new_password === d.new_password_confirmation, {
  message: "Passwords do not match",
  path: ["new_password_confirmation"],
});

const limitRequestSchema = z.object({
  requested_limit: z.number().int().min(1, "Must be at least 1"),
  reason: z.string().max(500).optional(),
});

type ProfileInput = z.infer<typeof profileSchema>;
type PasswordInput = z.infer<typeof passwordSchema>;
type LimitInput = z.infer<typeof limitRequestSchema>;

export default function SettingsPage() {
  const { user, refreshUser } = useDeveloperAuth();
  const { handleError } = useApiError();
  const qc = useQueryClient();

  return (
    <div className="dashboard-content max-w-2xl">
      <h1 className="text-xl font-semibold text-slate-900">Settings</h1>

      <ProfileSection user={user} onSuccess={async () => { await refreshUser(); qc.invalidateQueries({ queryKey: queryKeys.devMe() }); }} handleError={handleError} />
      <PasswordSection handleError={handleError} />
      <LimitRequestSection currentLimit={user?.app_limit ?? 0} handleError={handleError} />
    </div>
  );
}

// ── Profile section ───────────────────────────────────────────────

function ProfileSection({ user, onSuccess, handleError }: { user: any; onSuccess: () => Promise<void>; handleError: any }) {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "", phone: user?.phone ?? "", company: user?.company ?? "", website: user?.website ?? "" },
  });

  const onSubmit = async (data: ProfileInput) => {
    setSaving(true);
    try {
      await developerProfileService.updateProfile(data);
      await onSuccess();
      toast.success("Profile updated.");
    } catch (err) { handleError(err); }
    finally { setSaving(false); }
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
      <h2 className="text-base font-semibold text-slate-900 mb-5">Account</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Full name" required error={!!errors.name} errorMessage={errors.name?.message} {...register("name")} />
          <FormField label="Phone" type="tel" error={!!errors.phone} errorMessage={errors.phone?.message} {...register("phone")} />
          <FormField label="Company" error={!!errors.company} errorMessage={errors.company?.message} {...register("company")} />
          <FormField label="Website" type="url" error={!!errors.website} errorMessage={errors.website?.message} {...register("website")} />
        </div>
        <div className="pt-2">
          <Button type="submit" size="sm" loading={saving}>Save Changes</Button>
        </div>
      </form>
    </section>
  );
}

// ── Password section ──────────────────────────────────────────────

function PasswordSection({ handleError }: { handleError: any }) {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<PasswordInput>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordInput) => {
    setSaving(true);
    try {
      await developerProfileService.changePassword(data);
      toast.success("Password changed successfully.");
      reset();
    } catch (err) { handleError(err, { setError }); }
    finally { setSaving(false); }
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
      <h2 className="text-base font-semibold text-slate-900 mb-5">Security</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField label="Current password" type="password" required error={!!errors.current_password} errorMessage={errors.current_password?.message} {...register("current_password")} />
        <FormField label="New password" type="password" required error={!!errors.new_password} errorMessage={errors.new_password?.message} hint="Minimum 8 characters" {...register("new_password")} />
        <FormField label="Confirm new password" type="password" required error={!!errors.new_password_confirmation} errorMessage={errors.new_password_confirmation?.message} {...register("new_password_confirmation")} />
        <Button type="submit" size="sm" loading={saving}>Change Password</Button>
      </form>
    </section>
  );
}

// ── Limit request section ─────────────────────────────────────────

function LimitRequestSection({ currentLimit, handleError }: { currentLimit: number; handleError: any }) {
  const { data: requests = [], isLoading } = useDevLimitRequests();
  const { mutateAsync: submitRequest, isPending: submitting } = useSubmitLimitRequest();
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<LimitInput>({
    resolver: zodResolver(limitRequestSchema),
    defaultValues: { requested_limit: currentLimit + 5 },
  });

  const hasPending = requests.some((r) => r.status === "pending");

  const onSubmit = async (data: LimitInput) => {
    try {
      await submitRequest(data);
      reset();
    } catch (err) { handleError(err, { setError }); }
  };

  const statusVariant = (s: string) =>
    s === "approved" ? "success" : s === "rejected" ? "destructive" : "warning";

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold text-slate-900">App Limit</h2>
        <Badge variant="secondary">Current: {currentLimit} apps</Badge>
      </div>
      <p className="text-sm text-slate-500 mb-5">
        Need more apps? Submit a limit increase request.
      </p>

      {hasPending ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          You have a pending request. Wait for it to be reviewed before submitting another.
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField
              label="Requested limit"
              type="number"
              required
              min={currentLimit + 1}
              error={!!errors.requested_limit}
              errorMessage={errors.requested_limit?.message}
              hint={`Must be greater than current limit (${currentLimit})`}
              {...register("requested_limit", { valueAsNumber: true })}
            />
            <FormField
              label="Reason (optional)"
              placeholder="Brief description of your use case"
              error={!!errors.reason}
              errorMessage={errors.reason?.message}
              {...register("reason")}
            />
          </div>
          <Button type="submit" size="sm" variant="outline" loading={submitting}>
            Submit Request
          </Button>
        </form>
      )}

      {/* Request history */}
      {!isLoading && requests.length > 0 && (
        <div className="mt-5 pt-5 border-t border-slate-100">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Request History</h3>
          <div className="space-y-2">
            {requests.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm py-2">
                <span className="text-slate-700">Requested {r.requested_limit} apps</span>
                <div className="flex items-center gap-2">
                  {r.admin_note && <span className="text-xs text-slate-400 italic">{r.admin_note}</span>}
                  <Badge variant={statusVariant(r.status) as any} className="capitalize">{r.status}</Badge>
                  <span className="text-xs text-slate-300">{formatDisplayDate(r.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
