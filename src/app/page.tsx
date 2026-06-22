import type { Metadata } from "next";
import { HomePage } from "@/components/sections/home-page";
import { siteConfig } from "@/config/site";
import { getPublicSessionState } from "@/lib/member/public-session";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default async function RootHomePage() {
  const publicSession = await getPublicSessionState();

  return <HomePage publicSession={publicSession} />;
}
