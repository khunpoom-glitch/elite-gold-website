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
    session?: string | string[];
  }>;
};

function getFirstSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const sessionNotice =
    getFirstSearchParam(params.session) === "expired"
      ? "session_expired"
      : undefined;
  const publicSession = await getPublicSessionState();

  return (
    <HomePage
      initialAuthMode="login"
      initialAuthNotice={sessionNotice}
      publicSession={publicSession}
    />
  );
}
