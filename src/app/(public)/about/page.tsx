import type { Metadata } from "next";
import { StaticPageRenderer } from "@/components/landing/static-page-renderer";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="pt-24 pb-16 page-container">
      <StaticPageRenderer pageKey="about" />
    </div>
  );
}
