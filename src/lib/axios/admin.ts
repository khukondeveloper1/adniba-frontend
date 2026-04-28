import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { STORAGE_KEYS, ROUTES } from "@/constants/routes";
import type { ApiError, AuthTokens } from "@/types";

// ─────────────────────────────────────────────────────────────────
// ADMIN AXIOS INSTANCE
// Identical refresh-queue strategy as developer, but:
// - Uses STORAGE_KEYS.adminToken
// - Refreshes via /admin/auth/refresh
// - Redirects to /admin/login on failure
// ─────────────────────────────────────────────────────────────────

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

// ── Token helpers ─────────────────────────────────────────────────

export const getAdminToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.adminToken);
};

export const setAdminToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.adminToken, token);
  }
};

export const clearAdminAuth = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEYS.adminToken);
  }
};

// ── Refresh token queue ───────────────────────────────────────────

interface QueuedRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach((prom) => {
    if (error || !token) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

// ── Axios instance ────────────────────────────────────────────────

const adminAxios: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

// ── Request interceptor ───────────────────────────────────────────

adminAxios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAdminToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor ──────────────────────────────────────────

adminAxios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return adminAxios(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const currentToken = getAdminToken();

    if (!currentToken) {
      clearAdminAuth();
      isRefreshing = false;
      if (typeof window !== "undefined") {
        window.location.href = ROUTES.adminLogin;
      }
      return Promise.reject(error);
    }

    try {
      const refreshResponse = await axios.post<AuthTokens>(
        `${BASE_URL}/admin/auth/refresh`,
        {},
        {
          headers: { Authorization: `Bearer ${currentToken}` },
        },
      );

      const newToken = refreshResponse.data.access_token;
      setAdminToken(newToken);
      processQueue(null, newToken);

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return adminAxios(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAdminAuth();
      if (typeof window !== "undefined") {
        window.location.href = ROUTES.adminLogin;
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default adminAxios;
