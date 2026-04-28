import React from "react";
import Link from "next/link";
import { ShieldOff, UserX, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import type { ForbiddenReason } from "@/types";

// ─────────────────────────────────────────────────────────────────
// FORBIDDEN STATE COMPONENTS
// Rendered when a 403 response is received, differentiated by reason.
// ─────────────────────────────────────────────────────────────────

interface BlockedStateProps {
  reason: ForbiddenReason;
  suspensionReason?: string;
}

export function BlockedState({ reason, suspensionReason }: BlockedStateProps) {
  switch (reason) {
    case "app_suspended":
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 mb-4">
            <ShieldOff className="h-7 w-7 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">App Suspended</h2>
          {suspensionReason && (
            <p className="text-sm text-slate-600 max-w-sm mb-2">
              Reason: <span className="font-medium">{suspensionReason}</span>
            </p>
          )}
          <p className="text-sm text-slate-500 max-w-xs mb-6">
            This app has been suspended. Contact support if you believe this is an error.
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.apps}>← Back to Apps</Link>
          </Button>
        </div>
      );

    case "account_deactivated":
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center px-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 mb-4">
            <UserX className="h-7 w-7 text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Account Deactivated</h2>
          <p className="text-sm text-slate-500 max-w-xs mb-6">
            Your account has been deactivated. Please contact support to resolve this.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              localStorage.clear();
              window.location.href = ROUTES.login;
            }}
          >
            Sign Out
          </Button>
        </div>
      );

    case "app_limit_reached":
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 mb-4">
            <TrendingUp className="h-7 w-7 text-amber-500" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">App Limit Reached</h2>
          <p className="text-sm text-slate-500 max-w-xs mb-6">
            You&apos;ve reached your app limit. Request an increase to create more apps.
          </p>
          <Button size="sm" asChild>
            <Link href={ROUTES.devSettings}>Request Limit Increase</Link>
          </Button>
        </div>
      );

    default:
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Access Denied</h2>
          <p className="text-sm text-slate-500 mb-6">You don&apos;t have permission to access this resource.</p>
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.dashboard}>← Dashboard</Link>
          </Button>
        </div>
      );
  }
}
