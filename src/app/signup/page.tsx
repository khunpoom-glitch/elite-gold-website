import type { Metadata } from "next";
import { HomePage } from "@/components/sections/home-page";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Sign Up พร้อม Referral Code สำหรับ Elite Gold Community",
  alternates: {
    canonical: "/signup",
  },
  robots: {
    index: false,
    follow: true,
  },
};

type SignupPageProps = {
  searchParams: Promise<{
    ref?: string | string[];
    refCode?: string | string[];
    referral?: string | string[];
    referralCode?: string | string[];
  }>;
};

function getFirstSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const referralCode =
    getFirstSearchParam(params.ref) ??
    getFirstSearchParam(params.refCode) ??
    getFirstSearchParam(params.referral) ??
    getFirstSearchParam(params.referralCode);

  return (
    <HomePage
      initialAuthMode="signup"
      initialReferralCode={referralCode}
    />
  );
}
