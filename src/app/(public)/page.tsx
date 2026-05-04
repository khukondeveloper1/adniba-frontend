import type { Metadata } from "next";
import { HeroSection } from "@/components/landing/hero-section";
import { NetworksSection } from "@/components/landing/networks-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { SdkSection } from "@/components/landing/sdk-section";
import { ApiSection } from "@/components/landing/api-section";
import { CtaSection } from "@/components/landing/cta-section";

export const metadata: Metadata = {
  title: "Adniba — Ad Mediation Simplified",
  description:
    "Connect your Android app to every major ad network through a single SDK and dashboard.",
};

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <NetworksSection />
      <FeaturesSection />
      <SdkSection />
      <ApiSection />
      <CtaSection />
    </>
  );
}
