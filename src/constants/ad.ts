import type { AdType } from "@/types";

// ─────────────────────────────────────────────────────────────────
// AD TYPE CONSTANTS
// Source: API Documentation § KEY CONSTANTS
// ─────────────────────────────────────────────────────────────────

export const AD_TYPES: AdType[] = [
  "banner",
  "interstitial",
  "rewarded",
  "native",
  "app_open",
];

export const AD_TYPE_LABELS: Record<AdType, string> = {
  banner: "Banner",
  interstitial: "Interstitial",
  rewarded: "Rewarded",
  native: "Native",
  app_open: "App Open",
};

/**
 * Tailwind color classes for ad type badges
 * Used with tailwind-merge — classes must be full strings (no dynamic construction)
 */
export const AD_TYPE_BADGE_CLASSES: Record<AdType, string> = {
  banner:       "bg-blue-100 text-blue-700 border-blue-200",
  interstitial: "bg-purple-100 text-purple-700 border-purple-200",
  rewarded:     "bg-amber-100 text-amber-700 border-amber-200",
  native:       "bg-green-100 text-green-700 border-green-200",
  app_open:     "bg-orange-100 text-orange-700 border-orange-200",
};

export const EVENT_TYPES = [
  "request",
  "load",
  "impression",
  "click",
  "fail",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];
