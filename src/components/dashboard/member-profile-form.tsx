"use client";

import { useActionState, type CSSProperties } from "react";
import { AlertTriangle, CheckCircle2, LoaderCircle, Mail, Save, Send } from "lucide-react";
import { requestEmailChangeAction, updateMemberProfileAction } from "@/app/auth/actions";
import { Input } from "@/components/ui/input";
import { ShinyButton } from "@/components/ui/shiny-button";
import { initialAuthActionState } from "@/lib/auth/action-state";
import type { MemberProfile, PendingEmailChangeRequest } from "@/lib/member/profile";

type MemberProfileFormProps = {
  isMemberActive?: boolean;
  pendingEmailChange?: PendingEmailChangeRequest | null;
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

function formatPendingDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "short",
    timeZone: "Asia/Bangkok",
    year: "numeric",
  }).format(date);
}

export function MemberProfileForm({
  isMemberActive = true,
  pendingEmailChange = null,
  profile,
}: MemberProfileFormProps) {
  const [profileState, profileFormAction, isProfilePending] = useActionState(
    updateMemberProfileAction,
    initialAuthActionState,
  );
  const [emailState, emailFormAction, isEmailPending] = useActionState(
    requestEmailChangeAction,
    initialAuthActionState,
  );
  const pendingEmailChangeDate = pendingEmailChange
    ? formatPendingDate(pendingEmailChange.requestedAt)
    : "";

  return (
    <div className="grid gap-6">
      <form action={profileFormAction} className="grid gap-5" noValidate>
        <div className="grid gap-3">
          <div className="flex flex-col gap-1 border-b border-white/8 pb-3">
            <p className="text-xs font-bold uppercase text-white/38">Personal Information</p>
            <p className="text-sm leading-6 text-white/48">Names and public-facing member identity.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-white/76">
              First Name
              <Input
                autoComplete="given-name"
                defaultValue={profile.firstName}
                name="firstName"
                required
              />
              <FieldError message={profileState.fieldErrors?.firstName} />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-white/76">
              Last Name
              <Input
                autoComplete="family-name"
                defaultValue={profile.lastName}
                name="lastName"
                required
              />
              <FieldError message={profileState.fieldErrors?.lastName} />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-white/76">
              Nickname
              <Input
                autoComplete="nickname"
                defaultValue={profile.nickname}
                name="nickname"
                required
              />
              <FieldError message={profileState.fieldErrors?.nickname} />
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
              <FieldError message={profileState.fieldErrors?.nationality} />
            </label>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="flex flex-col gap-1 border-b border-white/8 pb-3">
            <p className="text-xs font-bold uppercase text-white/38">Contact Details</p>
            <p className="text-sm leading-6 text-white/48">Phone fields are editable and stored in the member profile audit history.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-white/76">
              Phone Country
              <Input
                autoComplete="tel-country-code"
                defaultValue={profile.phoneCountry}
                name="phoneCountry"
                placeholder="TH"
                required
              />
              <FieldError message={profileState.fieldErrors?.phoneCountry} />
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
              <FieldError message={profileState.fieldErrors?.phone} />
            </label>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="flex flex-col gap-1 border-b border-white/8 pb-3">
            <p className="text-xs font-bold uppercase text-white/38">Account Records</p>
            <p className="text-sm leading-6 text-white/48">Email and access records are controlled by verification and signup rules.</p>
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

            <label className="grid gap-2 text-sm font-semibold text-white/54 md:col-span-2">
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
          </div>
        </div>

        {profileState.status === "error" ? (
          <div className="member-status-warning flex items-start gap-2 rounded-2xl border px-3 py-2 text-sm" role="alert">
            <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {profileState.message}
          </div>
        ) : null}

        {profileState.status === "success" ? (
          <div className="member-status-success flex items-start gap-2 rounded-2xl border px-3 py-2 text-sm" role="status">
            <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {profileState.message}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-6 text-white/42">
            Saved changes update your member profile only. Membership, billing, and access attribution stay locked for later phases.
          </p>
          <ShinyButton
            className="h-10 gap-2 rounded-xl px-4 py-2 text-sm font-bold sm:w-auto"
            disabled={isProfilePending}
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
            {isProfilePending ? (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <Save aria-hidden="true" className="size-4" />
            )}
            {isProfilePending ? "Saving..." : "Save Profile"}
          </ShinyButton>
        </div>
      </form>

      <form action={emailFormAction} className="grid gap-4 rounded-2xl border border-white/8 bg-black/24 p-4" noValidate>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase text-white/38">
              <Mail aria-hidden="true" className="size-3.5" />
              Account Security
            </p>
            <h3 className="mt-2 text-lg font-semibold text-white">Change email</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
              Your current email remains active until the new address is verified from its inbox.
            </p>
          </div>
          {pendingEmailChange ? (
            <span className="rounded-xl border border-[#D4AF37]/25 bg-[#D4AF37]/10 px-3 py-2 text-xs font-semibold leading-5 text-[#F6E3A3]">
              Pending: {pendingEmailChange.newEmail}
              {pendingEmailChangeDate ? (
                <span className="block font-medium text-white/46">
                  Requested {pendingEmailChangeDate} GMT+7
                </span>
              ) : null}
            </span>
          ) : null}
        </div>

        <label className="grid gap-2 text-sm font-semibold text-white/76">
          New Email
          <Input
            autoComplete="email"
            name="email"
            placeholder="new.email@example.com"
            type="email"
          />
          <FieldError message={emailState.fieldErrors?.email} />
        </label>

        {emailState.status === "error" ? (
          <div className="member-status-warning flex items-start gap-2 rounded-2xl border px-3 py-2 text-sm" role="alert">
            <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {emailState.message}
          </div>
        ) : null}

        {emailState.status === "success" ? (
          <div className="member-status-success flex items-start gap-2 rounded-2xl border px-3 py-2 text-sm" role="status">
            <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {emailState.message}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-6 text-white/42">
            For security, Elite Gold sends a confirmation email before this change is applied to your member record.
          </p>
          <ShinyButton
            className="h-10 gap-2 rounded-xl px-4 py-2 text-sm font-bold sm:w-auto"
            disabled={isEmailPending}
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
            {isEmailPending ? (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <Send aria-hidden="true" className="size-4" />
            )}
            {isEmailPending ? "Sending..." : "Send Verification"}
          </ShinyButton>
        </div>
      </form>
    </div>
  );
}
