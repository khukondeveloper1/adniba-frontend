import publicAxios from "@/lib/axios/public";
import adminAxios from "@/lib/axios/admin";
import type { AdminAuthResponse, AdminLoginInput } from "@/types";

// ─────────────────────────────────────────────────────────────────
// ADMIN AUTH SERVICE
// Module 2: /api/v1/admin/auth/*
// IMPORTANT: Admin login response is NOT wrapped in data{}.
// It returns { access_token, token_type, expires_in } directly.
// ─────────────────────────────────────────────────────────────────

export const adminAuthService = {
  /**
   * POST /admin/auth/login
   * Response shape differs from developer: root-level, no data{} wrapper
   */
  login: async (input: AdminLoginInput): Promise<AdminAuthResponse> => {
    const res = await publicAxios.post<AdminAuthResponse>(
      "/admin/auth/login",
      input,
    );
    return res.data;
  },

  /**
   * POST /admin/auth/logout
   */
  logout: async (): Promise<void> => {
    await adminAxios.post("/admin/auth/logout");
  },
};
