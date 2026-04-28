import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { STORAGE_KEYS, ROUTES } from "@/constants/routes";
import type { ApiError, AuthTokens } from "@/types";

// ─────────────────────────────────────────────────────────────────
// DEVELOPER AXIOS INSTANCE
// - Auto-attaches JWT from localStorage on every request
// - On 401: silently attempts refresh before failing
// - On refresh fail: clears auth + redirects to /login
// ─────────────────────────────────────────────────────────────────

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

// ── Token helpers ─────────────────────────────────────────────────

export const getDevToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.devToken);
};

export const setDevToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.devToken, token);
  }
};

export const clearDevAuth = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEYS.devToken);
  }
};

// ── Refresh token queue ───────────────────────────────────────────
// When multiple requests fail with 401 simultaneously, only ONE
// refresh call should be made. Others queue up and retry after.

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

const developerAxios: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

// ── Request interceptor: attach token ─────────────────────────────

developerAxios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getDevToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: handle 401 with refresh queue ───────────

developerAxios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only intercept 401 and only once per request
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return developerAxios(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const currentToken = getDevToken();

    if (!currentToken) {
      // No token at all — hard logout
      clearDevAuth();
      isRefreshing = false;
      if (typeof window !== "undefined") {
        window.location.href = ROUTES.login;
      }
      return Promise.reject(error);
    }

    try {
      // Attempt silent token refresh
      const refreshResponse = await axios.post<AuthTokens>(
        `${BASE_URL}/developer/auth/refresh`,
        {},
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      const newToken = refreshResponse.data.access_token;
      setDevToken(newToken);
      processQueue(null, newToken);

      // Retry the original failed request with new token
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return developerAxios(originalRequest);
    } catch (refreshError) {
      // Refresh failed — clear auth and redirect to login
      processQueue(refreshError, null);
      clearDevAuth();
      if (typeof window !== "undefined") {
        window.location.href = ROUTES.login;
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default developerAxios;
