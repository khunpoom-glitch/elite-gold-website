import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/legal-page";
import { legalPages } from "@/config/legal";
import { siteConfig } from "@/config/site";

const page = legalPages["risk-disclosure"];

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: {
    canonical: "/risk-disclosure",
  },
  openGraph: {
    title: `${page.title} | ${siteConfig.name}`,
    description: page.description,
    url: "/risk-disclosure",
  },
};

export default function RiskDisclosurePage() {
  return <LegalPage page={page} />;
}
