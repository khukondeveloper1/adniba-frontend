"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/components/providers/admin-auth-provider";
import { ROUTES } from "@/constants/routes";

export function useAdminGuard() {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(ROUTES.adminLogin);
    }
  }, [isLoading, isAuthenticated, router]);

  return { isLoading, isAuthenticated };
}

export function useAdminGuestGuard() {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(ROUTES.adminDashboard);
    }
  }, [isLoading, isAuthenticated, router]);

  return { isLoading };
}
