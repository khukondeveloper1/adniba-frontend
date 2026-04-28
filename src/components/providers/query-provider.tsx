"use client";

import React, { useState } from "react";
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { makeQueryClient } from "@/lib/query-client";

// ─────────────────────────────────────────────────────────────────
// QUERY PROVIDER
// Stable QueryClient across re-renders using useState
// ─────────────────────────────────────────────────────────────────

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState ensures the QueryClient is only created once per component mount
  const [queryClient] = useState<QueryClient>(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

// ─────────────────────────────────────────────────────────────────
// TOAST PROVIDER
// Uses sonner — positioned bottom-right, light theme only
// ─────────────────────────────────────────────────────────────────

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      theme="light"
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        classNames: {
          toast: "font-sans text-sm",
          error: "border-red-200",
          success: "border-green-200",
          warning: "border-amber-200",
          info: "border-blue-200",
        },
      }}
    />
  );
}
