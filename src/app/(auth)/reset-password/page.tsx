"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { developerAuthService } from "@/services";
import { useApiError } from "@/hooks/use-api-error";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";
  const { handleError } = useApiError();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, email },
  });

  if (!token) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-8 text-center">
        <p className="text-sm text-slate-500 mb-4">Invalid or missing reset link.</p>
        <Link href={ROUTES.forgotPassword} className="text-primary text-sm font-medium hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: ResetPasswordInput) => {
    setSubmitting(true);
    try {
      await developerAuthService.resetPassword(data);
      toast.success("Password reset successfully. Please sign in.");
      router.push(ROUTES.login);
    } catch (err) {
      handleError(err, { setError });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Set new password</h1>
        <p className="mt-1 text-sm text-slate-500">Choose a strong password for your account.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <input type="hidden" {...register("token")} />
        <input type="hidden" {...register("email")} />

        <FormField
          label="New password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          error={!!errors.password}
          errorMessage={errors.password?.message}
          {...register("password")}
        />

        <FormField
          label="Confirm new password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="********"
          error={!!errors.password_confirmation}
          errorMessage={errors.password_confirmation?.message}
          {...register("password_confirmation")}
        />

        <Button type="submit" className="w-full h-10" loading={submitting}>
          Reset Password
        </Button>
      </form>
    </div>
  );
}

function ResetPasswordFallback() {
  return <div className="bg-white rounded-xl border border-slate-200 shadow-card p-8" />;
}
