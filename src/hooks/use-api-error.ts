"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import {
  extractApiError,
  extractValidationErrors,
  parseForbiddenReason,
  isApiStatus,
} from "@/lib/utils";
import type { UseFormSetError, FieldValues, Path } from "react-hook-form";

/**
 * Centralized API error handler.
 * Determines the right UX response for each error type:
 * - 422 → maps field errors to RHF form fields
 * - 403 → returns ForbiddenReason for caller to render blocked UI
 * - 500 → toast error (critical)
 * - everything else → toast error (minor)
 */
export function useApiError() {
  const handleError = useCallback(
    <T extends FieldValues>(
      error: unknown,
      options?: {
        setError?: UseFormSetError<T>;
        onForbidden?: (reason: ReturnType<typeof parseForbiddenReason>) => void;
      },
    ) => {
      if (!(error instanceof AxiosError)) {
        toast.error("An unexpected error occurred.");
        return;
      }

      const status = error.response?.status;

      // 422 — Validation errors: map to form fields if setError provided
      if (status === 422 && options?.setError) {
        const fieldErrors = extractValidationErrors(error);
        Object.entries(fieldErrors).forEach(([field, message]) => {
          options.setError!(field as Path<T>, {
            type: "server",
            message,
          });
        });
        // Also show a brief toast so user knows something failed
        toast.error("Please fix the highlighted errors.");
        return;
      }

      // 403 — Forbidden with sub-type detection
      if (status === 403) {
        const reason = parseForbiddenReason(error);
        if (options?.onForbidden) {
          options.onForbidden(reason);
        } else {
          toast.error(extractApiError(error));
        }
        return;
      }

      // 500 — Server error (critical toast)
      if (status === 500) {
        toast.error("A server error occurred. Please try again later.");
        return;
      }

      // 409 — Conflict
      if (status === 409) {
        toast.warning(extractApiError(error));
        return;
      }

      // All others — generic error toast
      toast.error(extractApiError(error));
    },
    [],
  );

  return { handleError };
}
