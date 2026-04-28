// ─────────────────────────────────────────────────────────────────
// API RESPONSE ENVELOPE TYPES
// Matches the backend's universal response format exactly.
// ─────────────────────────────────────────────────────────────────

/**
 * Standard success response
 * { "status": "ok", "data": T }
 */
export interface ApiResponse<T> {
  status: "ok" | "error";
  data: T;
  message?: string;
}

/**
 * Success response with pagination/limit metadata
 * { "status": "ok", "data": T[], "meta": {...} }
 */
export interface ApiResponseWithMeta<T> {
  status: "ok" | "error";
  data: T;
  meta: ApiMeta;
  message?: string;
}

/**
 * Meta block returned on list endpoints that include limits
 */
export interface ApiMeta {
  total: number;
  app_limit?: number;
  remaining_slots?: number;
}

/**
 * Standard error response
 * { "status": "error", "message": "..." }
 */
export interface ApiError {
  status: "error";
  message: string;
  errors?: Record<string, string[]>; // 422 validation field errors
}

/**
 * HTTP status codes the frontend must handle
 */
export type ApiStatusCode =
  | 200  // OK
  | 201  // Created
  | 202  // Accepted (async queued)
  | 401  // Unauthorized — attempt refresh, then logout
  | 403  // Forbidden — check message for sub-type
  | 404  // Not Found
  | 409  // Conflict
  | 422  // Validation Error — map errors{} to form fields
  | 429  // Rate Limited
  | 500; // Server Error

/**
 * 403 sub-types derived from message field
 * The API uses HTTP 403 for multiple distinct states.
 */
export type ForbiddenReason =
  | "account_deactivated"
  | "app_suspended"
  | "app_limit_reached"
  | "unknown";
