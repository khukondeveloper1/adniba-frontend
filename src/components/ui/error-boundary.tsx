"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface State { hasError: boolean; message: string }

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center min-h-64 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 mb-4">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">Something went wrong</h3>
          <p className="text-sm text-slate-500 mb-5 max-w-xs">{this.state.message || "An unexpected error occurred."}</p>
          <Button size="sm" onClick={() => this.setState({ hasError: false, message: "" })}>
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
