"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { useDeveloperAuth } from "@/components/providers/developer-auth-provider";
import { useDeveloperGuestGuard } from "@/hooks/use-developer-guard";
import { useApiError } from "@/hooks/use-api-error";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";

export default function LoginPage() {
  const { isLoading: guardLoading } = useDeveloperGuestGuard();
  const { login } = useDeveloperAuth();
  const { handleError } = useApiError();
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setSubmitting(true);
    try {
      await login(data);
    } catch (err) {
      handleError(err, { setError });
    } finally {
      setSubmitting(false);
    }
  };

  if (guardLoading) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Sign in to your developer account
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

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Password <span className="text-destructive">*</span>
            </label>
            <Link
              href={ROUTES.forgotPassword}
              className="text-xs text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm pr-10 placeholder:text-slate-400 text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${
                errors.password
                  ? "border-destructive focus:ring-destructive/20"
                  : "border-slate-200 hover:border-slate-300"
              }`}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Toggle password visibility"
            >
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-10"
          loading={submitting}
        >
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href={ROUTES.register} className="text-primary font-medium hover:underline">
          Create one free
        </Link>
      </p>
    </div>
  );
}
