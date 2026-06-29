import type { Metadata } from "next";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { ResetPasswordCard } from "@/components/ui/reset-password-card";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Create a new password for your Elite Gold Community account.",
  alternates: {
    canonical: "/reset-password",
  },
  robots: {
    index: false,
    follow: true,
  },
};

function userUsesGoogleSignIn(user: User | null) {
  const providers = user?.app_metadata.providers ?? [];
  const hasGoogleProvider = providers.includes("google");
  const hasGoogleIdentity =
    user?.identities?.some((identity) => identity.provider === "google") ?? false;

  return hasGoogleProvider || hasGoogleIdentity;
}

async function hasSupabaseAuthSessionCookie() {
  const cookieStore = await cookies();

  return cookieStore
    .getAll()
    .some(({ name }) => name.startsWith("sb-") && name.includes("auth-token"));
}

async function getUsesGoogleSignIn() {
  if (!(await hasSupabaseAuthSessionCookie())) {
    return false;
  }

  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return false;
  }

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return false;
  }

  return userUsesGoogleSignIn(data.user);
}

export default async function ResetPasswordPage() {
  const usesGoogleSignIn = await getUsesGoogleSignIn();

  return (
    <main className="airova-reference-page dark relative isolate grid min-h-dvh place-items-center overflow-hidden bg-[#1D1D1D] px-4 py-10 text-foreground">
      <div className="relative z-10 flex w-full justify-center">
        <ResetPasswordCard usesGoogleSignIn={usesGoogleSignIn} />
      </div>
    </main>
  );
}
