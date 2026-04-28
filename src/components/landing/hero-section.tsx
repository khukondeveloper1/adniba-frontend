"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

// ─────────────────────────────────────────────────────────────────
// HERO SECTION
// Architecture: Full-viewport, white + subtle blue gradient mesh.
// Stat row grounds the hero with concrete trust signals.
// ─────────────────────────────────────────────────────────────────

const stats = [
  { value: "3+", label: "Ad Networks" },
  { value: "1 SDK", label: "Unified Integration" },
  { value: "Real-time", label: "Configuration" },
  { value: "REST API", label: "External Access" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white">
      {/* Background mesh — subtle blue gradient blobs */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        {/* Top-right blob */}
        <div className="absolute -top-32 -right-32 h-[600px] w-[600px] rounded-full bg-blue-50 blur-[120px] opacity-70" />
        {/* Bottom-left blob */}
        <div className="absolute -bottom-48 -left-24 h-[500px] w-[500px] rounded-full bg-indigo-50 blur-[100px] opacity-60" />
        {/* Grid overlay — very subtle */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(#1e40af 1px, transparent 1px), linear-gradient(to right, #1e40af 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="page-container relative z-10 pt-24 pb-20">
        <div className="max-w-4xl">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 mb-6 animate-fade-in">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Android Ad Mediation Platform
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight leading-[1.05] mb-6 animate-fade-in"
            style={{ animationDelay: "0.1s", animationFillMode: "both" }}
          >
            Ad mediation,
            <br />
            <span className="text-primary">radically simplified.</span>
          </h1>

          {/* Sub-headline */}
          <p
            className="text-lg sm:text-xl text-slate-500 max-w-2xl leading-relaxed mb-10 animate-fade-in"
            style={{ animationDelay: "0.2s", animationFillMode: "both" }}
          >
            Connect your Android app to every major ad network through a single
            SDK. Control placements, priorities, and fallbacks — all from one
            dashboard.
          </p>

          {/* CTA row */}
          <div
            className="flex flex-wrap items-center gap-3 mb-16 animate-fade-in"
            style={{ animationDelay: "0.3s", animationFillMode: "both" }}
          >
            <Button variant="hero-primary" asChild>
              <Link href={ROUTES.register}>
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="hero-secondary" asChild>
              <Link href={ROUTES.docs}>
                <Play className="h-3.5 w-3.5 fill-current" />
                View API Docs
              </Link>
            </Button>
          </div>

          {/* Stats row */}
          <div
            className="flex flex-wrap gap-x-10 gap-y-4 animate-fade-in"
            style={{ animationDelay: "0.4s", animationFillMode: "both" }}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">
                  {stat.value}
                </span>
                <span className="text-sm text-slate-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating code card — right side, decorative on large screens */}
        <div
          className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[420px] animate-fade-in"
          style={{ animationDelay: "0.5s", animationFillMode: "both" }}
        >
          <div className="rounded-xl border border-slate-200 bg-white shadow-dialog overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <span className="ml-2 text-xs font-mono text-slate-400">
                AdNexSDK.kt
              </span>
            </div>
            <pre className="p-5 text-xs font-mono text-slate-700 leading-relaxed overflow-x-auto">
              <code>{`// One-line initialisation
AdNexSDK.initialize(
  context = this,
  apiKey  = "YOUR_API_KEY"
)

// Load an ad
AdNexSDK.loadAd(
  placement = "home",
  adType    = AdType.INTERSTITIAL
) { event ->
  when (event) {
    AdEvent.LOADED  -> ad.show()
    AdEvent.FAILED  -> logError()
  }
}`}</code>
            </pre>
          </div>
          {/* Shadow beneath card */}
          <div className="mx-8 h-4 rounded-b-xl bg-primary/10 blur-sm" />
        </div>
      </div>
    </section>
  );
}
