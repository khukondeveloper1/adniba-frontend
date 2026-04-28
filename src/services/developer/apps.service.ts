import developerAxios from "@/lib/axios/developer";
import type {
  ApiResponse,
  ApiResponseWithMeta,
  App,
  CreateAppInput,
  UpdateAppInput,
  ToggleAppStatusInput,
  ToggleAdsEnabledInput,
  RotateKeyResponse,
  PlayStoreFetchResult,
} from "@/types";

// ─────────────────────────────────────────────────────────────────
// DEVELOPER APPS SERVICE
// Modules 13 + 14: /api/v1/developer/apps/* + /play-store/fetch
// ─────────────────────────────────────────────────────────────────

export const developerAppsService = {
  /**
   * GET /developer/apps
   * Returns apps list + meta (total, app_limit, remaining_slots)
   */
  listApps: async (): Promise<ApiResponseWithMeta<App[]>> => {
    const res = await developerAxios.get<ApiResponseWithMeta<App[]>>(
      "/developer/apps",
    );
    return res.data;
  },

  /**
   * GET /developer/apps/{id}
   * Returns full app including networks + units + settings
   */
  getApp: async (id: number | string): Promise<App> => {
    const res = await developerAxios.get<ApiResponse<App>>(
      `/developer/apps/${id}`,
    );
    return res.data.data;
  },

  /**
   * POST /developer/apps
   * Supports both JSON (URL logo) and FormData (file upload)
   */
  createApp: async (input: CreateAppInput, logoFile?: File): Promise<App> => {
    let body: FormData | CreateAppInput;
    let headers: Record<string, string> = {};

    if (logoFile) {
      const formData = new FormData();
      formData.append("name", input.name);
      formData.append("package_name", input.package_name);
      formData.append("logo_file", logoFile);
      if (input.play_store_url) {
        formData.append("play_store_url", input.play_store_url);
      }
      body = formData;
      headers = { "Content-Type": "multipart/form-data" };
    } else {
      body = input;
    }

    const res = await developerAxios.post<ApiResponse<App>>(
      "/developer/apps",
      body,
      { headers },
    );
    return res.data.data;
  },

  /**
   * PUT /developer/apps/{id}
   */
  updateApp: async (
    id: number | string,
    input: UpdateAppInput,
  ): Promise<App> => {
    const res = await developerAxios.put<ApiResponse<App>>(
      `/developer/apps/${id}`,
      input,
    );
    return res.data.data;
  },

  /**
   * DELETE /developer/apps/{id}
   */
  deleteApp: async (id: number | string): Promise<void> => {
    await developerAxios.delete(`/developer/apps/${id}`);
  },

  /**
   * POST /developer/apps/{id}/rotate-key
   * ⚠️ Old key stops working immediately
   */
  rotateApiKey: async (id: number | string): Promise<string> => {
    const res = await developerAxios.post<RotateKeyResponse>(
      `/developer/apps/${id}/rotate-key`,
    );
    return res.data.api_key;
  },

  /**
   * PATCH /developer/apps/{id}/status
   */
  toggleStatus: async (
    id: number | string,
    input: ToggleAppStatusInput,
  ): Promise<void> => {
    await developerAxios.patch(`/developer/apps/${id}/status`, input);
  },

  /**
   * PATCH /developer/apps/{id}/ads-enabled
   */
  toggleAdsEnabled: async (
    id: number | string,
    input: ToggleAdsEnabledInput,
  ): Promise<void> => {
    await developerAxios.patch(`/developer/apps/${id}/ads-enabled`, input);
  },

  /**
   * POST /developer/play-store/fetch
   * Auto-fill app form from a Play Store URL
   */
  fetchFromPlayStore: async (url: string): Promise<PlayStoreFetchResult> => {
    const res = await developerAxios.post<PlayStoreFetchResult>(
      "/developer/play-store/fetch",
      { url },
    );
    return res.data;
  },

  /**
   * GET /developer/apps/{id}/stats
   */
  getAppStats: async (
    id: number | string,
    from?: string,
    to?: string,
  ) => {
    const params: Record<string, string> = {};
    if (from) params["from"] = from;
    if (to) params["to"] = to;

    const res = await developerAxios.get(`/developer/apps/${id}/stats`, {
      params,
    });
    return res.data.data;
  },
};
