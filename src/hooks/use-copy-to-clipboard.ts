"use client";

import { useState, useCallback } from "react";
import { copyToClipboard } from "@/lib/utils";

/**
 * Hook for copy-to-clipboard with temporary "copied" state feedback.
 * Resets after `resetDelay` ms (default: 2000ms).
 */
export function useCopyToClipboard(resetDelay = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      const success = await copyToClipboard(text);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), resetDelay);
      }
      return success;
    },
    [resetDelay],
  );

  return { copy, copied };
}
