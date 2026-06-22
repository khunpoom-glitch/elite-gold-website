"use client";

import { useActionState, type CSSProperties } from "react";
import { AlertTriangle, CheckCircle2, Save } from "lucide-react";
import { updateMemberProfileAction } from "@/app/auth/actions";
import { Input } from "@/components/ui/input";
import { ShinyButton } from "@/components/ui/shiny-button";
import { initialAuthActionState } from "@/lib/auth/action-state";
import type { MemberProfile } from "@/lib/member/profile";

type MemberProfileFormProps = {
  isMemberActive?: boolean;
  profile: Pick<
    MemberProfile,
    | "email"
    | "firstName"
    | "lastName"
    | "nickname"
    | "nationality"
    | "phoneCountry"
    | "phone"
    | "signupAccessCode"
    | "memberAccessCode"
  >;
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <span className="text-xs font-medium text-[#F6E3A3]">{message}</span>;
}

export function MemberProfileForm({
  isMemberActive = true,
  profile,
}: MemberProfileFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateMemberProfileAction,
    initialAuthActionState,
  );

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-white/76">
          First Name
          <Input
            autoComplete="given-name"
            defaultValue={profile.firstName}
            name="firstName"
            required
          />
          <FieldError message={state.fieldErrors?.firstName} />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-white/76">
          Last Name
          <Input
            autoComplete="family-name"
            defaultValue={profile.lastName}
            name="lastName"
            required
          />
          <FieldError message={state.fieldErrors?.lastName} />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-white/76">
          Nickname
          <Input
            autoComplete="nickname"
            defaultValue={profile.nickname}
            name="nickname"
            required
          />
          <FieldError message={state.fieldErrors?.nickname} />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-white/76">
          Nationality
          <Input
            autoComplete="country-name"
            defaultValue={profile.nationality}
            name="nationality"
            placeholder="TH"
            required
          />
          <FieldError message={state.fieldErrors?.nationality} />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-white/76">
          Phone Country
          <Input
            autoComplete="tel-country-code"
            defaultValue={profile.phoneCountry}
            name="phoneCountry"
            placeholder="TH"
            required
          />
          <FieldError message={state.fieldErrors?.phoneCountry} />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-white/76">
          Phone Number
          <Input
            autoComplete="tel-national"
            defaultValue={profile.phone}
            name="phone"
            required
            type="tel"
          />
          <FieldError message={state.fieldErrors?.phone} />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-white/54">
          Email
          <Input
            aria-describedby="email-readonly-note"
            defaultValue={profile.email}
            name="emailDisplay"
            readOnly
          />
          <span className="text-xs font-normal text-white/40" id="email-readonly-note">
            Email changes are handled through account security.
          </span>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-white/54">
          My Access Code
          <Input
            aria-describedby="member-access-readonly-note"
            defaultValue={isMemberActive ? profile.memberAccessCode : "Locked until email verification"}
            name="memberAccessCodeDisplay"
            readOnly
          />
          <span className="text-xs font-normal text-white/40" id="member-access-readonly-note">
            {isMemberActive
              ? "This is the code members can share with new applicants."
              : "Verify your email before using member access features."}
          </span>
        </label>
      </div>

      <label className="grid gap-2 text-sm font-semibold text-white/54">
        Signup Access Source
        <Input
          aria-describedby="signup-access-readonly-note"
          defaultValue={profile.signupAccessCode}
          name="signupAccessCodeDisplay"
          readOnly
        />
        <span className="text-xs font-normal text-white/40" id="signup-access-readonly-note">
          This records the code used when this account was created.
        </span>
      </label>

      {state.status === "error" ? (
        <div className="member-status-warning flex items-start gap-2 rounded-2xl border px-3 py-2 text-sm" role="alert">
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {state.message}
        </div>
      ) : null}

      {state.status === "success" ? (
        <div className="member-status-success flex items-start gap-2 rounded-2xl border px-3 py-2 text-sm" role="status">
          <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {state.message}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-6 text-white/42">
          Saved changes update your member profile only. Membership, billing, and access attribution stay locked for later phases.
        </p>
        <ShinyButton
          className="h-10 gap-2 rounded-xl px-4 py-2 text-sm font-bold sm:w-auto"
          disabled={isPending}
          style={{
            "--shiny-button-border": "rgba(230, 199, 102, 0.46)",
            "--shiny-button-border-highlight": "rgba(255, 248, 215, 0.88)",
            "--shiny-button-border-muted": "rgba(230, 199, 102, 0.10)",
            "--shiny-button-foreground": "rgba(246, 227, 163, 0.94)",
            background: "#000000",
            fontSize: "0.875rem",
            fontWeight: 700,
            letterSpacing: 0,
          } as CSSProperties}
          type="submit"
        >
          <Save aria-hidden="true" className="size-4" />
          {isPending ? "Saving" : "Save Profile"}
        </ShinyButton>
      </div>
    </form>
  );
}
