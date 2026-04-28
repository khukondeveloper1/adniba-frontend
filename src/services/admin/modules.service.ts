import adminAxios from "@/lib/axios/admin";
import type {
  ApiResponse,
  ApiResponseWithMeta,
  App,
  AdminDeveloper,
  AdminDeveloperDetail,
  AdminUserListStats,
  GlobalNetwork,
  LimitRequest,
  EmailLog,
  StaticPage,
  ApiDoc,
  AnalyticsSummary,
  DailyAnalytics,
  SuspendAppInput,
  ToggleUserStatusInput,
  SetAppLimitInput,
  SendEmailInput,
  BroadcastEmailInput,
  ReviewLimitRequestInput,
  UpdateStaticPageInput,
  CreateApiDocInput,
  CreateGlobalNetworkInput,
} from "@/types";

type AppResponse = App & {
  icon_url?: string | null;
  logo_url?: string | null;
};

function normalizeApp(app: AppResponse): App {
  return {
    ...app,
    app_logo: app.app_logo ?? app.icon_url ?? app.logo_url ?? null,
  };
}

// ─────────────────────────────────────────────────────────────────
// ADMIN APPS SERVICE — Module 3
// ─────────────────────────────────────────────────────────────────

export const adminAppsService = {
  listApps: async (): Promise<App[]> => {
    const res = await adminAxios.get<ApiResponse<AppResponse[]>>("/admin/apps");
    return res.data.data.map((app) => normalizeApp(app));
  },

  getApp: async (id: number | string): Promise<App> => {
    const res = await adminAxios.get<ApiResponse<AppResponse>>(`/admin/apps/${id}`);
    return normalizeApp(res.data.data);
  },

  suspendApp: async (
    id: number | string,
    input: SuspendAppInput,
  ): Promise<void> => {
    await adminAxios.post(`/admin/apps/${id}/suspend`, input);
  },

  unsuspendApp: async (id: number | string): Promise<void> => {
    await adminAxios.post(`/admin/apps/${id}/unsuspend`);
  },

  /**
   * POST /admin/apps/{id}/rotate-key
   * Admin can rotate any app's API key
   */
  rotateKey: async (id: number | string): Promise<string> => {
    const res = await adminAxios.post<{ status: string; api_key: string }>(
      `/admin/apps/${id}/rotate-key`,
    );
    return res.data.api_key;
  },
};

// ─────────────────────────────────────────────────────────────────
// ADMIN GLOBAL NETWORKS SERVICE — Module 4
// ─────────────────────────────────────────────────────────────────

export const adminGlobalNetworksService = {
  listNetworks: async (): Promise<GlobalNetwork[]> => {
    const res = await adminAxios.get<ApiResponse<GlobalNetwork[]>>(
      "/admin/global-networks",
    );
    return res.data.data;
  },

  createNetwork: async (
    input: CreateGlobalNetworkInput,
  ): Promise<GlobalNetwork> => {
    const res = await adminAxios.post<ApiResponse<GlobalNetwork>>(
      "/admin/global-networks",
      input,
    );
    return res.data.data;
  },

  updateNetwork: async (
    id: number | string,
    input: Partial<CreateGlobalNetworkInput>,
  ): Promise<GlobalNetwork> => {
    const res = await adminAxios.put<ApiResponse<GlobalNetwork>>(
      `/admin/global-networks/${id}`,
      input,
    );
    return res.data.data;
  },

  toggleNetwork: async (
    id: number | string,
    active: boolean,
  ): Promise<void> => {
    await adminAxios.patch(`/admin/global-networks/${id}/toggle`, { active });
  },

  deleteNetwork: async (id: number | string): Promise<void> => {
    await adminAxios.delete(`/admin/global-networks/${id}`);
  },
};

// ─────────────────────────────────────────────────────────────────
// ADMIN USERS SERVICE — Module 5
// ─────────────────────────────────────────────────────────────────

export const adminUsersService = {
  listUsers: async (params?: {
    search?: string;
    status?: "active" | "inactive";
  }): Promise<{ users: AdminDeveloper[]; stats: AdminUserListStats }> => {
    const res = await adminAxios.get<
      ApiResponse<{ users: AdminDeveloper[]; stats: AdminUserListStats }>
    >("/admin/users", { params });
    return res.data.data;
  },

  getUser: async (id: number | string): Promise<AdminDeveloperDetail> => {
    const res = await adminAxios.get<ApiResponse<AdminDeveloperDetail>>(
      `/admin/users/${id}`,
    );
    return res.data.data;
  },

  toggleUserStatus: async (
    id: number | string,
    input: ToggleUserStatusInput,
  ): Promise<void> => {
    await adminAxios.patch(`/admin/users/${id}/status`, input);
  },

  setAppLimit: async (
    id: number | string,
    input: SetAppLimitInput,
  ): Promise<void> => {
    await adminAxios.patch(`/admin/users/${id}/app-limit`, input);
  },

  sendEmail: async (
    id: number | string,
    input: SendEmailInput,
  ): Promise<void> => {
    await adminAxios.post(`/admin/users/${id}/send-email`, input);
  },
};

// ─────────────────────────────────────────────────────────────────
// ADMIN LIMIT REQUESTS SERVICE — Module 6
// ─────────────────────────────────────────────────────────────────

export const adminLimitRequestsService = {
  listRequests: async (status?: "pending" | "approved" | "rejected"): Promise<LimitRequest[]> => {
    const res = await adminAxios.get<ApiResponse<LimitRequest[]>>(
      "/admin/limit-requests",
      { params: status ? { status } : undefined },
    );
    return res.data.data;
  },

  approveRequest: async (
    id: number | string,
    input?: ReviewLimitRequestInput,
  ): Promise<void> => {
    await adminAxios.post(`/admin/limit-requests/${id}/approve`, input ?? {});
  },

  rejectRequest: async (
    id: number | string,
    input?: ReviewLimitRequestInput,
  ): Promise<void> => {
    await adminAxios.post(`/admin/limit-requests/${id}/reject`, input ?? {});
  },
};

// ─────────────────────────────────────────────────────────────────
// ADMIN EMAIL SERVICE — Module 7
// ─────────────────────────────────────────────────────────────────

export const adminEmailsService = {
  getLogs: async (userId?: number | string): Promise<EmailLog[]> => {
    const res = await adminAxios.get<ApiResponse<EmailLog[]>>(
      "/admin/emails/logs",
      { params: userId ? { user_id: userId } : undefined },
    );
    return res.data.data;
  },

  /**
   * POST /admin/emails/broadcast
   * ⚠️ Destructive — sends to ALL active developers immediately. No undo.
   */
  broadcast: async (input: BroadcastEmailInput): Promise<void> => {
    await adminAxios.post("/admin/emails/broadcast", input);
  },
};

// ─────────────────────────────────────────────────────────────────
// ADMIN ANALYTICS SERVICE — Module 8
// ─────────────────────────────────────────────────────────────────

export const adminAnalyticsService = {
  getStats: async (
    appId: number | string,
    from?: string,
    to?: string,
  ): Promise<AnalyticsSummary> => {
    const res = await adminAxios.get<ApiResponse<AnalyticsSummary>>(
      `/admin/analytics/${appId}`,
      { params: { from, to } },
    );
    return res.data.data;
  },

  getDailyStats: async (
    appId: number | string,
    from?: string,
    to?: string,
  ): Promise<DailyAnalytics[]> => {
    const res = await adminAxios.get<ApiResponse<DailyAnalytics[]>>(
      `/admin/analytics/${appId}/daily`,
      { params: { from, to } },
    );
    return res.data.data;
  },
};

// ─────────────────────────────────────────────────────────────────
// ADMIN API DOCS CMS SERVICE — Module 9
// ─────────────────────────────────────────────────────────────────

export const adminApiDocsService = {
  listDocs: async (category?: string): Promise<ApiDoc[]> => {
    const res = await adminAxios.get<ApiResponse<ApiDoc[]>>(
      "/admin/api-docs",
      { params: category ? { category } : undefined },
    );
    return res.data.data;
  },

  createDoc: async (input: CreateApiDocInput): Promise<ApiDoc> => {
    const res = await adminAxios.post<ApiResponse<ApiDoc>>(
      "/admin/api-docs",
      input,
    );
    return res.data.data;
  },

  updateDoc: async (
    id: number | string,
    input: Partial<CreateApiDocInput> & { is_published?: boolean },
  ): Promise<ApiDoc> => {
    const res = await adminAxios.put<ApiResponse<ApiDoc>>(
      `/admin/api-docs/${id}`,
      input,
    );
    return res.data.data;
  },

  deleteDoc: async (id: number | string): Promise<void> => {
    await adminAxios.delete(`/admin/api-docs/${id}`);
  },
};

// ─────────────────────────────────────────────────────────────────
// ADMIN STATIC PAGES SERVICE — Module 10
// ─────────────────────────────────────────────────────────────────

export const adminPagesService = {
  listPages: async (): Promise<StaticPage[]> => {
    const res = await adminAxios.get<ApiResponse<StaticPage[]>>("/admin/pages");
    return res.data.data;
  },

  getPage: async (key: string): Promise<StaticPage> => {
    const res = await adminAxios.get<ApiResponse<StaticPage>>(
      `/admin/pages/${key}`,
    );
    return res.data.data;
  },

  updatePage: async (
    key: string,
    input: UpdateStaticPageInput,
  ): Promise<StaticPage> => {
    const res = await adminAxios.put<ApiResponse<StaticPage>>(
      `/admin/pages/${key}`,
      input,
    );
    return res.data.data;
  },
};
