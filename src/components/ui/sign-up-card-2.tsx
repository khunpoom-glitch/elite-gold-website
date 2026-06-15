"use client";

import { useState, type ChangeEvent, type FormEvent, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Eye,
  EyeClosed,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SignUpCardProps = {
  className?: string;
  onClose?: () => void;
  onLoginClick?: () => void;
  referralCode?: string;
  titleId?: string;
};

const defaultReferralCode = "EG000";
const defaultCountryCode = "TH";

const countryProfiles = [
  {
    code: "TH",
    flag: "🇹🇭",
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
    flag: "🇺🇸",
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
    flag: "🇬🇧",
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
    flag: "🇸🇬",
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
    flag: "🇲🇾",
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
    flag: "🇯🇵",
    label: "Japanese / Japan",
    dialCode: "+81",
    firstNamePlaceholder: "Haruto",
    lastNamePlaceholder: "Sato",
    nicknamePlaceholder: "Haru",
    phonePlaceholder: "090-1234-5678",
    emailPlaceholder: "member.jp@elitegold.com",
  },
] as const;

const requiredFields = [
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

const labelClassName = "grid gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/80";
const inputClassName =
  "elite-login-card-input h-11 w-full rounded-lg border border-white/10 bg-[#050505] text-sm text-white outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-white/28 focus:border-[#D4AF37]/60 focus:bg-[#050505] focus:ring-2 focus:ring-[#D4AF37]/18";
const iconClassName =
  "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#D4AF37]/70 transition-colors";
const chevronClassName =
  "pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/36";

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

function getNationalityOptionLabel(profile: (typeof countryProfiles)[number]) {
  return `${profile.flag} ${profile.label}`;
}

function getPhoneCountryOptionLabel(profile: (typeof countryProfiles)[number]) {
  return `${profile.flag} ${profile.dialCode} ${profile.code}`;
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

function getMissingFields(form: HTMLFormElement) {
  const formData = new FormData(form);

  return requiredFields
    .filter(({ name }) => {
      const value = formData.get(name);
      return typeof value !== "string" || !value.trim();
    })
    .map(({ label }) => label);
}

export function Component({
  className,
  onClose,
  onLoginClick,
  referralCode = "",
  titleId,
}: SignUpCardProps) {
  const [message, setMessage] = useState("");
  const [formAlert, setFormAlert] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [autoReferralCode] = useState(() => getInitialReferralCode(referralCode));
  const [selectedNationality, setSelectedNationality] = useState<string>(defaultCountryCode);
  const [selectedPhoneCountry, setSelectedPhoneCountry] = useState<string>(defaultCountryCode);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-320, 320], [5, -5]);
  const rotateY = useTransform(mouseX, [-320, 320], [-5, 5]);
  const nationalityProfile = getCountryProfile(selectedNationality);
  const phoneCountryProfile = getCountryProfile(selectedPhoneCountry);

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - rect.left - rect.width / 2);
    mouseY.set(event.clientY - rect.top - rect.height / 2);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  function handleNationalityChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextCountryCode = event.target.value;
    setSelectedNationality(nextCountryCode);
    setSelectedPhoneCountry(nextCountryCode);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const missingFields = getMissingFields(form);

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
    setIsLoading(true);
    window.setTimeout(() => {
      setIsLoading(false);
      setMessage("ระบบ Sign Up กำลังเตรียมเชื่อมต่อกับบัญชีสมาชิก");
    }, 900);
  }

  return (
    <motion.div
      animate={{ scale: 1, y: 0 }}
      className={cn("relative w-full max-w-[35rem]", className)}
      initial={{ scale: 0.96, y: 18 }}
      style={{ perspective: 1400 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="group relative"
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        <div aria-hidden="true" className="elite-login-card-border-light" />
        <div
          className={cn(
            "relative z-10 rounded-[1.55rem] border border-white/10 bg-[#030303] p-5 text-white shadow-[inset_0_1px_0_rgba(248,250,252,0.12),0_34px_90px_rgba(0,0,0,0.58)] sm:p-6",
            onClose
              ? "max-h-[calc(100svh-3rem)] overflow-y-auto overflow-x-hidden overscroll-contain"
              : "overflow-hidden",
          )}
        >
          {onClose ? (
            <button
              aria-label="Close"
              className="absolute right-3 top-3 z-20 inline-flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/42 transition-colors duration-200 hover:border-white/18 hover:bg-white/[0.07] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/35"
              onClick={onClose}
              type="button"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          ) : null}

          <div className="relative z-10">
            <div className="mb-5 text-center">
              <span className="elite-login-card-logo relative mx-auto grid place-items-center">
                <Image
                  alt=""
                  aria-hidden="true"
                  className="elite-login-card-logo-image object-contain"
                  height={1875}
                  src="/brand/elite-gold-mark.png"
                  width={1875}
                />
              </span>
              <h2 className="elite-display-type mt-4 text-xl font-extrabold uppercase tracking-[0.08em] text-white" id={titleId}>
                Create Your Account
              </h2>
              <p className="mt-2 text-xs font-light text-text-secondary">
                Join the Elite Gold Community and unlock exclusive member benefits.
              </p>
            </div>

            <form className="grid gap-3" noValidate onSubmit={handleSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={cn(labelClassName, "sm:col-span-2")}>
                  Nationality
                  <span className="relative">
                    <select
                      autoComplete="country-name"
                      className={cn(inputClassName, "appearance-none pl-3 pr-10")}
                      name="nationality"
                      onChange={handleNationalityChange}
                      required
                      value={selectedNationality}
                    >
                      {countryProfiles.map((profile) => (
                        <option key={profile.code} value={profile.code}>
                          {getNationalityOptionLabel(profile)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown aria-hidden="true" className={chevronClassName} />
                  </span>
                </label>

                <label className={labelClassName}>
                  First Name
                  <span className="relative">
                    <UserRound aria-hidden="true" className={iconClassName} />
                    <input
                      autoComplete="given-name"
                      className={cn(inputClassName, "pl-10 pr-3")}
                      name="firstName"
                      placeholder={nationalityProfile.firstNamePlaceholder}
                      required
                    />
                  </span>
                </label>

                <label className={labelClassName}>
                  Last Name
                  <span className="relative">
                    <UserRound aria-hidden="true" className={iconClassName} />
                    <input
                      autoComplete="family-name"
                      className={cn(inputClassName, "pl-10 pr-3")}
                      name="lastName"
                      placeholder={nationalityProfile.lastNamePlaceholder}
                      required
                    />
                  </span>
                </label>

                <label className={labelClassName}>
                  Nickname
                  <span className="relative">
                    <ShieldCheck aria-hidden="true" className={iconClassName} />
                    <input
                      className={cn(inputClassName, "pl-10 pr-3")}
                      name="nickname"
                      placeholder={nationalityProfile.nicknamePlaceholder}
                      required
                    />
                  </span>
                </label>

                <label className={labelClassName}>
                  Phone Number
                  <span className="grid grid-cols-[6.25rem_1fr] gap-2">
                    <span className="relative">
                      <select
                        aria-label="Phone country"
                        className={cn(inputClassName, "appearance-none px-3 pr-8")}
                        name="phoneCountry"
                        onChange={(event) => setSelectedPhoneCountry(event.target.value)}
                        required
                        value={selectedPhoneCountry}
                      >
                        {countryProfiles.map((profile) => (
                          <option key={profile.code} value={profile.code}>
                            {getPhoneCountryOptionLabel(profile)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown aria-hidden="true" className={chevronClassName} />
                    </span>
                    <span className="relative">
                      <Phone aria-hidden="true" className={iconClassName} />
                      <input
                        autoComplete="tel"
                        className={cn(inputClassName, "pl-10 pr-3")}
                        name="phone"
                        placeholder={phoneCountryProfile.phonePlaceholder}
                        required
                        type="tel"
                      />
                    </span>
                  </span>
                </label>

                <label className={cn(labelClassName, "sm:col-span-2")}>
                  Email
                  <span className="relative">
                    <Mail aria-hidden="true" className={iconClassName} />
                    <input
                      autoComplete="email"
                      className={cn(inputClassName, "pl-10 pr-3")}
                      name="email"
                      placeholder={nationalityProfile.emailPlaceholder}
                      required
                      type="email"
                    />
                  </span>
                </label>

                <label className={labelClassName}>
                  Password
                  <span className="relative">
                    <Lock aria-hidden="true" className={iconClassName} />
                    <input
                      autoComplete="new-password"
                      className={cn(inputClassName, "pl-10 pr-11")}
                      name="password"
                      placeholder="Password"
                      required
                      type={showPassword ? "text" : "password"}
                    />
                    <button
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 cursor-pointer text-white/40 transition-colors duration-300 hover:text-white"
                      onClick={() => setShowPassword((current) => !current)}
                      type="button"
                    >
                      {showPassword ? <Eye aria-hidden="true" className="size-4" /> : <EyeClosed aria-hidden="true" className="size-4" />}
                    </button>
                  </span>
                </label>

                <label className={labelClassName}>
                  Confirm Password
                  <span className="relative">
                    <Lock aria-hidden="true" className={iconClassName} />
                    <input
                      autoComplete="new-password"
                      className={cn(inputClassName, "pl-10 pr-11")}
                      name="confirmPassword"
                      placeholder="Confirm password"
                      required
                      type={showConfirmPassword ? "text" : "password"}
                    />
                    <button
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 cursor-pointer text-white/40 transition-colors duration-300 hover:text-white"
                      onClick={() => setShowConfirmPassword((current) => !current)}
                      type="button"
                    >
                      {showConfirmPassword ? <Eye aria-hidden="true" className="size-4" /> : <EyeClosed aria-hidden="true" className="size-4" />}
                    </button>
                  </span>
                </label>

                <label className={cn(labelClassName, "sm:col-span-2")}>
                  Referral Code
                  <span className="relative">
                    <ShieldCheck aria-hidden="true" className={iconClassName} />
                    <input
                      aria-readonly="true"
                      className={cn(inputClassName, "pl-10 pr-3 text-[#F6E3A3]/90")}
                      name="referralCode"
                      placeholder={defaultReferralCode}
                      readOnly
                      required
                      value={autoReferralCode}
                    />
                  </span>
                </label>
              </div>

              {formAlert ? (
                <div className="rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-2 text-sm text-[#F6E3A3]" role="alert">
                  {formAlert}
                </div>
              ) : null}

              <motion.button
                className="group/button relative mt-2 h-11 overflow-hidden rounded-lg bg-white font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isLoading}
                type="submit"
                whileHover={{ scale: 1.018 }}
                whileTap={{ scale: 0.985 }}
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.span
                      animate={{ opacity: 1 }}
                      className="relative flex h-full items-center justify-center"
                      exit={{ opacity: 0 }}
                      initial={{ opacity: 0 }}
                      key="loading"
                    >
                      <span className="size-4 rounded-full border-2 border-black/70 border-t-transparent animate-spin" />
                    </motion.span>
                  ) : (
                    <motion.span
                      animate={{ opacity: 1 }}
                      className="relative flex h-full items-center justify-center gap-2 text-sm"
                      exit={{ opacity: 0 }}
                      initial={{ opacity: 0 }}
                      key="text"
                    >
                      Sign Up
                      <ArrowRight aria-hidden="true" className="size-4 transition group-hover/button:translate-x-1" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <p className="pt-1 text-center text-xs text-white/58">
                Already have an account?{" "}
                {onLoginClick ? (
                  <button
                    className="font-semibold text-[#F6E3A3] transition hover:text-white"
                    onClick={onLoginClick}
                    type="button"
                  >
                    Login
                  </button>
                ) : (
                  <Link className="font-semibold text-[#F6E3A3] transition hover:text-white" href="/login">
                    Login
                  </Link>
                )}
              </p>

              {message ? (
                <p className="rounded-lg border border-[#D4AF37]/28 bg-[#D4AF37]/10 px-3 py-2 text-sm text-[#F6E3A3]">
                  {message}
                </p>
              ) : null}
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
