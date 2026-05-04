"use client";

import React, { useState } from "react";
import { Code2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────
// API SECTION
// Shows external API preview with multi-language code examples.
// ─────────────────────────────────────────────────────────────────

type Lang = "curl" | "js" | "kotlin";

const codeExamples: Record<Lang, string> = {
  curl: `curl -X GET \\
  https://api.adniba.io/api/v1/external/config \\
  -H "x-api-key: YOUR_APP_API_KEY" \\
  -H "Content-Type: application/json"`,

  js: `const response = await fetch(
  'https://api.adniba.io/api/v1/external/config',
  {
    headers: {
      'x-api-key': process.env.ADNIBA_API_KEY,
    },
  }
);
const { data } = await response.json();`,

  kotlin: `val client = OkHttpClient()
val request = Request.Builder()
    .url("https://api.adniba.io/api/v1/external/config")
    .addHeader("x-api-key", BuildConfig.ADNIBA_API_KEY)
    .build()

client.newCall(request).execute().use { response ->
    val config = response.body?.string()
}`,
};

const langLabels: Record<Lang, string> = {
  curl: "cURL",
  js: "JavaScript",
  kotlin: "Kotlin",
};

const highlights = [
  { label: "API key authentication", desc: "Per-app x-api-key header" },
  { label: "JSON responses", desc: "Consistent envelope format" },
  { label: "Ad config endpoint", desc: "Fetch live mediation config" },
  { label: "Event tracking", desc: "Report impressions & clicks" },
];

export function ApiSection() {
  const [lang, setLang] = useState<Lang>("curl");
  const { copy, copied } = useCopyToClipboard();

  return (
    <section id="api" className="py-24 bg-white">
      <div className="page-container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: code */}
          <div className="rounded-xl border border-slate-200 bg-slate-900 shadow-dialog overflow-hidden order-2 lg:order-1">
            {/* Tab bar */}
            <div className="flex items-center border-b border-slate-700 bg-slate-800 px-4 py-2">
              <div className="flex gap-1">
                {(Object.keys(codeExamples) as Lang[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={cn(
                      "px-3 py-1 text-xs font-mono rounded-md transition-colors",
                      lang === l
                        ? "bg-slate-600 text-white"
                        : "text-slate-400 hover:text-slate-200",
                    )}
                  >
                    {langLabels[l]}
                  </button>
                ))}
              </div>
              <button
                onClick={() => copy(codeExamples[lang])}
                className="ml-auto flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="p-6 text-sm font-mono text-slate-300 leading-relaxed overflow-x-auto">
              <code>{codeExamples[lang]}</code>
            </pre>
          </div>

          {/* Right: content */}
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500 mb-5">
              <Code2 className="h-3.5 w-3.5" />
              External REST API
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              Direct API access
              <br />
              for any platform.
            </h2>
            <p className="text-slate-500 mb-8">
              Use the External API to fetch live ad configuration from any backend or
              platform. Authenticate with your app&apos;s API key — no OAuth required.
            </p>

            <div className="space-y-3 mb-10">
              {highlights.map((h) => (
                <div key={h.label} className="flex items-start gap-3">
                  <div className="mt-0.5 h-5 w-5 flex-shrink-0 flex items-center justify-center rounded-full bg-primary/10">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-800">
                      {h.label}
                    </span>
                    <span className="text-sm text-slate-400"> — {h.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <Button asChild>
              <Link href={ROUTES.docs}>Explore Full API Reference →</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
