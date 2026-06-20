import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { HomePage } from "@/components/sections/home-page";
import { getSafeRedirectPath } from "@/lib/auth/validation";
import {
  getGoogleSignupProfileFromUser,
  getMemberProfileByUserId,
} from "@/lib/member/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Sign Up พร้อม Access Code สำหรับ Elite Gold Community",
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
    auth?: string | string[];
    next?: string | string[];
    notice?: string | string[];
  }>;
};

function getFirstSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const authProvider = getFirstSearchParam(params.auth);
  const nextPath = getSafeRedirectPath(getFirstSearchParam(params.next));
  const notice = getFirstSearchParam(params.notice);
  const accessCode =
    getFirstSearchParam(params.ref) ??
    getFirstSearchParam(params.refCode) ??
    getFirstSearchParam(params.referral) ??
    getFirstSearchParam(params.referralCode);
  let googleSignupProfile;

  if (authProvider === "google") {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = supabase
      ? await supabase.auth.getUser()
      : { data: { user: null } };

    if (user && supabase) {
      const profile = await getMemberProfileByUserId(supabase, user.id);

      if (profile) {
        redirect(nextPath);
      }

      googleSignupProfile = getGoogleSignupProfileFromUser(user);
    }
  }

  return (
    <HomePage
      initialAccessCode={accessCode}
      initialAuthMode="signup"
      initialAuthNotice={notice}
      initialGoogleSignupProfile={googleSignupProfile}
    />
  );
}
