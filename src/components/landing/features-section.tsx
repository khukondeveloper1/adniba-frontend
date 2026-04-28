import React from "react";
import {
  GitBranch,
  Settings2,
  BarChart3,
  Key,
  Layers,
  RefreshCw,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────
// FEATURES SECTION
// Static — showcases platform pillars.
// ─────────────────────────────────────────────────────────────────

const features = [
  {
    icon: GitBranch,
    title: "Mediation Engine",
    description:
      "Define priority order across networks. Enable fallback mode to automatically cycle through networks when one fails.",
    accent: "bg-blue-50 text-blue-600",
  },
  {
    icon: Settings2,
    title: "Real-time Configuration",
    description:
      "Change ad networks, update placements, and tweak priority — all without releasing a new app update.",
    accent: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: Layers,
    title: "Multi-network Support",
    description:
      "Connect AdMob, Meta Audience Network, Unity Ads and more to the same placement simultaneously.",
    accent: "bg-violet-50 text-violet-600",
  },
  {
    icon: BarChart3,
    title: "Unified Analytics",
    description:
      "Track impressions, clicks, fill rates, and CTR across all networks from a single dashboard view.",
    accent: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Key,
    title: "Secure API Keys",
    description:
      "Per-app API keys with rotation support. Integrate with your own backend or use the External API directly.",
    accent: "bg-amber-50 text-amber-600",
  },
  {
    icon: RefreshCw,
    title: "Force & Fallback Modes",
    description:
      "Force a specific network per placement, or enable fallback to let the SDK cascade through your priority list.",
    accent: "bg-rose-50 text-rose-600",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="page-container">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500 mb-4">
            Platform Features
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Everything you need to
            <br />
            maximise ad revenue.
          </h2>
          <p className="mt-4 text-slate-500 max-w-xl mx-auto">
            AdNex handles the complexity of ad mediation so you can focus on
            building great apps.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Feature card ──────────────────────────────────────────────────

interface FeatureCardProps {
  feature: (typeof features)[number];
}

function FeatureCard({ feature }: FeatureCardProps) {
  const Icon = feature.icon;
  return (
    <div className="group flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:border-slate-300 hover:shadow-card-hover">
      <div
        className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${feature.accent}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-slate-900 mb-1.5">
          {feature.title}
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed">
          {feature.description}
        </p>
      </div>
    </div>
  );
}
