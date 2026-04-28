import type { Metadata } from "next";
import { StaticPageRenderer } from "@/components/landing/static-page-renderer";

export const metadata: Metadata = { title: "Terms of Service" };
export default function TermsPage() {
  return (
    <div className="pt-24 pb-16 page-container">
      <StaticPageRenderer pageKey="terms_conditions" />
    </div>
  );
}
