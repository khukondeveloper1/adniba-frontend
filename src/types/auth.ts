// ─────────────────────────────────────────────────────────────────
// AUTH TYPES
// ─────────────────────────────────────────────────────────────────

/**
 * Developer user — returned from /developer/auth/me and /developer/profile
 */
export interface Developer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  website: string | null;
  avatar: string | null;
  app_limit: number;
  apps_used: number;
  remaining_slots: number;
  status: boolean;
  created_at: string;
}

/**
 * Auth tokens — returned on login/refresh for BOTH roles
 * Note: Admin login response is NOT wrapped in data{} — it's the root object.
 * Developer login IS wrapped: { status: "ok", data: { access_token, user, ... } }
 */
export interface AuthTokens {
  access_token: string;
  token_type: "bearer";
  expires_in: number; // seconds (3600)
}

/**
 * Developer login success response
 * POST /developer/auth/login|register → { status, data: DeveloperAuthResponse }
 */
export interface DeveloperAuthResponse extends AuthTokens {
  user: Pick<
    Developer,
    "id" | "name" | "email" | "app_limit" | "apps_used" | "remaining_slots"
  >;
}

/**
 * Admin login response — returned directly (not wrapped in data{})
 * POST /admin/auth/login → { access_token, token_type, expires_in }
 */
export type AdminAuthResponse = AuthTokens;

/**
 * Stored auth state in the auth context
 */
export interface DeveloperAuthState {
  token: string | null;
  user: Developer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AdminAuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ── Form input types ─────────────────────────────────────────────

export interface DeveloperLoginInput {
  email: string;
  password: string;
}

export interface DeveloperRegisterInput {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AdminLoginInput {
  username: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export interface ChangePasswordInput {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface UpdateProfileInput {
  name: string;
  phone?: string;
  company?: string;
  website?: string;
}
