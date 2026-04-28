import type { Metadata } from "next";
import { StaticPageRenderer } from "@/components/landing/static-page-renderer";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="pt-24 pb-16 page-container">
      <StaticPageRenderer pageKey="privacy_policy" />
    </div>
  );
}
