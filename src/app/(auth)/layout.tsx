import React from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { DeveloperAuthProvider } from "@/components/providers/developer-auth-provider";
import { ROUTES } from "@/constants/routes";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DeveloperAuthProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Minimal header */}
        <header className="flex h-16 items-center px-6 border-b border-slate-100 bg-white">
          <Link href={ROUTES.home} className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight">
              Adniba
            </span>
          </Link>
        </header>

        {/* Centered content */}
        <main className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">{children}</div>
        </main>

        {/* Footer links */}
        <footer className="py-4 text-center text-xs text-slate-400 space-x-4">
          <Link href={ROUTES.privacy} className="hover:text-slate-600 transition-colors">
            Privacy Policy
          </Link>
          <Link href={ROUTES.terms} className="hover:text-slate-600 transition-colors">
            Terms of Service
          </Link>
          <Link href={ROUTES.about} className="hover:text-slate-600 transition-colors">
            About
          </Link>
        </footer>
      </div>
    </DeveloperAuthProvider>
  );
}
