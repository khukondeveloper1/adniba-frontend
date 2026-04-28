import developerAxios from "@/lib/axios/developer";
import type {
  ApiResponse,
  AppNetwork,
  AdUnit,
  AdSetting,
  AnalyticsSummary,
  DailyAnalytics,
  AddNetworkInput,
  ToggleNetworkInput,
  CreateAdUnitInput,
  UpdateAdUnitInput,
  ToggleAdUnitInput,
  UpsertAdSettingInput,
  LimitRequest,
  SubmitLimitRequestInput,
} from "@/types";

// ─────────────────────────────────────────────────────────────────
// DEVELOPER NETWORKS SERVICE
// Module 15: /api/v1/developer/apps/{appId}/networks
// ─────────────────────────────────────────────────────────────────

export const developerNetworksService = {
  listNetworks: async (appId: number | string): Promise<AppNetwork[]> => {
    const res = await developerAxios.get<ApiResponse<AppNetwork[]>>(
      `/developer/apps/${appId}/networks`,
    );
    return res.data.data;
  },

  addNetwork: async (
    appId: number | string,
    input: AddNetworkInput,
  ): Promise<AppNetwork> => {
    const res = await developerAxios.post<ApiResponse<AppNetwork>>(
      `/developer/apps/${appId}/networks`,
      input,
    );
    return res.data.data;
  },

  toggleNetwork: async (
    appId: number | string,
    networkId: number | string,
    input: ToggleNetworkInput,
  ): Promise<void> => {
    await developerAxios.patch(
      `/developer/apps/${appId}/networks/${networkId}/toggle`,
      input,
    );
  },

  deleteNetwork: async (
    appId: number | string,
    networkId: number | string,
  ): Promise<void> => {
    // ⚠️ Cascade deletes all ad units for this network
    await developerAxios.delete(
      `/developer/apps/${appId}/networks/${networkId}`,
    );
  },
};

// ─────────────────────────────────────────────────────────────────
// DEVELOPER AD UNITS SERVICE
// Module 16: /api/v1/developer/apps/{appId}/units
// ─────────────────────────────────────────────────────────────────

export const developerUnitsService = {
  listUnits: async (appId: number | string): Promise<AdUnit[]> => {
    const res = await developerAxios.get<ApiResponse<AdUnit[]>>(
      `/developer/apps/${appId}/units`,
    );
    return res.data.data;
  },

  createUnit: async (
    appId: number | string,
    input: CreateAdUnitInput,
  ): Promise<AdUnit> => {
    const res = await developerAxios.post<ApiResponse<AdUnit>>(
      `/developer/apps/${appId}/units`,
      input,
    );
    return res.data.data;
  },

  updateUnit: async (
    appId: number | string,
    unitId: number | string,
    input: UpdateAdUnitInput,
  ): Promise<AdUnit> => {
    const res = await developerAxios.put<ApiResponse<AdUnit>>(
      `/developer/apps/${appId}/units/${unitId}`,
      input,
    );
    return res.data.data;
  },

  toggleUnit: async (
    appId: number | string,
    unitId: number | string,
    input: ToggleAdUnitInput,
  ): Promise<void> => {
    await developerAxios.patch(
      `/developer/apps/${appId}/units/${unitId}/toggle`,
      input,
    );
  },

  deleteUnit: async (
    appId: number | string,
    unitId: number | string,
  ): Promise<void> => {
    await developerAxios.delete(`/developer/apps/${appId}/units/${unitId}`);
  },
};

// ─────────────────────────────────────────────────────────────────
// DEVELOPER SETTINGS SERVICE
// Module 17: /api/v1/developer/apps/{appId}/settings
// ─────────────────────────────────────────────────────────────────

export const developerSettingsService = {
  listSettings: async (appId: number | string): Promise<AdSetting[]> => {
    const res = await developerAxios.get<ApiResponse<AdSetting[]>>(
      `/developer/apps/${appId}/settings`,
    );
    return res.data.data;
  },

  /**
   * GET /developer/apps/{appId}/settings/{adType}/{placement}
   * Returns default fallback mode if no setting exists for this combination
   */
  getSetting: async (
    appId: number | string,
    adType: string,
    placement: string,
  ): Promise<AdSetting> => {
    const res = await developerAxios.get<ApiResponse<AdSetting>>(
      `/developer/apps/${appId}/settings/${adType}/${placement}`,
    );
    return res.data.data;
  },

  /**
   * POST /developer/apps/{appId}/settings
   * Upsert — creates or updates the setting for a given ad_type + placement
   */
  upsertSetting: async (
    appId: number | string,
    input: UpsertAdSettingInput,
  ): Promise<AdSetting> => {
    const res = await developerAxios.post<ApiResponse<AdSetting>>(
      `/developer/apps/${appId}/settings`,
      input,
    );
    return res.data.data;
  },

  /**
   * DELETE /developer/apps/{appId}/settings/{id}
   * Effect: reverts to default fallback mode
   */
  deleteSetting: async (
    appId: number | string,
    settingId: number | string,
  ): Promise<void> => {
    await developerAxios.delete(
      `/developer/apps/${appId}/settings/${settingId}`,
    );
  },
};

// ─────────────────────────────────────────────────────────────────
// DEVELOPER ANALYTICS SERVICE
// Module 14.7: /api/v1/developer/apps/{appId}/stats
// ─────────────────────────────────────────────────────────────────

export const developerAnalyticsService = {
  getStats: async (
    appId: number | string,
    from?: string,
    to?: string,
  ): Promise<AnalyticsSummary> => {
    const res = await developerAxios.get<ApiResponse<AnalyticsSummary>>(
      `/developer/apps/${appId}/stats`,
      { params: { from, to } },
    );
    return res.data.data;
  },
};

// ─────────────────────────────────────────────────────────────────
// DEVELOPER LIMIT REQUESTS SERVICE
// Module 18: /api/v1/developer/limit-requests
// ─────────────────────────────────────────────────────────────────

export const developerLimitRequestsService = {
  listRequests: async (): Promise<LimitRequest[]> => {
    const res = await developerAxios.get<ApiResponse<LimitRequest[]>>(
      "/developer/limit-requests",
    );
    return res.data.data;
  },

  /**
   * POST /developer/limit-requests
   * Error (409): Pending request already exists — only 1 pending allowed
   */
  submitRequest: async (
    input: SubmitLimitRequestInput,
  ): Promise<LimitRequest> => {
    const res = await developerAxios.post<ApiResponse<LimitRequest>>(
      "/developer/limit-requests",
      input,
    );
    return res.data.data;
  },
};
