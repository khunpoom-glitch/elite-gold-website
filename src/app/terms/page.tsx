import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/legal-page";
import { legalPages } from "@/config/legal";
import { siteConfig } from "@/config/site";

const page = legalPages.terms;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: `${page.title} | ${siteConfig.name}`,
    description: page.description,
    url: "/terms",
  },
};

export default function TermsPage() {
  return <LegalPage page={page} />;
}
