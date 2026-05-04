"use client";

import React, { useState } from "react";
import { usePublicApiDocs } from "@/hooks/use-public-data";
import { Skeleton } from "@/components/ui/badge";
import { Badge } from "@/components/ui/badge";
import { DOC_CATEGORIES, DOC_CATEGORY_LABELS, type DocCategory } from "@/constants/networks";

export default function PublicDocsPage() {
  const [activeCategory, setActiveCategory] = useState<DocCategory | "all">("all");
  const { data: docs, isLoading } = usePublicApiDocs(
    activeCategory === "all" ? undefined : activeCategory,
  );

  return (
    <div className="pt-24 pb-16 page-container">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">API Documentation</h1>
          <p className="text-slate-500">Integrate Adniba into your apps and backends.</p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${activeCategory === "all" ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            All
          </button>
          {DOC_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${activeCategory === cat ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {DOC_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Docs list */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-200 p-6 space-y-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : docs?.length === 0 ? (
          <p className="text-center text-slate-400 py-16">No documentation available in this category.</p>
        ) : (
          <div className="space-y-4">
            {docs?.map((doc) => (
              <div key={doc.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">{doc.title}</h2>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {DOC_CATEGORY_LABELS[doc.category]}
                  </Badge>
                </div>
                <div
                  className="prose prose-slate max-w-none prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-slate-900 prose-pre:text-slate-100"
                  dangerouslySetInnerHTML={{ __html: doc.content_html }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
