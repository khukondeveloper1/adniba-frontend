import publicAxios from "@/lib/axios/public";
import developerAxios from "@/lib/axios/developer";
import type {
  ApiResponse,
  DeveloperAuthResponse,
  DeveloperLoginInput,
  DeveloperRegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  Developer,
} from "@/types";

// ─────────────────────────────────────────────────────────────────
// DEVELOPER AUTH SERVICE
// Module 11: /api/v1/developer/auth/*
// ─────────────────────────────────────────────────────────────────

export const developerAuthService = {
  /**
   * POST /developer/auth/login
   * Response wrapped in data{}: { status, data: { access_token, user, ... } }
   */
  login: async (input: DeveloperLoginInput): Promise<DeveloperAuthResponse> => {
    const res = await publicAxios.post<ApiResponse<DeveloperAuthResponse>>(
      "/developer/auth/login",
      input,
    );
    return res.data.data;
  },

  /**
   * POST /developer/auth/register
   * Returns token + user immediately (auto-login after registration)
   */
  register: async (
    input: DeveloperRegisterInput,
  ): Promise<DeveloperAuthResponse> => {
    const res = await publicAxios.post<ApiResponse<DeveloperAuthResponse>>(
      "/developer/auth/register",
      input,
    );
    return res.data.data;
  },

  /**
   * GET /developer/auth/me
   * Returns the current authenticated developer's data + app limits
   */
  me: async (): Promise<Developer> => {
    const res = await developerAxios.get<ApiResponse<Developer>>(
      "/developer/auth/me",
    );
    return res.data.data;
  },

  /**
   * POST /developer/auth/logout
   */
  logout: async (): Promise<void> => {
    await developerAxios.post("/developer/auth/logout");
  },

  /**
   * POST /developer/auth/forgot-password
   * Always returns 200 (prevents email enumeration)
   */
  forgotPassword: async (input: ForgotPasswordInput): Promise<string> => {
    const res = await publicAxios.post<{ status: string; message: string }>(
      "/developer/auth/forgot-password",
      input,
    );
    return res.data.message;
  },

  /**
   * POST /developer/auth/reset-password
   * Requires token from email + new password
   */
  resetPassword: async (input: ResetPasswordInput): Promise<void> => {
    await publicAxios.post("/developer/auth/reset-password", input);
  },
};
