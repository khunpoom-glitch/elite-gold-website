import type { Metadata } from "next";
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

export default function ResetPasswordPage() {
  return (
    <main className="airova-reference-page dark grid min-h-screen place-items-center overflow-hidden bg-background px-4 py-10 text-foreground">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.16),transparent_42%),linear-gradient(180deg,rgba(0,0,0,0.2),#000_82%)]" />
      <div className="relative z-10 w-full">
        <ResetPasswordCard />
      </div>
    </main>
  );
}
