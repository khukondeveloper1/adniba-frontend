"use client";

import React, { useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useAdminApiDocs, useAdminCreateDoc,
  useAdminUpdateDoc, useAdminDeleteDoc,
} from "@/hooks/use-admin-data";
import { useApiError } from "@/hooks/use-api-error";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogBody, DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/badge";
import { FormField } from "@/components/ui/input";
import { formatDisplayDate } from "@/lib/utils";
import { DOC_CATEGORIES, DOC_CATEGORY_LABELS, type DocCategory } from "@/constants/networks";
import type { ApiDoc } from "@/types";

const docSchema = z.object({
  title: z.string().min(1, "Title required").max(200),
  category: z.enum(DOC_CATEGORIES),
  content_html: z.string().min(1, "Content required"),
  sort_order: z.number().int().min(0).optional(),
  is_published: z.boolean().optional(),
});
type DocFormInput = z.infer<typeof docSchema>;

export default function AdminApiDocsPage() {
  const [categoryFilter, setCategoryFilter] = useState<DocCategory | "all">("all");
  const { data: docs = [], isLoading } = useAdminApiDocs(
    categoryFilter === "all" ? undefined : categoryFilter,
  );
  const { mutateAsync: createDoc, isPending: creating } = useAdminCreateDoc();
  const { mutateAsync: updateDoc, isPending: updating } = useAdminUpdateDoc();
  const { mutateAsync: deleteDoc } = useAdminDeleteDoc();
  const { handleError } = useApiError();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ApiDoc | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiDoc | null>(null);
  const [previewDoc, setPreviewDoc] = useState<ApiDoc | null>(null);

  const { register, handleSubmit, setValue, watch, reset, setError, formState: { errors } } =
    useForm<DocFormInput>({
      resolver: zodResolver(docSchema),
      defaultValues: { is_published: true, sort_order: 0, category: "general" },
    });

  const openCreate = () => {
    reset({ is_published: true, sort_order: docs.length, category: "general" });
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (doc: ApiDoc) => {
    setEditing(doc);
    reset({
      title: doc.title,
      category: doc.category,
      content_html: doc.content_html,
      sort_order: doc.sort_order,
      is_published: doc.is_published,
    });
    setFormOpen(true);
  };

  const onSubmit = async (data: DocFormInput) => {
    try {
      if (editing) {
        await updateDoc({ id: editing.id, input: data });
      } else {
        await createDoc(data);
      }
      setFormOpen(false);
    } catch (err) { handleError(err, { setError }); }
  };

  return (
    <div className="dashboard-content">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">API Documentation</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> New Doc</Button>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => setCategoryFilter("all")}
          className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${categoryFilter === "all" ? "bg-primary text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
        >
          All ({docs.length})
        </button>
        {DOC_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${categoryFilter === cat ? "bg-primary text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          >
            {DOC_CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-card divide-y divide-slate-100">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-4">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))
          : docs.length === 0
            ? <p className="py-10 text-center text-sm text-slate-400">No docs yet.</p>
            : docs.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900">{doc.title}</p>
                    {!doc.is_published && (
                      <Badge variant="inactive" className="text-xs">Draft</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {DOC_CATEGORY_LABELS[doc.category]}
                    </Badge>
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-xs text-slate-400">order {doc.sort_order}</span>
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-xs text-slate-400">{formatDisplayDate(doc.updated_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Quick publish toggle */}
                  <Switch
                    checked={doc.is_published}
                    onCheckedChange={async (v) => {
                      try { await updateDoc({ id: doc.id, input: { is_published: v } }); }
                      catch (err) { handleError(err); }
                    }}
                  />
                  <Button
                    variant="ghost" size="icon-sm"
                    className="text-slate-400 hover:text-primary"
                    onClick={() => setPreviewDoc(doc)}
                    title="Preview"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon-sm"
                    className="text-slate-400 hover:text-slate-700"
                    onClick={() => openEdit(doc)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon-sm"
                    className="text-slate-400 hover:text-red-500"
                    onClick={() => setDeleteTarget(doc)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={formOpen} onOpenChange={(o) => !o && setFormOpen(false)}>
        <DialogContent size="xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Doc" : "New Doc"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <DialogBody className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <FormField
                    label="Title"
                    required
                    placeholder="Getting Started"
                    error={!!errors.title}
                    errorMessage={errors.title?.message}
                    {...register("title")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Category <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={watch("category")}
                    onValueChange={(v) => setValue("category", v as DocCategory)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DOC_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {DOC_CATEGORY_LABELS[cat]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <FormField
                    label="Sort Order"
                    type="number"
                    min={0}
                    error={!!errors.sort_order}
                    errorMessage={errors.sort_order?.message}
                    {...register("sort_order", { valueAsNumber: true })}
                  />
                </div>

                <div className="flex items-center gap-3 mt-6">
                  <Switch
                    checked={watch("is_published") ?? true}
                    onCheckedChange={(v) => setValue("is_published", v)}
                  />
                  <span className="text-sm text-slate-600">Published</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Content <span className="text-destructive">*</span>{" "}
                  <span className="text-slate-400 font-normal">(HTML)</span>
                </label>
                <textarea
                  rows={14}
                  className={`flex w-full rounded-md border bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y ${errors.content_html ? "border-destructive" : "border-slate-200"}`}
                  placeholder="<h3>Authentication</h3><p>Use the <code>x-api-key</code> header…</p>"
                  {...register("content_html")}
                />
                {errors.content_html && (
                  <p className="mt-1.5 text-xs text-destructive">{errors.content_html.message}</p>
                )}
              </div>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm" loading={creating || updating}>
                {editing ? "Save Changes" : "Create Doc"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview dialog */}
      <Dialog open={!!previewDoc} onOpenChange={(o) => !o && setPreviewDoc(null)}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>{previewDoc?.title}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div
              className="prose prose-sm prose-slate max-w-none prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded"
              dangerouslySetInnerHTML={{ __html: previewDoc?.content_html ?? "" }}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.title}"?`}
        description="This doc will be removed from the public API documentation immediately."
        confirmLabel="Delete Doc"
        onConfirm={async () => {
          if (!deleteTarget) return;
          try { await deleteDoc(deleteTarget.id); setDeleteTarget(null); }
          catch (err) { handleError(err); }
        }}
      />
    </div>
  );
}
