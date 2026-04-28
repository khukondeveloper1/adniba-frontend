import developerAxios from "@/lib/axios/developer";
import type {
  ApiResponse,
  Developer,
  UpdateProfileInput,
  ChangePasswordInput,
} from "@/types";

// ─────────────────────────────────────────────────────────────────
// DEVELOPER PROFILE SERVICE
// Module 12: /api/v1/developer/profile/*
// ─────────────────────────────────────────────────────────────────

export const developerProfileService = {
  /**
   * GET /developer/profile
   * Returns full profile including phone, company, website, avatar
   */
  getProfile: async (): Promise<Developer> => {
    const res = await developerAxios.get<ApiResponse<Developer>>(
      "/developer/profile",
    );
    return res.data.data;
  },

  /**
   * PUT /developer/profile
   */
  updateProfile: async (input: UpdateProfileInput): Promise<Developer> => {
    const res = await developerAxios.put<ApiResponse<Developer>>(
      "/developer/profile",
      input,
    );
    return res.data.data;
  },

  /**
   * POST /developer/profile/avatar
   * Content-Type: multipart/form-data
   */
  uploadAvatar: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("avatar", file);

    const res = await developerAxios.post<{ status: string; avatar_url: string }>(
      "/developer/profile/avatar",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data.avatar_url;
  },

  /**
   * DELETE /developer/profile/avatar
   */
  deleteAvatar: async (): Promise<void> => {
    await developerAxios.delete("/developer/profile/avatar");
  },

  /**
   * POST /developer/profile/change-password
   */
  changePassword: async (input: ChangePasswordInput): Promise<void> => {
    await developerAxios.post("/developer/profile/change-password", input);
  },
};
