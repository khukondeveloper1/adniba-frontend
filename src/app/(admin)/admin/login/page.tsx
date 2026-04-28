"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react";
import { adminLoginSchema, type AdminLoginInput } from "@/lib/validations/auth";
import { useAdminAuth } from "@/components/providers/admin-auth-provider";
import { useAdminGuestGuard } from "@/hooks/use-admin-guard";
import { useApiError } from "@/hooks/use-api-error";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const { isLoading: guardLoading } = useAdminGuestGuard();
  const { login } = useAdminAuth();
  const { handleError } = useApiError();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } =
    useForm<AdminLoginInput>({ resolver: zodResolver(adminLoginSchema) });

  const onSubmit = async (data: AdminLoginInput) => {
    setSubmitting(true);
    try { await login(data); }
    catch (err) { handleError(err); }
    finally { setSubmitting(false); }
  };

  if (guardLoading) return null;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-white">Admin Access</h1>
            <p className="mt-1 text-sm text-slate-400">Restricted — authorised personnel only</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {(["username", "password"] as const).map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 capitalize">
                  {field} <span className="text-red-400">*</span>
                </label>
                <input
                  type={field === "password" ? "password" : "text"}
                  autoComplete={field === "password" ? "current-password" : "username"}
                  placeholder={field === "password" ? "••••••••" : "admin"}
                  className={`flex h-10 w-full rounded-md border bg-slate-900 px-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors ${errors[field] ? "border-red-500" : "border-slate-600 hover:border-slate-500"}`}
                  {...register(field)}
                />
                {errors[field] && (
                  <p className="mt-1.5 text-xs text-red-400">{errors[field]?.message}</p>
                )}
              </div>
            ))}
            <Button type="submit" className="w-full h-10 mt-2" loading={submitting}>
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
