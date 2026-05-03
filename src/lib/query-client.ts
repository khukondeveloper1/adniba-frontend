import { QueryClient } from "@tanstack/react-query";
import { isApiStatus } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────
// REACT QUERY CLIENT
// Global configuration for all queries and mutations.
// ─────────────────────────────────────────────────────────────────

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Don't retry on 401, 403, 404, 422 — these are definitive errors
        retry: (failureCount, error) => {
          if (
            isApiStatus(error, 401) ||
            isApiStatus(error, 403) ||
            isApiStatus(error, 404) ||
            isApiStatus(error, 422)
          ) {
            return false;
          }
          return failureCount < 2;
        },
        // Re-fetch stale data when window regains focus
        refetchOnWindowFocus: true,
        // Consider data stale after 30 seconds
        staleTime: 30 * 1000,
        // Keep unused data in cache for 5 minutes
        gcTime: 5 * 60 * 1000,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// ─────────────────────────────────────────────────────────────────
// QUERY KEYS
// Centralized factory functions for consistent cache invalidation.
// Structure: [scope, entity, ...identifiers]
// ─────────────────────────────────────────────────────────────────

export const queryKeys = {
  // ── Public ──────────────────────────────────────────────────────
  publicNetworks: () => ["public", "networks"] as const,
  publicPages: () => ["public", "pages"] as const,
  publicPage: (key: string) => ["public", "pages", key] as const,
  publicApiDocs: (category?: string) =>
    category
      ? (["public", "api-docs", category] as const)
      : (["public", "api-docs"] as const),

  // ── Developer Auth ───────────────────────────────────────────────
  devMe: () => ["developer", "me"] as const,
  devProfile: () => ["developer", "profile"] as const,

  // ── Developer Apps ───────────────────────────────────────────────
  devApps: () => ["developer", "apps"] as const,
  devApp: (id: number | string) => ["developer", "apps", id] as const,

  // ── App Networks ─────────────────────────────────────────────────
  appNetworks: (appId: number | string) =>
    ["developer", "apps", appId, "networks"] as const,

  // ── App Ad Units ─────────────────────────────────────────────────
  appUnits: (appId: number | string) =>
    ["developer", "apps", appId, "units"] as const,

  // ── App Settings ─────────────────────────────────────────────────
  appSettings: (appId: number | string) =>
    ["developer", "apps", appId, "settings"] as const,

  // ── App Analytics ────────────────────────────────────────────────
  appStats: (appId: number | string, from?: string, to?: string) =>
    ["developer", "apps", appId, "stats", { from, to }] as const,

  // ── Limit Requests ───────────────────────────────────────────────
  devLimitRequests: () => ["developer", "limit-requests"] as const,

  // ── Admin — Users ────────────────────────────────────────────────
  adminUsers: (search?: string, status?: string) =>
    ["admin", "users", { search, status }] as const,
  adminUser: (id: number | string) => ["admin", "users", id] as const,

  // ── Admin — Apps ─────────────────────────────────────────────────
  adminApps: () => ["admin", "apps"] as const,
  adminApp: (id: number | string) => ["admin", "apps", id] as const,
  adminAppEvents: (id: number | string) =>
    ["admin", "apps", id, "events"] as const,

  // ── Admin — Global Networks ──────────────────────────────────────
  adminGlobalNetworks: () => ["admin", "global-networks"] as const,

  // ── Admin — Limit Requests ───────────────────────────────────────
  adminLimitRequests: (status?: string) =>
    ["admin", "limit-requests", { status }] as const,

  // ── Admin — Analytics ────────────────────────────────────────────
  adminAnalytics: (appId: number | string, from?: string, to?: string) =>
    ["admin", "analytics", appId, { from, to }] as const,
  adminAnalyticsDaily: (appId: number | string, from?: string, to?: string) =>
    ["admin", "analytics", appId, "daily", { from, to }] as const,

  // ── Admin — Emails ───────────────────────────────────────────────
  adminEmails: (userId?: number | string) =>
    ["admin", "emails", { userId }] as const,

  // ── Admin — API Docs ─────────────────────────────────────────────
  adminApiDocs: (category?: string) =>
    ["admin", "api-docs", { category }] as const,

  // ── Admin — Static Pages ─────────────────────────────────────────
  adminPages: () => ["admin", "pages"] as const,
  adminPage: (key: string) => ["admin", "pages", key] as const,
} as const;
