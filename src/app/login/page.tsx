import type { Metadata } from "next";
import { HomePage } from "@/components/sections/home-page";
import { getPublicSessionState } from "@/lib/member/public-session";

export const metadata: Metadata = {
  title: "Login",
  description: "Login สำหรับ Elite Gold Community",
  alternates: {
    canonical: "/login",
  },
  robots: {
    index: false,
    follow: true,
  },
};

type LoginPageProps = {
  searchParams: Promise<{
    notice?: string | string[];
    session?: string | string[];
  }>;
};

function getFirstSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const passwordNotice =
    getFirstSearchParam(params.notice) === "password-updated"
      ? "password_updated"
      : undefined;
  const sessionNotice =
    getFirstSearchParam(params.session) === "expired"
      ? "session_expired"
      : undefined;
  const authNotice = sessionNotice ?? passwordNotice;
  const publicSession = await getPublicSessionState();

  return (
    <HomePage
      initialAuthMode="login"
      initialAuthNotice={authNotice}
      publicSession={publicSession}
    />
  );
}
