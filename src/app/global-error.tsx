"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center font-sans">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 mb-4">
          <AlertCircle className="h-6 w-6 text-red-500" />
        </div>
        <h1 className="text-lg font-semibold text-slate-900 mb-1">Something went wrong</h1>
        <p className="text-sm text-slate-500 max-w-xs mb-6">
          An unexpected error occurred. Our team has been notified.
        </p>
        <Button onClick={reset}>Try Again</Button>
      </body>
    </html>
  );
}
