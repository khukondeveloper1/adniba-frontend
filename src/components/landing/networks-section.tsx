"use client";

import React from "react";
import { Globe, Wifi } from "lucide-react";
import { usePublicNetworks } from "@/hooks/use-public-data";
import { Skeleton } from "@/components/ui/badge";
import { getInitials, cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────
// NETWORKS SECTION
// Fetches from /public/networks — shows logo or text fallback.
// ─────────────────────────────────────────────────────────────────

export function NetworksSection() {
  const { data: networks, isLoading } = usePublicNetworks();

  return (
    <section id="networks" className="py-24 bg-slate-50">
      <div className="page-container">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500 mb-4">
            <Globe className="h-3.5 w-3.5" />
            Supported Networks
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            All major ad networks,
            <br />
            one integration.
          </h2>
          <p className="mt-4 text-slate-500 max-w-xl mx-auto">
            Connect once with the AdNex SDK. Switch networks, adjust priorities,
            and configure fallbacks — all without touching your app.
          </p>
        </div>

        {/* Network cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))
            : networks?.map((network) => (
                <NetworkCard key={network.id} network={network} />
              ))}
        </div>

        {/* Bottom caption */}
        {!isLoading && networks && networks.length > 0 && (
          <p className="text-center mt-8 text-xs text-slate-400">
            {networks.length} networks available · More coming soon
          </p>
        )}
      </div>
    </section>
  );
}

// ── Single network card ───────────────────────────────────────────

interface NetworkCardProps {
  network: {
    id: number;
    name: string;
    display_name: string;
    logo_url: string | null;
    is_active: boolean;
  };
}

function NetworkCard({ network }: NetworkCardProps) {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div
      className={cn(
        "group relative flex flex-col items-center justify-center gap-3 rounded-xl border bg-white p-6 text-center transition-all duration-200 hover:border-primary/30 hover:shadow-card-hover",
        "border-slate-200 shadow-card",
      )}
    >
      {/* Network logo or initials fallback */}
      <div className="h-12 w-12 flex items-center justify-center">
        {network.logo_url && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={network.logo_url}
            alt={network.display_name}
            className="h-10 w-10 object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            {getInitials(network.display_name)}
          </div>
        )}
      </div>

      {/* Name */}
      <div>
        <p className="text-sm font-semibold text-slate-800">
          {network.display_name}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{network.name}</p>
      </div>

      {/* Active dot */}
      {network.is_active && (
        <span className="absolute top-3 right-3 h-1.5 w-1.5 rounded-full bg-green-500" />
      )}
    </div>
  );
}
