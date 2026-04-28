"use client";

import React from "react";
import { usePublicPage } from "@/hooks/use-public-data";
import { Skeleton } from "@/components/ui/badge";
import { formatDisplayDate } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────
// STATIC PAGE RENDERER
// Fetches a CMS page by key and renders its content_html.
// Used for About, Privacy Policy, Terms, Contact pages.
// ─────────────────────────────────────────────────────────────────

interface StaticPageRendererProps {
  pageKey: string;
}

export function StaticPageRenderer({ pageKey }: StaticPageRendererProps) {
  const { data: page, isLoading, isError } = usePublicPage(pageKey);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 py-12">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-48" />
        <div className="space-y-3 pt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className={`h-4 ${i % 3 === 2 ? "w-3/4" : "w-full"}`} />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !page) {
    return (
      <div className="max-w-3xl mx-auto py-24 text-center">
        <p className="text-slate-500">This page is not available right now.</p>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto py-12">
      <header className="mb-8 pb-8 border-b border-slate-100">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{page.title}</h1>
        <p className="text-sm text-slate-400">
          Last updated {formatDisplayDate(page.updated_at)}
        </p>
      </header>

      {/* Rendered HTML from CMS — sanitised on the server side */}
      <div
        className="prose prose-slate max-w-none prose-headings:font-semibold prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
        dangerouslySetInnerHTML={{ __html: page.content_html }}
      />
    </article>
  );
}
