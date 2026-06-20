import type { Metadata } from "next";
import { KeyRound, MailCheck, ReceiptText, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { MemberProfileForm } from "@/components/dashboard/member-profile-form";
import { getAuthenticatedMember } from "@/lib/member/session";

export const metadata: Metadata = {
  title: "My Account",
};

function formatEmailStatus(emailConfirmedAt: string | null) {
  return emailConfirmedAt ? "Email confirmed" : "Pending confirmation";
}

export default async function AccountPage() {
  const { memberStatus, profile } = await getAuthenticatedMember("/dashboard/account");

  return (
    <section className="grid gap-6">
      <header className="rounded-md border border-white/10 bg-black/68 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_70px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:p-6">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/24 bg-gold/10 px-3 py-1 text-xs font-bold uppercase text-soft-gold">
            <UserRound aria-hidden="true" className="size-3.5" />
            My Account
          </div>
          <h1 className="elite-display-type mt-4 text-balance text-3xl font-semibold leading-tight text-white sm:text-4xl">
            Profile, security, and member record
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            Manage the editable profile fields from Phase 2 signup. Payment, billing, membership upgrades, and affiliate payouts stay locked for Phase 5.
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-md border border-white/10 bg-black/72 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]">
          <MailCheck aria-hidden="true" className="size-5 text-soft-gold" />
          <p className="mt-4 text-xs font-semibold uppercase text-white/42">Email</p>
          <h2 className="mt-2 text-base font-semibold text-white">{formatEmailStatus(profile.emailConfirmedAt)}</h2>
          <p className="mt-2 break-all text-sm text-muted-foreground">{profile.email}</p>
        </article>

        <article className="rounded-md border border-white/10 bg-black/72 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]">
          <ShieldCheck aria-hidden="true" className="size-5 text-soft-gold" />
          <p className="mt-4 text-xs font-semibold uppercase text-white/42">Member Status</p>
          <h2 className="mt-2 text-base font-semibold text-white">{memberStatus}</h2>
          <p className="mt-2 text-sm text-muted-foreground">Synced from the authenticated profile record.</p>
        </article>

        <article className="rounded-md border border-white/10 bg-black/72 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]">
          <KeyRound aria-hidden="true" className="size-5 text-soft-gold" />
          <p className="mt-4 text-xs font-semibold uppercase text-white/42">Security</p>
          <h2 className="mt-2 text-base font-semibold text-white">Password actions ready</h2>
          <p className="mt-2 text-sm text-muted-foreground">Use forgot/reset password flow for credential changes.</p>
        </article>

        <article className="rounded-md border border-white/10 bg-black/72 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]">
          <ReceiptText aria-hidden="true" className="size-5 text-soft-gold" />
          <p className="mt-4 text-xs font-semibold uppercase text-white/42">Membership</p>
          <h2 className="mt-2 text-base font-semibold text-white">Phase 5 placeholder</h2>
          <p className="mt-2 text-sm text-muted-foreground">Plans, billing, renewal, and payment history are not active yet.</p>
        </article>
      </section>

      <section className="rounded-md border border-white/10 bg-black/70 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)] sm:p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-soft-gold">Editable Profile</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Member details</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-md border border-gold/20 bg-gold/10 px-3 py-2 text-xs font-semibold text-soft-gold">
            <Sparkles aria-hidden="true" className="size-3.5" />
            Referral: {profile.referralCode}
          </div>
        </div>

        <MemberProfileForm profile={profile} />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Membership", "Current plan, expiry, renewal, and upgrade controls are reserved for Phase 5."],
          ["Affiliate Program", "Invited users, referral tracking, commissions, and payouts are reserved for Phase 5."],
          ["Billing History", "Receipts and payment records will be connected after the membership system is built."],
        ].map(([title, description]) => (
          <article className="rounded-md border border-white/10 bg-black/72 p-5" key={title}>
            <h2 className="text-base font-semibold text-white">{title}</h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p>
          </article>
        ))}
      </section>
    </section>
  );
}
