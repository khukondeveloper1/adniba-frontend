"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail } from "lucide-react";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import { developerAuthService } from "@/services";
import { useApiError } from "@/hooks/use-api-error";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";

export default function ForgotPasswordPage() {
  const { handleError } = useApiError();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setSubmitting(true);
    try {
      await developerAuthService.forgotPassword(data);
      setSent(true);
    } catch (err) {
      handleError(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 mx-auto mb-4">
          <Mail className="h-6 w-6 text-green-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Check your inbox</h1>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          If that email is registered, you&apos;ll receive a password reset link
          within a few minutes.
        </p>
        <Link
          href={ROUTES.login}
          className="text-sm text-primary font-medium hover:underline"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-8">
      <Link
        href={ROUTES.login}
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to login
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Reset your password
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter your email and we&apos;ll send a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormField
          label="Email address"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          error={!!errors.email}
          errorMessage={errors.email?.message}
          {...register("email")}
        />
        <Button type="submit" className="w-full h-10" loading={submitting}>
          Send Reset Link
        </Button>
      </form>
    </div>
  );
}
