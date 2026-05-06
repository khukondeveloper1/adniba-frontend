// ─────────────────────────────────────────────────────────────────
// ADMIN TYPES
// ─────────────────────────────────────────────────────────────────

/**
 * Developer as seen by admin
 * GET /admin/users
 */
export interface AdminDeveloper {
  id: number;
  name: string;
  email: string;
  status: boolean;
  app_limit: number;
  apps_count: number;
  created_at: string;
}

export interface AdminDeveloperDetail extends AdminDeveloper {
  phone: string | null;
  company: string | null;
  website: string | null;
  avatar: string | null;
  apps: AdminDeveloperApp[];
  limit_requests: LimitRequest[];
}

export interface AdminDeveloperApp {
  id: number;
  name: string;
  package_name: string;
  app_status: boolean;
  is_suspended: boolean;
}

export interface AdminUserListStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  total_apps: number;
}

/**
 * Limit request — submitted by developer, reviewed by admin
 */
export interface LimitRequest {
  id: number;
  user_id: number;
  requested_limit: number;
  reason: string | null;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  reviewed_at: string | null;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

/**
 * Email log entry
 */
export interface EmailLog {
  id: number;
  user_id: number;
  to_email: string;
  subject: string;
  type: "welcome" | "limit_approved" | "limit_rejected" | "announcement" | "custom";
  status: "queued" | "sent" | "failed";
  sent_at: string | null;
}

/**
 * Static page managed by admin
 */
export interface StaticPage {
  key: "about" | "privacy_policy" | "terms_conditions" | "contact";
  title: string;
  content_html: string;
  is_published: boolean;
  updated_at: string;
}

/**
 * API documentation entry
 */
export interface ApiDoc {
  id: number;
  title: string;
  slug: string;
  category: "general" | "authentication" | "endpoints" | "examples" | "sdks";
  content_html: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// ── Form inputs ───────────────────────────────────────────────────

export type ToggleUserStatusInput =
  | {
      active: true;
      reason?: string;
    }
  | {
      active: false;
      reason: string;
    };

export interface SetAppLimitInput {
  limit: number; // min:1, max:100
}

export interface SendEmailInput {
  subject: string;
  body: string; // HTML content
}

export interface BroadcastEmailInput {
  subject: string;
  body: string;
}

export interface ReviewLimitRequestInput {
  note?: string;
}

export interface UpdateStaticPageInput {
  title: string;
  content_html: string;
  is_published: boolean;
}

export interface CreateApiDocInput {
  title: string;
  category: ApiDoc["category"];
  content_html: string;
  sort_order?: number;
  is_published?: boolean;
}

export interface SubmitLimitRequestInput {
  requested_limit: number; // must be > current limit
  reason?: string;         // optional, max:500
}
