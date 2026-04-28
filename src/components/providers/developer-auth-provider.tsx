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
  getDevToken,
  setDevToken,
  clearDevAuth,
} from "@/lib/axios/developer";
import { developerAuthService } from "@/services";
import { ROUTES } from "@/constants/routes";
import type {
  Developer,
  DeveloperLoginInput,
  DeveloperRegisterInput,
} from "@/types";

// ─────────────────────────────────────────────────────────────────
// DEVELOPER AUTH CONTEXT
// ─────────────────────────────────────────────────────────────────

interface DeveloperAuthContextValue {
  user: Developer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: DeveloperLoginInput) => Promise<void>;
  register: (input: DeveloperRegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const DeveloperAuthContext = createContext<DeveloperAuthContextValue | null>(
  null,
);

export function DeveloperAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<Developer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  // ── Bootstrap: load user from token on mount ──────────────────
  useEffect(() => {
    const token = getDevToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    developerAuthService
      .me()
      .then(setUser)
      .catch(() => {
        // Token is invalid or expired — clean slate
        clearDevAuth();
      })
      .finally(() => setIsLoading(false));
  }, []);

  // ── Login ─────────────────────────────────────────────────────
  const login = useCallback(
    async (input: DeveloperLoginInput) => {
      const data = await developerAuthService.login(input);
      setDevToken(data.access_token);
      // Fetch full profile after setting token
      const me = await developerAuthService.me();
      setUser(me);
      router.push(ROUTES.dashboard);
    },
    [router],
  );

  // ── Register ──────────────────────────────────────────────────
  const register = useCallback(
    async (input: DeveloperRegisterInput) => {
      const data = await developerAuthService.register(input);
      setDevToken(data.access_token);
      const me = await developerAuthService.me();
      setUser(me);
      router.push(ROUTES.dashboard);
    },
    [router],
  );

  // ── Logout ────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await developerAuthService.logout();
    } catch {
      // Best-effort server logout — always clear client state
    } finally {
      clearDevAuth();
      setUser(null);
      queryClient.clear();
      router.push(ROUTES.login);
    }
  }, [router, queryClient]);

  // ── Refresh user data (e.g. after profile update) ─────────────
  const refreshUser = useCallback(async () => {
    const me = await developerAuthService.me();
    setUser(me);
  }, []);

  return (
    <DeveloperAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </DeveloperAuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────

export function useDeveloperAuth(): DeveloperAuthContextValue {
  const ctx = useContext(DeveloperAuthContext);
  if (!ctx) {
    throw new Error(
      "useDeveloperAuth must be used within <DeveloperAuthProvider>",
    );
  }
  return ctx;
}
