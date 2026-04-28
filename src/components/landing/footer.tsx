import React from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { ROUTES } from "@/constants/routes";

// ─────────────────────────────────────────────────────────────────
// LANDING FOOTER
// ─────────────────────────────────────────────────────────────────

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "SDK Integration", href: "#sdk" },
    { label: "API Reference", href: ROUTES.docs },
  ],
  Company: [
    { label: "About", href: ROUTES.about },
    { label: "Contact", href: ROUTES.contact },
  ],
  Legal: [
    { label: "Privacy Policy", href: ROUTES.privacy },
    { label: "Terms of Service", href: ROUTES.terms },
  ],
  Developers: [
    { label: "API Docs", href: ROUTES.docs },
    { label: "Register", href: ROUTES.register },
    { label: "Dashboard", href: ROUTES.login },
  ],
};

export function LandingFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="page-container py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                AdNex
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-500">
              The unified ad mediation platform for Android developers.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 hover:text-slate-200 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <p>© {new Date().getFullYear()} AdNex. All rights reserved.</p>
          <p className="text-xs">Built for Android developers.</p>
        </div>
      </div>
    </footer>
  );
}
