"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDeveloperAuth } from "@/components/providers/developer-auth-provider";
import { ROUTES } from "@/constants/routes";

/**
 * Protects developer dashboard pages.
 * Usage: call at the top of any page component inside (developer) route group.
 *
 * Returns { user, isLoading } for convenience so pages don't need
 * to import the auth context separately.
 */
export function useDeveloperGuard() {
  const { user, isAuthenticated, isLoading } = useDeveloperAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(ROUTES.login);
    }
  }, [isLoading, isAuthenticated, router]);

  return { user, isLoading, isAuthenticated };
}

/**
 * Inverse guard — redirects authenticated developers away from auth pages.
 * Usage: call at the top of /login and /register pages.
 */
export function useDeveloperGuestGuard() {
  const { isAuthenticated, isLoading } = useDeveloperAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(ROUTES.dashboard);
    }
  }, [isLoading, isAuthenticated, router]);

  return { isLoading };
}
