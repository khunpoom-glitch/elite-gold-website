"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Eye,
  EyeOff,
  Globe2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SignupFormProps = {
  referralCode?: string;
  variant?: "page" | "modal";
  onLoginClick?: () => void;
};

const defaultReferralCode = "EG000";
const defaultCountryCode = "TH";

const countryProfiles = [
  {
    code: "TH",
    label: "Thai / Thailand",
    dialCode: "+66",
    firstNamePlaceholder: "ชื่อ",
    lastNamePlaceholder: "นามสกุล",
    nicknamePlaceholder: "ชื่อเล่น",
    phonePlaceholder: "08x-xxx-xxxx",
    emailPlaceholder: "member@elitegold.com",
  },
  {
    code: "US",
    label: "American / United States",
    dialCode: "+1",
    firstNamePlaceholder: "John",
    lastNamePlaceholder: "Smith",
    nicknamePlaceholder: "Johnny",
    phonePlaceholder: "(555) 123-4567",
    emailPlaceholder: "member.us@elitegold.com",
  },
  {
    code: "GB",
    label: "British / United Kingdom",
    dialCode: "+44",
    firstNamePlaceholder: "Oliver",
    lastNamePlaceholder: "Smith",
    nicknamePlaceholder: "Ollie",
    phonePlaceholder: "07123 456789",
    emailPlaceholder: "member.uk@elitegold.com",
  },
  {
    code: "SG",
    label: "Singaporean / Singapore",
    dialCode: "+65",
    firstNamePlaceholder: "Wei Ming",
    lastNamePlaceholder: "Tan",
    nicknamePlaceholder: "Ming",
    phonePlaceholder: "8123 4567",
    emailPlaceholder: "member.sg@elitegold.com",
  },
  {
    code: "MY",
    label: "Malaysian / Malaysia",
    dialCode: "+60",
    firstNamePlaceholder: "Aiman",
    lastNamePlaceholder: "Rahman",
    nicknamePlaceholder: "Aiman",
    phonePlaceholder: "012-345 6789",
    emailPlaceholder: "member.my@elitegold.com",
  },
  {
    code: "JP",
    label: "Japanese / Japan",
    dialCode: "+81",
    firstNamePlaceholder: "Haruto",
    lastNamePlaceholder: "Sato",
    nicknamePlaceholder: "Haru",
    phonePlaceholder: "090-1234-5678",
    emailPlaceholder: "member.jp@elitegold.com",
  },
] as const;

const signupRequiredFields = [
  { name: "nationality", label: "Nationality" },
  { name: "firstName", label: "First Name" },
  { name: "lastName", label: "Last Name" },
  { name: "nickname", label: "Nickname" },
  { name: "phoneCountry", label: "Phone Country" },
  { name: "phone", label: "Phone Number" },
  { name: "email", label: "Email" },
  { name: "password", label: "Password" },
  { name: "confirmPassword", label: "Confirm Password" },
  { name: "referralCode", label: "Referral Code" },
];

function normalizeReferralCode(code?: string | null) {
  const trimmedCode = code?.trim();
  return trimmedCode ? trimmedCode.toUpperCase() : defaultReferralCode;
}

function getCountryProfile(countryCode: string) {
  return (
    countryProfiles.find((profile) => profile.code === countryCode) ??
    countryProfiles[0]
  );
}

function getInitialReferralCode(referralCode: string) {
  if (referralCode.trim()) {
    return normalizeReferralCode(referralCode);
  }

  if (typeof window === "undefined") {
    return defaultReferralCode;
  }

  const searchParams = new URLSearchParams(window.location.search);
  const referralFromLink =
    searchParams.get("ref") ??
    searchParams.get("refCode") ??
    searchParams.get("referral") ??
    searchParams.get("referralCode");

  return normalizeReferralCode(referralFromLink);
}

function getMissingFields(form: HTMLFormElement, fields: typeof signupRequiredFields) {
  const formData = new FormData(form);

  return fields
    .filter(({ name }) => {
      const value = formData.get(name);
      return typeof value !== "string" || !value.trim();
    })
    .map(({ label }) => label);
}

export function SignupForm({
  referralCode = "",
  variant = "page",
  onLoginClick,
}: SignupFormProps) {
  const [message, setMessage] = useState("");
  const [formAlert, setFormAlert] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [autoReferralCode] = useState(() => getInitialReferralCode(referralCode));
  const [selectedNationality, setSelectedNationality] =
    useState<string>(defaultCountryCode);
  const [selectedPhoneCountry, setSelectedPhoneCountry] =
    useState<string>(defaultCountryCode);
  const isModal = variant === "modal";
  const nationalityProfile = getCountryProfile(selectedNationality);
  const phoneCountryProfile = getCountryProfile(selectedPhoneCountry);
  const iconClassName =
    "pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-soft-gold";
  const modalFullSpanClassName = "min-[560px]:col-span-2";

  function handleNationalityChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextCountryCode = event.target.value;
    setSelectedNationality(nextCountryCode);
    setSelectedPhoneCountry(nextCountryCode);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const missingFields = getMissingFields(form, signupRequiredFields);

    if (missingFields.length > 0) {
      setMessage("");
      setFormAlert(`กรุณากรอกข้อมูลให้ครบก่อนสมัคร: ${missingFields.join(", ")}`);
      return;
    }

    const formData = new FormData(form);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setMessage("");
      setFormAlert("Password และ Confirm Password ต้องตรงกัน");
      return;
    }

    setFormAlert("");
    setMessage(
      "Sign Up placeholder: ระบบสมัครสมาชิกจริงจะถูกต่อใน Phase ถัดไป",
    );
  }

  return (
    <form
      className={cn(
        "mx-auto w-full max-w-2xl rounded-lg border border-border bg-surface/86 p-6",
        isModal &&
          "auth-form-shell max-w-none rounded-2xl border-transparent bg-transparent p-0 shadow-none",
      )}
      noValidate
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4 min-[560px]:grid-cols-2">
        <label className={cn("grid gap-2 text-sm font-medium text-white", modalFullSpanClassName)}>
          Nationality
          <span className="relative">
            <Globe2 aria-hidden="true" className={iconClassName} />
            <select
              autoComplete="country-name"
              className="auth-select-control pl-11 pr-12"
              name="nationality"
              onChange={handleNationalityChange}
              required
              value={selectedNationality}
            >
              {countryProfiles.map((profile) => (
                <option key={profile.code} value={profile.code}>
                  {profile.label}
                </option>
              ))}
            </select>
            <ChevronDown aria-hidden="true" className="auth-select-chevron" />
          </span>
        </label>
        <label className="grid gap-2 text-sm font-medium text-white">
          First Name
          <span className="relative">
            <UserRound aria-hidden="true" className={iconClassName} />
            <Input
              autoComplete="given-name"
              className="pl-11"
              name="firstName"
              placeholder={nationalityProfile.firstNamePlaceholder}
              required
            />
          </span>
        </label>
        <label className="grid gap-2 text-sm font-medium text-white">
          Last Name
          <span className="relative">
            <UserRound aria-hidden="true" className={iconClassName} />
            <Input
              autoComplete="family-name"
              className="pl-11"
              name="lastName"
              placeholder={nationalityProfile.lastNamePlaceholder}
              required
            />
          </span>
        </label>
        <label className="grid gap-2 text-sm font-medium text-white">
          Nickname
          <span className="relative">
            <ShieldCheck aria-hidden="true" className={iconClassName} />
            <Input
              className="pl-11"
              name="nickname"
              placeholder={nationalityProfile.nicknamePlaceholder}
              required
            />
          </span>
        </label>
        <label className="grid gap-2 text-sm font-medium text-white">
          Phone Number
          <span className="relative">
            <Phone aria-hidden="true" className={iconClassName} />
            <select
              aria-label="Phone country"
              className="auth-phone-country-select"
              name="phoneCountry"
              onChange={(event) => setSelectedPhoneCountry(event.target.value)}
              required
              value={selectedPhoneCountry}
            >
              {countryProfiles.map((profile) => (
                <option key={profile.code} value={profile.code}>
                  {profile.dialCode} {profile.code}
                </option>
              ))}
            </select>
            <ChevronDown aria-hidden="true" className="auth-phone-chevron" />
            <Input
              autoComplete="tel"
              className="auth-phone-input"
              name="phone"
              placeholder={phoneCountryProfile.phonePlaceholder}
              required
              type="tel"
            />
          </span>
        </label>
        <label className={cn("grid gap-2 text-sm font-medium text-white", modalFullSpanClassName)}>
          Email
          <span className="relative">
            <Mail aria-hidden="true" className={iconClassName} />
            <Input
              autoComplete="email"
              className="pl-11"
              name="email"
              placeholder={nationalityProfile.emailPlaceholder}
              required
              type="email"
            />
          </span>
        </label>
        <label className="grid gap-2 text-sm font-medium text-white">
          Password
          <span className="relative">
            <Lock aria-hidden="true" className={iconClassName} />
            <Input
              autoComplete="new-password"
              className="pl-11 pr-12"
              name="password"
              placeholder="••••••••"
              required
              type={showPassword ? "text" : "password"}
            />
            <button
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="auth-password-toggle"
              onClick={() => setShowPassword((current) => !current)}
              type="button"
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" className="h-4 w-4" />
              ) : (
                <Eye aria-hidden="true" className="h-4 w-4" />
              )}
            </button>
          </span>
        </label>
        <label className="grid gap-2 text-sm font-medium text-white">
          Confirm Password
          <span className="relative">
            <Lock aria-hidden="true" className={iconClassName} />
            <Input
              autoComplete="new-password"
              className="pl-11 pr-12"
              name="confirmPassword"
              placeholder="••••••••"
              required
              type={showConfirmPassword ? "text" : "password"}
            />
            <button
              aria-label={
                showConfirmPassword ? "Hide confirm password" : "Show confirm password"
              }
              className="auth-password-toggle"
              onClick={() => setShowConfirmPassword((current) => !current)}
              type="button"
            >
              {showConfirmPassword ? (
                <EyeOff aria-hidden="true" className="h-4 w-4" />
              ) : (
                <Eye aria-hidden="true" className="h-4 w-4" />
              )}
            </button>
          </span>
        </label>
        <label className={cn("grid gap-2 text-sm font-medium text-white", modalFullSpanClassName)}>
          Referral Code
          <span className="relative">
            <ShieldCheck aria-hidden="true" className={iconClassName} />
            <Input
              aria-readonly="true"
              className="auth-referral-input pl-11"
              name="referralCode"
              placeholder={defaultReferralCode}
              readOnly
              required
              value={autoReferralCode}
            />
          </span>
        </label>
      </div>
      <p className="auth-referral-help mt-3 text-xs leading-6 text-text-muted">
        Referral Code จะถูกล็อกจากลิงก์สมัครของผู้แนะนำ เช่น /signup?ref=EG000
      </p>
      {formAlert ? (
        <div className="auth-validation-popup mt-4" role="alert">
          <p className="elite-display-type text-xs uppercase text-champagne">
            Required Fields
          </p>
          <p className="mt-1 text-sm leading-6 text-white">{formAlert}</p>
        </div>
      ) : null}
      <Button className="elite-display-type mt-5 w-full uppercase" type="submit">
        Sign Up
      </Button>
      <p className="auth-signup-switch-copy mt-8 text-center text-sm text-text-secondary sm:mt-9">
        Already have an account?{" "}
        {onLoginClick ? (
          <button
            className="elite-display-type font-semibold uppercase text-soft-gold transition hover:text-white"
            onClick={onLoginClick}
            type="button"
          >
            Login
          </button>
        ) : (
          <Link
            className="elite-display-type font-semibold uppercase text-soft-gold hover:text-white"
            href="/login"
          >
            Login
          </Link>
        )}
      </p>
      {message ? (
        <p className="mt-4 rounded-md border border-gold/25 bg-gold/10 px-3 py-2 text-sm text-soft-gold">
          {message}
        </p>
      ) : null}
    </form>
  );
}
