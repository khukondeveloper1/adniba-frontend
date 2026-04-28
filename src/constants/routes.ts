// ─────────────────────────────────────────────────────────────────
// ROUTE CONSTANTS
// Single source of truth for all frontend routes.
// Never hardcode paths anywhere else.
// ─────────────────────────────────────────────────────────────────

export const ROUTES = {
  // ── Public ────────────────────────────────────────────────────
  home: "/",
  about: "/about",
  privacy: "/privacy",
  terms: "/terms",
  contact: "/contact",
  docs: "/docs",

  // ── Developer Auth ────────────────────────────────────────────
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",

  // ── Developer Dashboard ───────────────────────────────────────
  dashboard: "/dashboard",
  apps: "/dashboard/apps",
  appDetail: (id: number | string) => `/dashboard/apps/${id}`,
  appNetworks: (id: number | string) => `/dashboard/apps/${id}?tab=networks`,
  appUnits: (id: number | string) => `/dashboard/apps/${id}?tab=units`,
  appSettings: (id: number | string) => `/dashboard/apps/${id}?tab=settings`,
  appAnalytics: (id: number | string) => `/dashboard/apps/${id}?tab=analytics`,
  externalApi: "/dashboard/external-api",
  devSettings: "/dashboard/settings",

  // ── Admin Auth ────────────────────────────────────────────────
  adminLogin: "/admin/login",

  // ── Admin Dashboard ───────────────────────────────────────────
  adminDashboard: "/admin/dashboard",
  adminApps: "/admin/dashboard/apps",
  adminDevelopers: "/admin/dashboard/developers",
  adminDeveloperDetail: (id: number | string) =>
    `/admin/dashboard/developers/${id}`,
  adminNetworks: "/admin/dashboard/networks",
  adminLimitRequests: "/admin/dashboard/limit-requests",
  adminEmails: "/admin/dashboard/emails",
  adminAnalytics: "/admin/dashboard/analytics",
  adminApiDocs: "/admin/dashboard/api-docs",
  adminPages: "/admin/dashboard/pages",
} as const;

// ── Storage keys ──────────────────────────────────────────────────

export const STORAGE_KEYS = {
  devToken: "adnex_dev_token",
  adminToken: "adnex_admin_token",
} as const;
