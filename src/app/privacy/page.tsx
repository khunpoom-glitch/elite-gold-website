import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/legal-page";
import { legalPages } from "@/config/legal";
import { siteConfig } from "@/config/site";

const page = legalPages.privacy;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: `${page.title} | ${siteConfig.name}`,
    description: page.description,
    url: "/privacy",
  },
};

export default function PrivacyPage() {
  return <LegalPage page={page} />;
}
