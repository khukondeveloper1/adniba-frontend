import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, isValid } from "date-fns";
import { AxiosError } from "axios";
import type { ApiError, ForbiddenReason } from "@/types";
import { API_DATE_FORMAT } from "@/constants/networks";

// ─────────────────────────────────────────────────────────────────
// TAILWIND MERGE HELPER
// ─────────────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─────────────────────────────────────────────────────────────────
// DATE UTILITIES
// ─────────────────────────────────────────────────────────────────

/**
 * Format a date string to display format (e.g. "Jan 12, 2024")
 */
export function formatDisplayDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return "—";
    return format(date, "MMM d, yyyy");
  } catch {
    return "—";
  }
}

/**
 * Format a date string to the API's required format (YYYY-MM-DD)
 */
export function formatApiDate(date: Date): string {
  return format(date, API_DATE_FORMAT);
}

/**
 * Get date N days ago in API format
 */
export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return formatApiDate(d);
}

/**
 * Today's date in API format
 */
export function todayApiDate(): string {
  return formatApiDate(new Date());
}

// ─────────────────────────────────────────────────────────────────
// API ERROR UTILITIES
// ─────────────────────────────────────────────────────────────────

/**
 * Extract a human-readable error message from any thrown error.
 * Works for Axios errors and plain errors alike.
 */
export function extractApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError | undefined;
    if (data?.message) return data.message;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred. Please try again.";
}

/**
 * Extract field-level validation errors from a 422 response.
 * Returns a record mapping field names to their first error string.
 * Designed for use with react-hook-form's setError().
 */
export function extractValidationErrors(
  error: unknown,
): Record<string, string> {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError | undefined;
    if (data?.errors) {
      return Object.fromEntries(
        Object.entries(data.errors).map(([field, messages]) => [
          field,
          messages[0] ?? "Invalid value",
        ]),
      );
    }
  }
  return {};
}

/**
 * Determine the specific reason for a 403 response by parsing the message.
 * The API uses a single HTTP 403 for multiple distinct blocked states.
 */
export function parseForbiddenReason(error: unknown): ForbiddenReason {
  if (error instanceof AxiosError && error.response?.status === 403) {
    const message = (error.response.data as ApiError)?.message?.toLowerCase() ?? "";

    if (message.includes("suspended")) return "app_suspended";
    if (message.includes("limit") || message.includes("reached")) return "app_limit_reached";
    if (
      message.includes("deactivated") ||
      message.includes("inactive") ||
      message.includes("blocked")
    )
      return "account_deactivated";
  }
  return "unknown";
}

/**
 * Check if an Axios error has a specific HTTP status code
 */
export function isApiStatus(error: unknown, status: number): boolean {
  return error instanceof AxiosError && error.response?.status === status;
}

// ─────────────────────────────────────────────────────────────────
// STRING UTILITIES
// ─────────────────────────────────────────────────────────────────

/**
 * Truncate a string with ellipsis if it exceeds maxLength
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}…`;
}

/**
 * Mask an API key for safe display in tables
 * "adniba_abc123xyz456" → "adniba_abc1••••••••"
 */
export function maskApiKey(key: string): string {
  if (key.length <= 12) return "••••••••••••";
  return `${key.slice(0, 10)}${"•".repeat(8)}`;
}

/**
 * Copy text to clipboard. Returns true on success.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate initials from a name (max 2 chars)
 * "John Developer" → "JD"
 * "AdMob" → "AM"
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

// ─────────────────────────────────────────────────────────────────
// NUMBER UTILITIES
// ─────────────────────────────────────────────────────────────────

/**
 * Format large numbers with K/M suffix
 * 1200 → "1.2K", 1500000 → "1.5M"
 */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

/**
 * Format a percentage value with fixed decimal places
 */
export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}
