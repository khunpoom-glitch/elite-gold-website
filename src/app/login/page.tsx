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

export default async function LoginPage() {
  const publicSession = await getPublicSessionState();

  return <HomePage initialAuthMode="login" publicSession={publicSession} />;
}
