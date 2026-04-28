"use client";

import { useQuery } from "@tanstack/react-query";
import { publicService } from "@/services";
import { queryKeys } from "@/lib/query-client";

// ─────────────────────────────────────────────────────────────────
// PUBLIC DATA HOOKS
// ─────────────────────────────────────────────────────────────────

/**
 * Fetches globally active ad networks for the landing page
 * GET /public/networks
 */
export function usePublicNetworks() {
  return useQuery({
    queryKey: queryKeys.publicNetworks(),
    queryFn: publicService.getNetworks,
    staleTime: 10 * 60 * 1000, // 10 min — network list rarely changes
  });
}

/**
 * Fetches all published API documentation entries
 * GET /public/api-docs?category=...
 */
export function usePublicApiDocs(category?: string) {
  return useQuery({
    queryKey: queryKeys.publicApiDocs(category),
    queryFn: () => publicService.getApiDocs(category),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Fetches all static pages at once
 * GET /public/pages
 */
export function usePublicPages() {
  return useQuery({
    queryKey: queryKeys.publicPages(),
    queryFn: publicService.getPages,
    staleTime: 30 * 60 * 1000, // 30 min — pages very rarely change
  });
}

/**
 * Fetches a single static page by key
 * GET /public/pages/{key}
 */
export function usePublicPage(key: string) {
  return useQuery({
    queryKey: queryKeys.publicPage(key),
    queryFn: () => publicService.getPage(key),
    staleTime: 30 * 60 * 1000,
    enabled: !!key,
  });
}
