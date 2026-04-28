"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  getAdminToken,
  setAdminToken,
  clearAdminAuth,
} from "@/lib/axios/admin";
import { adminAuthService } from "@/services";
import { ROUTES } from "@/constants/routes";
import type { AdminLoginInput } from "@/types";

// ─────────────────────────────────────────────────────────────────
// ADMIN AUTH CONTEXT
// Admin has no /me endpoint — we only store the token presence.
// ─────────────────────────────────────────────────────────────────

interface AdminAuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: AdminLoginInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Bootstrap: check token existence on mount
  useEffect(() => {
    const token = getAdminToken();
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (input: AdminLoginInput) => {
      const data = await adminAuthService.login(input);
      setAdminToken(data.access_token);
      setIsAuthenticated(true);
      router.push(ROUTES.adminDashboard);
    },
    [router],
  );

  const logout = useCallback(async () => {
    try {
      await adminAuthService.logout();
    } catch {
      // Best-effort
    } finally {
      clearAdminAuth();
      setIsAuthenticated(false);
      queryClient.clear();
      router.push(ROUTES.adminLogin);
    }
  }, [router, queryClient]);

  return (
    <AdminAuthContext.Provider
      value={{ isAuthenticated, isLoading, login, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within <AdminAuthProvider>");
  }
  return ctx;
}
