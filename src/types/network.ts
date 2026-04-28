// ─────────────────────────────────────────────────────────────────
// NETWORK TYPES
// ─────────────────────────────────────────────────────────────────

/**
 * Global network type — managed by admin, listed publicly
 * GET /public/networks, GET /admin/global-networks
 */
export interface GlobalNetwork {
  id: number;
  name: string;          // slug: "admob" | "meta" | "unity"
  display_name: string;  // "AdMob" | "Meta Audience Network"
  description: string | null;
  website_url: string | null;
  logo_url: string | null;
  is_active: boolean;
  sort_order: number;
}

/**
 * App-level network — a global network attached to a specific app
 * GET /developer/apps/{id}/networks
 */
export interface AppNetwork {
  id: number;
  name: string;
  enabled: boolean;
}

// Form inputs
export interface AddNetworkInput {
  name: string;    // must match a valid global network slug
  enabled: boolean;
}

export interface ToggleNetworkInput {
  enabled: boolean;
}

export interface CreateGlobalNetworkInput {
  name: string;         // required, unique, lowercase alphanumeric + underscore
  display_name: string; // required, max:100
  logo_url?: string;
  description?: string;
  website_url?: string;
  is_active?: boolean;
  sort_order?: number;
}

// ─────────────────────────────────────────────────────────────────
// AD UNIT TYPES
// ─────────────────────────────────────────────────────────────────

export type AdType = "banner" | "interstitial" | "rewarded" | "native" | "app_open";

/**
 * Ad unit — a specific ad placement for a network within an app
 * GET /developer/apps/{id}/units
 */
export interface AdUnit {
  id: number;
  network_id: number;
  ad_type: AdType;
  placement: string;   // free-text, e.g. "home", "splash"
  unit_id: string;     // The actual network-side ad unit ID
  priority: number;    // 1–100; lower = served first
  enabled: boolean;
  network: Pick<AppNetwork, "id" | "name">;
}

// Form inputs
export interface CreateAdUnitInput {
  network_id: number;
  ad_type: AdType;
  placement: string;   // free-text input allowed on creation
  unit_id: string;
  priority: number;
  enabled: boolean;
}

export interface UpdateAdUnitInput {
  unit_id?: string;
  priority?: number;
}

export interface ToggleAdUnitInput {
  enabled: boolean;
}

// ─────────────────────────────────────────────────────────────────
// AD SETTING TYPES
// ─────────────────────────────────────────────────────────────────

/**
 * Mediation setting — fallback or force mode per ad_type + placement
 * GET /developer/apps/{id}/settings
 */
export interface AdSetting {
  id: number;
  ad_type: AdType;
  placement: string;
  fallback_enabled: boolean;
  network_id: number | null; // null when fallback_enabled = true
}

/**
 * Upsert ad setting input
 * Fallback mode: { fallback_enabled: true, network_id: null }
 * Force mode:   { fallback_enabled: false, network_id: X }
 */
export interface UpsertAdSettingInput {
  ad_type: AdType;
  placement: string;   // dropdown from existing placements (R1 decision)
  fallback_enabled: boolean;
  network_id: number | null; // REQUIRED when fallback_enabled = false
}

// ─────────────────────────────────────────────────────────────────
// ANALYTICS TYPES
// ─────────────────────────────────────────────────────────────────

export interface AnalyticsByNetwork {
  network: string;
  requests: number;
  impressions: number;
  clicks: number;
  fails: number;
  ctr: number;
}

export interface AnalyticsByPlacement {
  ad_type: AdType;
  placement: string;
  requests: number;
  impressions: number;
  clicks: number;
  ctr: number;
}

export interface AnalyticsSummary {
  total_requests: number;
  total_loads: number;
  total_impressions: number;
  total_clicks: number;
  total_fails: number;
  ctr: number;
  fill_rate: number;
  match_rate: number;
  by_network: AnalyticsByNetwork[];
  by_placement: AnalyticsByPlacement[];
}

export interface DailyAnalytics {
  date: string;
  requests: number;
  impressions: number;
  clicks: number;
  fails: number;
}

export interface AnalyticsDateFilter {
  from: string;  // YYYY-MM-DD
  to: string;    // YYYY-MM-DD
}
