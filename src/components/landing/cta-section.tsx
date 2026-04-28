import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

// ─────────────────────────────────────────────────────────────────
// CTA SECTION
// Final conversion section before footer.
// ─────────────────────────────────────────────────────────────────

export function CtaSection() {
  return (
    <section className="py-24 bg-primary">
      <div className="page-container text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
          Ready to simplify your ad stack?
        </h2>
        <p className="text-blue-100 max-w-xl mx-auto mb-10 text-lg">
          Register for free, integrate the SDK in minutes, and start serving
          ads from every major network through a single dashboard.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            className="bg-white text-primary hover:bg-blue-50 h-12 px-8 text-base font-semibold shadow-lg"
            asChild
          >
            <Link href={ROUTES.register}>
              Create Free Account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            className="border-2 border-white/30 bg-transparent text-white hover:bg-white/10 h-12 px-8 text-base font-semibold"
            variant="outline"
            asChild
          >
            <Link href={ROUTES.login}>Already have an account</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
