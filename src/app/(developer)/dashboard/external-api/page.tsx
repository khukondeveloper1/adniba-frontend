"use client";

import React, { useState } from "react";
import { Copy, Check, ChevronDown, ChevronRight, Key, Code2 } from "lucide-react";
import { usePublicApiDocs } from "@/hooks/use-public-data";
import { useDeveloperAuth } from "@/components/providers/developer-auth-provider";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { ApiKeyDialog } from "@/components/apps/api-key-dialog";
import { useApps } from "@/hooks/use-developer-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DOC_CATEGORY_LABELS, type DocCategory } from "@/constants/networks";

// ─────────────────────────────────────────────────────────────────
// EXTERNAL API PAGE
// Fetches docs from /public/api-docs, shows endpoint explorer
// and code examples in curl / JS / Kotlin.
// ─────────────────────────────────────────────────────────────────

type Lang = "curl" | "js" | "kotlin";

const LANG_LABELS: Record<Lang, string> = { curl: "cURL", js: "JavaScript", kotlin: "Kotlin" };

// Static endpoint list (external + SDK endpoints from API docs)
const ENDPOINTS = [
  {
    method: "GET" as const,
    path: "/external/config",
    description: "Fetch live ad configuration for an app",
    examples: {
      curl: `curl -X GET https://api.adniba.io/api/v1/external/config \\
  -H "x-api-key: YOUR_APP_API_KEY"`,
      js: `const res = await fetch('/api/v1/external/config', {
  headers: { 'x-api-key': process.env.ADNIBA_KEY }
});
const { data } = await res.json();`,
      kotlin: `val req = Request.Builder()
    .url("https://api.adniba.io/api/v1/external/config")
        .url("https://api.adniba.io/api/v1/external/config")
    .header("x-api-key", apiKey)
    .build()
val config = client.newCall(req).execute()`,
    },
  },
  {
    method: "POST" as const,
    path: "/ads/event",
    description: "Report an ad event (impression, click, fail)",
    examples: {
      curl: `curl -X POST https://api.adniba.io/api/v1/ads/event \\
  -H "x-api-key: YOUR_APP_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"event":"impression","placement":"home","ad_type":"banner","network":"admob"}'`,
      js: `await fetch('/api/v1/ads/event', {
  method: 'POST',
  headers: {
    'x-api-key': apiKey,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    event: 'impression',
    placement: 'home',
    ad_type: 'banner',
    network: 'admob',
  }),
});`,
      kotlin: `val body = """
  {"event":"impression","placement":"home",
   "ad_type":"banner","network":"admob"}
""".trimIndent().toRequestBody("application/json".toMediaType())
val req = Request.Builder()
    .url(".../ads/event")
    .header("x-api-key", apiKey)
    .post(body).build()`,
    },
  },
  {
    method: "POST" as const,
    path: "/ads/load",
    description: "Request an ad for a specific placement",
    examples: {
      curl: `curl -X POST https://api.adniba.io/api/v1/ads/load \\
  -H "x-api-key: YOUR_APP_API_KEY" \\
  -d '{"placement":"home","ad_type":"interstitial"}'`,
      js: `const res = await fetch('/api/v1/ads/load', {
  method: 'POST',
  headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
  body: JSON.stringify({ placement: 'home', ad_type: 'interstitial' }),
});`,
      kotlin: `// Prefer using AdnibaSDK.loadAd() for Android apps
// Direct API usage for server-side or custom clients`,
    },
  },
] as const;

const METHOD_COLORS = {
  GET: "bg-blue-100 text-blue-700",
  POST: "bg-green-100 text-green-700",
  PUT: "bg-amber-100 text-amber-700",
  DELETE: "bg-red-100 text-red-700",
} as const;

export default function ExternalApiPage() {
  const { data: docs, isLoading: docsLoading } = usePublicApiDocs();
  const { data: appsData } = useApps();
  const [lang, setLang] = useState<Lang>("curl");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<DocCategory | "all">("all");
  const [keyDialogApp, setKeyDialogApp] = useState<number | null>(null);
  const { copy, copied } = useCopyToClipboard();

  const apps = appsData?.data ?? [];
  const categories = Array.from(new Set(docs?.map((d) => d.category) ?? [])) as DocCategory[];

  const filteredDocs = docs?.filter(
    (d) => activeCategory === "all" || d.category === activeCategory,
  );

  const keyApp = keyDialogApp !== null ? apps.find((a) => a.id === keyDialogApp) : null;

  return (
    <div className="dashboard-content">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">External API</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Authenticate with your app&apos;s API key using the <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">x-api-key</code> header.
        </p>
      </div>

      {/* API key quick-access */}
      {apps.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Key className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-slate-900">Your API Keys</h2>
          </div>
          <div className="space-y-2">
            {apps.map((app) => (
              <div key={app.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{app.name}</p>
                  <code className="text-xs font-mono text-slate-400">{app.api_key.slice(0, 8)}•••••••••••••••••</code>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => copy(app.api_key)}>
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    Copy
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setKeyDialogApp(app.id)}>
                    <Key className="h-3.5 w-3.5" /> View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Endpoint explorer */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
          <Code2 className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">Endpoint Explorer</h2>

          {/* Lang tabs */}
          <div className="ml-auto flex gap-1">
            {(["curl", "js", "kotlin"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={cn(
                  "px-2.5 py-1 text-xs font-mono rounded-md transition-colors",
                  lang === l ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100",
                )}
              >
                {LANG_LABELS[l]}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {ENDPOINTS.map((ep, idx) => {
            const isOpen = expandedIdx === idx;
            return (
              <div key={ep.path}>
                <button
                  className="flex w-full items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
                  onClick={() => setExpandedIdx(isOpen ? null : idx)}
                >
                  <span className={cn("px-2 py-0.5 text-xs font-bold rounded font-mono", METHOD_COLORS[ep.method])}>
                    {ep.method}
                  </span>
                  <code className="text-sm font-mono text-slate-700 flex-1">{ep.path}</code>
                  <span className="text-xs text-slate-400 hidden sm:block">{ep.description}</span>
                  {isOpen ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-slate-500 mb-3">{ep.description}</p>
                    <div className="relative rounded-lg border border-slate-800 bg-slate-900 overflow-hidden">
                      <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800 px-4 py-2">
                        <span className="text-xs font-mono text-slate-400">{LANG_LABELS[lang]}</span>
                        <button
                          onClick={() => copy(ep.examples[lang])}
                          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                          Copy
                        </button>
                      </div>
                      <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
                        <code>{ep.examples[lang]}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CMS-driven API docs */}
      {(docsLoading || (filteredDocs && filteredDocs.length > 0)) && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Documentation</h2>
            <div className="flex gap-1 ml-auto flex-wrap">
              <button
                onClick={() => setActiveCategory("all")}
                className={cn("px-2.5 py-1 text-xs rounded-md transition-colors", activeCategory === "all" ? "bg-primary text-white" : "text-slate-500 hover:bg-slate-100")}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn("px-2.5 py-1 text-xs rounded-md transition-colors", activeCategory === cat ? "bg-primary text-white" : "text-slate-500 hover:bg-slate-100")}
                >
                  {DOC_CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {docsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocs?.map((doc) => (
                <div key={doc.id} className="rounded-lg border border-slate-100 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-slate-900">{doc.title}</h3>
                    <Badge variant="secondary" className="text-xs capitalize">{doc.category}</Badge>
                  </div>
                  <div
                    className="prose prose-sm prose-slate max-w-none prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded text-slate-600"
                    dangerouslySetInnerHTML={{ __html: doc.content_html }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* API Key dialog */}
      {keyApp && (
        <ApiKeyDialog
          open={!!keyApp}
          onOpenChange={(o) => !o && setKeyDialogApp(null)}
          appId={keyApp.id}
          apiKey={keyApp.api_key}
          appName={keyApp.name}
        />
      )}
    </div>
  );
}
