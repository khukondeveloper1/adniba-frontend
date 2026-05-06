"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifyEmailSchema, type VerifyEmailInput } from "@/lib/validations/auth";
import { useDeveloperAuth } from "@/components/providers/developer-auth-provider";
import { developerAuthService } from "@/services";
import { useApiError } from "@/hooks/use-api-error";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailParam = searchParams.get("email") || "";
  
  const { verifyEmail } = useDeveloperAuth();
  const { handleError } = useApiError();
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<VerifyEmailInput>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: emailParam,
      code: "",
    },
  });

  useEffect(() => {
    if (!emailParam) {
      router.push(ROUTES.login);
    }
  }, [emailParam, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [countdown]);

  const onSubmit = async (data: VerifyEmailInput) => {
    setSubmitting(true);
    try {
      await verifyEmail(data);
      toast.success("Email verified successfully! Welcome to AdNiba.");
    } catch (err) {
      handleError(err, { setError });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!emailParam) return;
    setResending(true);
    try {
      await developerAuthService.resendVerification({ email: emailParam });
      toast.success("A new verification code has been sent to your email.");
      setCountdown(60); // 60 seconds cooldown
    } catch (err) {
      handleError(err);
    } finally {
      setResending(false);
    }
  };

  if (!emailParam) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-8 text-center">
      <div className="mx-auto w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
        <MailCheck className="w-6 h-6" />
      </div>
      
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
        Check your email
      </h1>
      <p className="text-sm text-slate-500 mb-6">
        We sent a 6-digit verification code to <br />
        <span className="font-medium text-slate-900">{emailParam}</span>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left" noValidate>
        {/* Hidden email field so it gets submitted */}
        <input type="hidden" {...register("email")} />

        <FormField
          label="Verification Code"
          type="text"
          required
          placeholder="Enter 6-digit code"
          maxLength={6}
          error={!!errors.code}
          errorMessage={errors.code?.message}
          {...register("code")}
        />

        <Button type="submit" className="w-full h-10" loading={submitting}>
          Verify Email
        </Button>
      </form>

      <div className="mt-8 text-sm">
        <p className="text-slate-500 mb-2">Didn&apos;t receive the code?</p>
        <Button 
          variant="outline" 
          className="w-full h-10" 
          onClick={handleResend}
          disabled={resending || countdown > 0}
          loading={resending}
        >
          {countdown > 0 ? `Resend available in ${countdown}s` : "Resend Code"}
        </Button>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
