import axios, { type AxiosInstance } from "axios";

// ─────────────────────────────────────────────────────────────────
// PUBLIC AXIOS INSTANCE
// Used for all /public/* endpoints — no authentication required.
// Also used for auth endpoints (login, register, forgot-password).
// ─────────────────────────────────────────────────────────────────

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

const publicAxios: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

export default publicAxios;
