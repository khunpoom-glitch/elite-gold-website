import type { Metadata } from "next";
import { HomePage } from "@/components/sections/home-page";
import { siteConfig } from "@/config/site";
import { getPublicSessionState } from "@/lib/member/public-session";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

type RootHomeSearchParams = {
  auth?: string | string[];
};

type RootHomePageProps = {
  searchParams?: Promise<RootHomeSearchParams>;
};

export default async function RootHomePage({ searchParams }: RootHomePageProps) {
  const [publicSession, resolvedSearchParams] = await Promise.all([
    getPublicSessionState(),
    searchParams ?? Promise.resolve<RootHomeSearchParams>({}),
  ]);
  const authParam = resolvedSearchParams.auth;
  const initialHomeNotice =
    (Array.isArray(authParam) ? authParam[0] : authParam) === "signed-out"
      ? "signed_out"
      : undefined;

  return (
    <HomePage
      initialHomeNotice={initialHomeNotice}
      publicSession={publicSession}
    />
  );
}
