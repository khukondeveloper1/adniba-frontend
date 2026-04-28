"use client";

import React, { useState } from "react";
import { Copy, Check, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────
// SDK SECTION
// Shows integration steps + tabbed Kotlin code snippets.
// ─────────────────────────────────────────────────────────────────

const steps = [
  {
    number: "01",
    title: "Add the dependency",
    description: "Add the AdNex SDK to your app's build.gradle file.",
  },
  {
    number: "02",
    title: "Initialise the SDK",
    description: "Call AdNexSDK.initialize() once in your Application class.",
  },
  {
    number: "03",
    title: "Load and show ads",
    description: "Use placements you configured in the dashboard.",
  },
];

type TabKey = "gradle" | "init" | "load";

const codeSnippets: Record<TabKey, { label: string; lang: string; code: string }> = {
  gradle: {
    label: "build.gradle",
    lang: "groovy",
    code: `// app/build.gradle
dependencies {
    implementation 'com.adnex:sdk-android:1.0.0'
}`,
  },
  init: {
    label: "Application.kt",
    lang: "kotlin",
    code: `class MyApp : Application() {
    override fun onCreate() {
        super.onCreate()

        AdNexSDK.initialize(
            context = this,
            apiKey  = BuildConfig.ADNEX_API_KEY
        )
    }
}`,
  },
  load: {
    label: "HomeActivity.kt",
    lang: "kotlin",
    code: `// Load an interstitial ad
AdNexSDK.loadAd(
    activity  = this,
    placement = "home",
    adType    = AdType.INTERSTITIAL
) { event ->
    when (event) {
        is AdEvent.Loaded  -> event.ad.show(this)
        is AdEvent.Failed  -> Log.e("AdNex", event.reason)
        is AdEvent.Clicked -> trackClick()
    }
}`,
  },
};

export function SdkSection() {
  const [activeTab, setActiveTab] = useState<TabKey>("init");
  const { copy, copied } = useCopyToClipboard();
  const active = codeSnippets[activeTab];

  return (
    <section id="sdk" className="py-24 bg-slate-50">
      <div className="page-container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: steps */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500 mb-5">
              <Smartphone className="h-3.5 w-3.5" />
              Android SDK
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              Integrate in
              <br />
              three steps.
            </h2>
            <p className="text-slate-500 mb-10">
              The AdNex Android SDK is lightweight, battle-tested, and requires
              no per-network setup on the app side.
            </p>

            <div className="space-y-6">
              {steps.map((step) => (
                <div key={step.number} className="flex gap-4">
                  <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-bold text-primary shadow-sm">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-0.5">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-500">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Button asChild>
                <a href="#api">View Full SDK Docs →</a>
              </Button>
            </div>
          </div>

          {/* Right: code block */}
          <div className="rounded-xl border border-slate-200 bg-slate-900 shadow-dialog overflow-hidden">
            {/* Tab bar */}
            <div className="flex items-center gap-1 border-b border-slate-700 bg-slate-800 px-4 py-2">
              {/* Traffic lights */}
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />

              <div className="ml-3 flex gap-1">
                {(Object.entries(codeSnippets) as [TabKey, typeof codeSnippets[TabKey]][]).map(
                  ([key, snippet]) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={cn(
                        "px-3 py-1 text-xs font-mono rounded-md transition-colors",
                        activeTab === key
                          ? "bg-slate-600 text-white"
                          : "text-slate-400 hover:text-slate-200",
                      )}
                    >
                      {snippet.label}
                    </button>
                  ),
                )}
              </div>

              {/* Copy button */}
              <button
                onClick={() => copy(active.code)}
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

            {/* Code content */}
            <pre className="p-6 text-sm font-mono text-slate-300 leading-relaxed overflow-x-auto">
              <code>{active.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
