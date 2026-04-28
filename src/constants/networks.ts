// ─────────────────────────────────────────────────────────────────
// NETWORK CONSTANTS
// ─────────────────────────────────────────────────────────────────

export const NETWORK_SLUGS = ["admob", "meta", "unity"] as const;
export type NetworkSlug = (typeof NETWORK_SLUGS)[number];

export const NETWORK_LABELS: Record<string, string> = {
  admob: "AdMob",
  meta: "Meta Audience Network",
  unity: "Unity Ads",
};

// ─────────────────────────────────────────────────────────────────
// STATIC PAGE KEYS
// ─────────────────────────────────────────────────────────────────

export const PAGE_KEYS = [
  "about",
  "privacy_policy",
  "terms_conditions",
  "contact",
] as const;

export type PageKey = (typeof PAGE_KEYS)[number];

export const PAGE_LABELS: Record<PageKey, string> = {
  about: "About",
  privacy_policy: "Privacy Policy",
  terms_conditions: "Terms & Conditions",
  contact: "Contact",
};

// ─────────────────────────────────────────────────────────────────
// API DOC CATEGORIES
// ─────────────────────────────────────────────────────────────────

export const DOC_CATEGORIES = [
  "general",
  "authentication",
  "endpoints",
  "examples",
  "sdks",
] as const;

export type DocCategory = (typeof DOC_CATEGORIES)[number];

export const DOC_CATEGORY_LABELS: Record<DocCategory, string> = {
  general: "General",
  authentication: "Authentication",
  endpoints: "Endpoints",
  examples: "Examples",
  sdks: "SDKs",
};

// ─────────────────────────────────────────────────────────────────
// DATE FORMAT
// ─────────────────────────────────────────────────────────────────

export const API_DATE_FORMAT = "yyyy-MM-dd"; // for date-fns format()
