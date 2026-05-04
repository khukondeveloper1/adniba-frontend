import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { QueryProvider, ToastProvider } from "@/components/providers/query-provider";
import "@/styles/globals.css";

// ─────────────────────────────────────────────────────────────────
// FONTS
// ─────────────────────────────────────────────────────────────────

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["400", "500"],
});

// ─────────────────────────────────────────────────────────────────
// METADATA
// ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: "Adniba — Ad Mediation Platform",
    template: "%s | Adniba",
  },
  description:
    "Adniba is a powerful ad mediation platform that connects your Android app with top ad networks through a single unified SDK.",
  keywords: ["ad mediation", "android ads", "admob", "ad network", "sdk"],
  authors: [{ name: "Adniba" }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Adniba",
    title: "Adniba — Ad Mediation Platform",
    description:
      "Connect your Android app to top ad networks through a single unified SDK.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

// ─────────────────────────────────────────────────────────────────
// ROOT LAYOUT
// Providers that must exist at root scope:
//   - QueryProvider (React Query client)
//   - ToastProvider (Sonner toasts)
// Auth providers are per-route-group to avoid cross-contamination.
// ─────────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <QueryProvider>
          {children}
          <ToastProvider />
        </QueryProvider>
      </body>
    </html>
  );
}
