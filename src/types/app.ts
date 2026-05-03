// ─────────────────────────────────────────────────────────────────
// APP TYPES
// ─────────────────────────────────────────────────────────────────

/**
 * App as returned in list and detail responses
 */
export interface App {
  id: number;
  user_id?: number; // Present in admin responses
  user?: {
    id: number;
    name: string;
    email: string;
  } | null;
  name: string;
  package_name: string;
  app_logo: string | null;
  api_key: string;
  status: "active" | "inactive" | "suspended";
  app_status: boolean;
  global_ad_enabled: boolean;
  is_suspended: boolean;
  suspension_reason: string | null;
  suspended_at: string | null;
  play_store_url: string | null;
  app_store_url: string | null;
  ad_networks_count: number;
  ad_units_count: number;
  created_at: string;
  updated_at: string;
}

export interface AppEvent {
  id: number;
  app_id: number;
  event_type: string;
  from_status: "active" | "inactive" | "suspended" | null;
  to_status: "active" | "inactive" | "suspended" | null;
  reason: string | null;
  actor_type: "admin" | "developer" | "system";
  actor_id: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

/**
 * Play Store auto-fetch response
 * POST /developer/play-store/fetch
 */
export interface PlayStoreFetchResult {
  status: "ok" | "partial";
  package_name: string;
  message?: string;
  data: {
    name: string;
    package_name: string;
    icon_url: string;
  } | null;
}

// ── Form input types ─────────────────────────────────────────────

export interface CreateAppInput {
  name: string;
  package_name: string;
  app_logo?: string;
  play_store_url?: string;
  app_store_url?: string;
}

export interface UpdateAppInput {
  name?: string;
  package_name?: string;
  app_logo?: string;
  play_store_url?: string;
  app_store_url?: string;
}

export interface ToggleAppStatusInput {
  active: boolean;
}

export interface ToggleAdsEnabledInput {
  enabled: boolean;
}

export interface SuspendAppInput {
  reason: string; // required, min:10, max:500
}

export interface RotateKeyResponse {
  status: "ok";
  api_key: string;
}
