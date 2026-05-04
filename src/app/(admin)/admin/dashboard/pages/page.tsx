"use client";

import React, { useState, useEffect } from "react";
import { useAdminPages, useAdminPage, useAdminUpdatePage } from "@/hooks/use-admin-data";
import { useApiError } from "@/hooks/use-api-error";
import { Switch } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/badge";
import { FormField } from "@/components/ui/input";
import { formatDisplayDate } from "@/lib/utils";
import { PAGE_LABELS, type PageKey } from "@/constants/networks";

export default function AdminPagesPage() {
  const { data: pages = [], isLoading: listLoading } = useAdminPages();
  const [activeKey, setActiveKey] = useState<PageKey>("about");

  return (
    <div className="dashboard-content">
      <h1 className="text-xl font-semibold text-slate-900">Static Pages</h1>
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Page list */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-card divide-y divide-slate-100">
            {listLoading
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 m-1 rounded-lg" />)
              : pages.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setActiveKey(p.key as PageKey)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${activeKey === p.key ? "bg-primary/5 text-primary font-medium" : "text-slate-700 hover:bg-slate-50"}`}
                >
                  <span>{PAGE_LABELS[p.key as PageKey] ?? p.key}</span>
                  <span className={`h-1.5 w-1.5 rounded-full ${p.is_published ? "bg-green-500" : "bg-slate-300"}`} />
                </button>
              ))}
          </div>
        </div>
        {/* Editor */}
        <div className="lg:col-span-3">
          <PageEditor pageKey={activeKey} />
        </div>
      </div>
    </div>
  );
}

function PageEditor({ pageKey }: { pageKey: PageKey }) {
  const { data: page, isLoading } = useAdminPage(pageKey);
  const { mutateAsync: updatePage, isPending: saving } = useAdminUpdatePage();
  const { handleError } = useApiError();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (page) { setTitle(page.title); setContent(page.content_html); setPublished(page.is_published); }
  }, [page]);

  const handleSave = async () => {
    try {
      await updatePage({ key: pageKey, input: { title, content_html: content, is_published: published } });
    } catch (err) { handleError(err); }
  };

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">{PAGE_LABELS[pageKey] ?? pageKey}</h2>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span>Published</span>
          <Switch checked={published} onCheckedChange={setPublished} />
        </div>
      </div>

      {page?.updated_at && (
        <p className="text-xs text-slate-400">Last saved: {formatDisplayDate(page.updated_at)}</p>
      )}

      <FormField label="Page Title" required value={title} onChange={(e) => setTitle(e.target.value)} />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Content <span className="text-slate-400 font-normal">(HTML)</span>
        </label>
        <textarea
          rows={16}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
          placeholder="<h2>About Adniba</h2><p>…</p>"
        />
        <p className="mt-1.5 text-xs text-slate-400">HTML content. Rendered on the public-facing static page.</p>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving}>Save Page</Button>
      </div>
    </div>
  );
}
