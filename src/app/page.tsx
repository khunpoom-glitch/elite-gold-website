import type { Metadata } from "next";
import { HomePage } from "@/components/sections/home-page";
import { siteConfig } from "@/config/site";
import { loggedInAuthNoticeValue, signedOutAuthNoticeValue } from "@/lib/auth/redirect-notice";
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
  const authNotice = Array.isArray(authParam) ? authParam[0] : authParam;
  const initialHomeNotice =
    authNotice === loggedInAuthNoticeValue
      ? "logged_in"
      : authNotice === signedOutAuthNoticeValue
        ? "signed_out"
        : undefined;

  return (
    <HomePage
      initialHomeNotice={initialHomeNotice}
      publicSession={publicSession}
    />
  );
}
