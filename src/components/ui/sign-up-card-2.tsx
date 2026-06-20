"use client";

import { useActionState, useEffect, useMemo, useState, type FocusEvent, type KeyboardEvent, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import {
  AlertTriangle,
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
import { completeGoogleSignupAction, signupWithPasswordAction } from "@/app/auth/actions";
import { GoogleLogo } from "@/components/ui/google-logo";
import { initialAuthActionState } from "@/lib/auth/action-state";
import type { GoogleSignupProfile } from "@/lib/member/profile";
import { cn } from "@/lib/utils";

type SignUpCardProps = {
  className?: string;
  googleSignupProfile?: GoogleSignupProfile;
  notice?: string;
  onClose?: () => void;
  onLoginClick?: () => void;
  accessCode?: string;
  titleId?: string;
};

const accessCodePlaceholder = "Access code from signup link";
const defaultCountryCode = "TH";

type CountryProfile = {
  code: string;
  flag: string;
  label: string;
  firstNamePlaceholder: string;
  lastNamePlaceholder: string;
  nicknamePlaceholder: string;
  phonePlaceholder: string;
  emailPlaceholder: string;
};

type PhoneCountryProfile = CountryProfile & {
  dialCode: string;
};

const countryDisplayNames = new Intl.DisplayNames(["en"], { type: "region" });
const priorityCountryCodes = ["TH", "US", "GB", "SG", "MY", "JP"] as const;
const internationalCountryCodes = [
  "AE",
  "AL",
  "AM",
  "AR",
  "AT",
  "AU",
  "AZ",
  "BD",
  "BE",
  "BG",
  "BH",
  "BN",
  "BO",
  "BR",
  "BT",
  "CA",
  "CH",
  "CL",
  "CN",
  "CO",
  "CR",
  "CY",
  "CZ",
  "DE",
  "DK",
  "DO",
  "DZ",
  "EC",
  "EE",
  "EG",
  "ES",
  "ET",
  "FI",
  "FJ",
  "FR",
  "GE",
  "GH",
  "GR",
  "HK",
  "HR",
  "HU",
  "ID",
  "IE",
  "IL",
  "IN",
  "IQ",
  "IR",
  "IS",
  "IT",
  "JO",
  "KE",
  "KH",
  "KR",
  "KW",
  "KZ",
  "LA",
  "LB",
  "LK",
  "LT",
  "LU",
  "LV",
  "MA",
  "MM",
  "MN",
  "MO",
  "MT",
  "MU",
  "MV",
  "MX",
  "NG",
  "NL",
  "NO",
  "NP",
  "NZ",
  "OM",
  "PA",
  "PE",
  "PH",
  "PK",
  "PL",
  "PT",
  "PY",
  "QA",
  "RO",
  "RS",
  "RU",
  "RW",
  "SA",
  "SC",
  "SE",
  "SI",
  "SK",
  "TN",
  "TR",
  "TW",
  "TZ",
  "UA",
  "UG",
  "UY",
  "UZ",
  "VE",
  "VN",
  "ZA",
] as const;
const countryCodes = [...priorityCountryCodes, ...internationalCountryCodes] as const;
const countryPlaceholderOverrides: Record<string, Partial<CountryProfile>> = {
  GB: {
    firstNamePlaceholder: "Oliver",
    lastNamePlaceholder: "Smith",
    nicknamePlaceholder: "Ollie",
    phonePlaceholder: "07123 456789",
    emailPlaceholder: "member.uk@elitegold.com",
  },
  JP: {
    firstNamePlaceholder: "Haruto",
    lastNamePlaceholder: "Sato",
    nicknamePlaceholder: "Haru",
    phonePlaceholder: "090-1234-5678",
    emailPlaceholder: "member.jp@elitegold.com",
  },
  MY: {
    firstNamePlaceholder: "Aiman",
    lastNamePlaceholder: "Rahman",
    nicknamePlaceholder: "Aiman",
    phonePlaceholder: "012-345 6789",
    emailPlaceholder: "member.my@elitegold.com",
  },
  SG: {
    firstNamePlaceholder: "Wei Ming",
    lastNamePlaceholder: "Tan",
    nicknamePlaceholder: "Ming",
    phonePlaceholder: "8123 4567",
    emailPlaceholder: "member.sg@elitegold.com",
  },
  TH: {
    firstNamePlaceholder: "ชื่อ",
    lastNamePlaceholder: "นามสกุล",
    nicknamePlaceholder: "ชื่อเล่น",
    phonePlaceholder: "08x-xxx-xxxx",
    emailPlaceholder: "member@elitegold.com",
  },
  US: {
    firstNamePlaceholder: "John",
    lastNamePlaceholder: "Smith",
    nicknamePlaceholder: "Johnny",
    phonePlaceholder: "(555) 123-4567",
    emailPlaceholder: "member.us@elitegold.com",
  },
};
const callingCodeByCountryCode: Record<string, string> = {
  AE: "+971",
  AL: "+355",
  AM: "+374",
  AR: "+54",
  AT: "+43",
  AU: "+61",
  AZ: "+994",
  BD: "+880",
  BE: "+32",
  BG: "+359",
  BH: "+973",
  BN: "+673",
  BO: "+591",
  BR: "+55",
  BT: "+975",
  CA: "+1",
  CH: "+41",
  CL: "+56",
  CN: "+86",
  CO: "+57",
  CR: "+506",
  CY: "+357",
  CZ: "+420",
  DE: "+49",
  DK: "+45",
  DO: "+1",
  DZ: "+213",
  EC: "+593",
  EE: "+372",
  EG: "+20",
  ES: "+34",
  ET: "+251",
  FI: "+358",
  FJ: "+679",
  FR: "+33",
  GB: "+44",
  GE: "+995",
  GH: "+233",
  GR: "+30",
  HK: "+852",
  HR: "+385",
  HU: "+36",
  ID: "+62",
  IE: "+353",
  IL: "+972",
  IN: "+91",
  IQ: "+964",
  IR: "+98",
  IS: "+354",
  IT: "+39",
  JO: "+962",
  JP: "+81",
  KE: "+254",
  KH: "+855",
  KR: "+82",
  KW: "+965",
  KZ: "+7",
  LA: "+856",
  LB: "+961",
  LK: "+94",
  LT: "+370",
  LU: "+352",
  LV: "+371",
  MA: "+212",
  MM: "+95",
  MN: "+976",
  MO: "+853",
  MT: "+356",
  MU: "+230",
  MV: "+960",
  MX: "+52",
  MY: "+60",
  NG: "+234",
  NL: "+31",
  NO: "+47",
  NP: "+977",
  NZ: "+64",
  OM: "+968",
  PA: "+507",
  PE: "+51",
  PH: "+63",
  PK: "+92",
  PL: "+48",
  PT: "+351",
  PY: "+595",
  QA: "+974",
  RO: "+40",
  RS: "+381",
  RU: "+7",
  RW: "+250",
  SA: "+966",
  SC: "+248",
  SE: "+46",
  SG: "+65",
  SI: "+386",
  SK: "+421",
  TH: "+66",
  TN: "+216",
  TR: "+90",
  TW: "+886",
  TZ: "+255",
  UA: "+380",
  UG: "+256",
  US: "+1",
  UY: "+598",
  UZ: "+998",
  VE: "+58",
  VN: "+84",
  ZA: "+27",
};

function getFlagEmoji(countryCode: string) {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0)),
    );
}

function getCountryLabel(countryCode: string) {
  return countryDisplayNames.of(countryCode) ?? countryCode;
}

function createCountryProfile(countryCode: string): CountryProfile {
  const lowerCode = countryCode.toLowerCase();

  return {
    code: countryCode,
    flag: getFlagEmoji(countryCode),
    label: getCountryLabel(countryCode),
    firstNamePlaceholder: "First name",
    lastNamePlaceholder: "Last name",
    nicknamePlaceholder: "Nickname",
    phonePlaceholder: "Phone number",
    emailPlaceholder: `member.${lowerCode}@elitegold.com`,
    ...countryPlaceholderOverrides[countryCode],
  };
}

const countryProfiles = countryCodes.map(createCountryProfile);
const phoneCountryProfiles = countryProfiles.flatMap((profile) => {
  const dialCode = callingCodeByCountryCode[profile.code];

  return dialCode ? [{ ...profile, dialCode }] : [];
});

const labelClassName = "grid gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/80";
const inputClassName =
  "elite-login-card-input h-11 w-full rounded-lg border border-white/10 bg-[#050505] text-sm text-white outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-white/28 focus:border-[#D4AF37]/60 focus:bg-[#050505] focus:ring-2 focus:ring-[#D4AF37]/18";
const iconClassName =
  "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#D4AF37]/70 transition-colors";
const chevronClassName =
  "pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/36";
const helperTextClassName = "text-[0.68rem] normal-case tracking-normal text-[#F6E3A3]/82";

type SearchableCountrySelectProps<T extends CountryProfile> = {
  ariaLabel?: string;
  autoComplete?: string;
  dropdownClassName?: string;
  getOptionLabel: (profile: T) => string;
  getSearchText?: (profile: T) => string;
  inputExtraClassName?: string;
  invalid?: boolean;
  name: string;
  onChange: (value: string) => void;
  options: T[];
  value: string;
};

function SearchableCountrySelect<T extends CountryProfile>({
  ariaLabel,
  autoComplete,
  dropdownClassName,
  getOptionLabel,
  getSearchText,
  inputExtraClassName,
  invalid,
  name,
  onChange,
  options,
  value,
}: SearchableCountrySelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedOption = options.find((option) => option.code === value) ?? options[0];
  const selectedLabel = selectedOption ? getOptionLabel(selectedOption) : "";
  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions = normalizedQuery
    ? options.filter((option) => {
        const searchText = getSearchText?.(option) ?? getOptionLabel(option);

        return searchText.toLowerCase().includes(normalizedQuery);
      })
    : options;
  const listboxId = `${name}-listbox`;

  function openList() {
    setIsOpen(true);
    setQuery("");
  }

  function closeList() {
    setIsOpen(false);
    setQuery("");
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget as Node | null;

    if (!nextTarget || !event.currentTarget.contains(nextTarget)) {
      closeList();
    }
  }

  function handleSelect(option: T) {
    onChange(option.code);
    closeList();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      closeList();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      return;
    }

    if (event.key === "Enter" && isOpen && filteredOptions[0]) {
      event.preventDefault();
      handleSelect(filteredOptions[0]);
    }
  }

  return (
    <div className="relative" onBlur={handleBlur}>
      <input name={name} type="hidden" value={value} />
      <input
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-invalid={invalid}
        aria-label={ariaLabel}
        autoComplete={autoComplete}
        className={cn(inputClassName, "cursor-text truncate pr-10", inputExtraClassName)}
        onChange={(event) => {
          setIsOpen(true);
          setQuery(event.target.value);
        }}
        onClick={openList}
        onFocus={openList}
        onKeyDown={handleKeyDown}
        placeholder={selectedLabel || "Search"}
        role="combobox"
        type="text"
        value={isOpen ? query : selectedLabel}
      />
      <ChevronDown
        aria-hidden="true"
        className={cn(
          chevronClassName,
          "transition-transform duration-200",
          isOpen ? "rotate-180" : null,
        )}
      />

      {isOpen ? (
        <div
          className={cn(
            "absolute left-0 top-[calc(100%+0.4rem)] z-50 max-h-60 w-full overflow-y-auto rounded-xl border border-white/12 bg-[#0A0A0A]/96 p-1.5 shadow-[0_18px_48px_rgba(0,0,0,0.48),0_0_24px_rgba(212,175,55,0.12)] backdrop-blur-xl",
            dropdownClassName,
          )}
          id={listboxId}
          role="listbox"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => {
              const isSelected = option.code === value;

              return (
                <button
                  aria-selected={isSelected}
                  className={cn(
                    "flex min-h-9 w-full items-center rounded-lg px-3 text-left text-xs font-medium normal-case tracking-normal text-white/76 transition hover:bg-white/[0.07] hover:text-white",
                    isSelected ? "bg-[#D4AF37]/18 text-[#F6E3A3]" : null,
                  )}
                  key={option.code}
                  onClick={() => handleSelect(option)}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    handleSelect(option);
                  }}
                  role="option"
                  type="button"
                >
                  <span className="truncate">{getOptionLabel(option)}</span>
                </button>
              );
            })
          ) : (
            <div className="px-3 py-3 text-xs normal-case tracking-normal text-white/46">
              No country found
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function normalizeAccessCode(code?: string | null) {
  const trimmedCode = code?.trim();
  return trimmedCode ? trimmedCode.toUpperCase() : "";
}

function getCountryProfile(countryCode: string) {
  return (
    countryProfiles.find((profile) => profile.code === countryCode) ??
    countryProfiles[0]
  );
}

function getNationalityOptionLabel(profile: CountryProfile) {
  return `${profile.flag} ${profile.label}`;
}

function getCountrySearchText(profile: CountryProfile) {
  return `${profile.code} ${profile.label}`;
}

function getPhoneCountryOptionLabel(profile: PhoneCountryProfile) {
  return `${profile.flag} ${profile.dialCode} ${profile.code}`;
}

function getPhoneCountrySearchText(profile: PhoneCountryProfile) {
  return `${profile.code} ${profile.label} ${profile.dialCode}`;
}

function getPhoneCountryProfile(countryCode: string) {
  return (
    phoneCountryProfiles.find((profile) => profile.code === countryCode) ??
    phoneCountryProfiles[0]
  );
}

function getInitialAccessCode(accessCode: string) {
  if (accessCode.trim()) {
    return normalizeAccessCode(accessCode);
  }

  if (typeof window === "undefined") {
    return "";
  }

  const searchParams = new URLSearchParams(window.location.search);
  const referralFromLink =
    searchParams.get("ref") ??
    searchParams.get("refCode") ??
    searchParams.get("referral") ??
    searchParams.get("referralCode");

  return normalizeAccessCode(referralFromLink);
}

function getInitialNextPath() {
  if (typeof window === "undefined") {
    return "/dashboard";
  }

  const searchParams = new URLSearchParams(window.location.search);

  return searchParams.get("next") ?? "/dashboard";
}

function getReadableNotice(notice?: string) {
  if (notice === "google_profile_required") {
    return "ยังไม่พบข้อมูลสมาชิกของบัญชี Google นี้ กรุณากรอกข้อมูลสมัครให้ครบก่อนเข้า Dashboard";
  }

  return null;
}

export function Component({
  className,
  googleSignupProfile,
  notice,
  onClose,
  onLoginClick,
  accessCode = "",
  titleId,
}: SignUpCardProps) {
  const isGoogleSignup = Boolean(googleSignupProfile?.email);
  const signupAction = isGoogleSignup
    ? completeGoogleSignupAction
    : signupWithPasswordAction;
  const [state, formAction, isPending] = useActionState(
    signupAction,
    initialAuthActionState,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleRedirecting, setIsGoogleRedirecting] = useState(false);
  const [isGoogleProfileSyncing, setIsGoogleProfileSyncing] = useState(isGoogleSignup);
  const [dismissedValidationErrorKey, setDismissedValidationErrorKey] = useState<string | null>(null);
  const autoAccessCode = useMemo(() => getInitialAccessCode(accessCode), [accessCode]);
  const [selectedNationality, setSelectedNationality] = useState<string>(defaultCountryCode);
  const [selectedPhoneCountry, setSelectedPhoneCountry] = useState<string>(defaultCountryCode);
  const [nextPath] = useState(getInitialNextPath);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-320, 320], [5, -5]);
  const rotateY = useTransform(mouseX, [-320, 320], [-5, 5]);
  const nationalityProfile = getCountryProfile(selectedNationality);
  const phoneCountryProfile = getPhoneCountryProfile(selectedPhoneCountry);
  const readableNotice = getReadableNotice(notice);
  const validationPopupKey =
    state.status === "error" && state.fieldErrors && Object.keys(state.fieldErrors).length > 0
      ? `${state.message}:${Object.keys(state.fieldErrors).sort().join("|")}`
      : null;
  const isValidationPopupVisible = Boolean(
    validationPopupKey && dismissedValidationErrorKey !== validationPopupKey,
  );
  const validationPopupTitle = state.fieldErrors?.signupAccessCode
    ? "ตรวจสอบ Access Code"
    : "กรุณากรอกข้อมูลให้ครบ";
  const googleSyncedInputClassName =
    isGoogleSignup && isGoogleProfileSyncing
      ? "animate-pulse shadow-[0_0_0_1px_rgba(212,175,55,0.18)]"
      : null;

  useEffect(() => {
    if (state.status === "success" && state.redirectTo) {
      window.location.assign(state.redirectTo);
    }
  }, [state]);

  useEffect(() => {
    if (!isGoogleSignup) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsGoogleProfileSyncing(false);
    }, 950);

    return () => window.clearTimeout(timeoutId);
  }, [googleSignupProfile?.email, isGoogleSignup]);

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - rect.left - rect.width / 2);
    mouseY.set(event.clientY - rect.top - rect.height / 2);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  function handleNationalityChange(nextCountryCode: string) {
    setSelectedNationality(nextCountryCode);

    if (callingCodeByCountryCode[nextCountryCode]) {
      setSelectedPhoneCountry(nextCountryCode);
    }
  }

  function getFieldError(name: string) {
    return state.fieldErrors?.[name];
  }

  function getInputClassName(name: string, extraClassName?: string) {
    return cn(
      inputClassName,
      extraClassName,
      getFieldError(name) ? "border-[#F6E3A3]/70 ring-2 ring-[#D4AF37]/20" : null,
    );
  }

  function handleGoogleSignup() {
    setIsGoogleRedirecting(true);

    const searchParams = new URLSearchParams({
      intent: "signup",
      next: nextPath,
    });

    if (autoAccessCode) {
      searchParams.set("ref", autoAccessCode);
    }

    window.setTimeout(() => {
      window.location.assign(`/auth/google?${searchParams.toString()}`);
    }, 120);
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
            <AnimatePresence>
              {isValidationPopupVisible && state.status === "error" && state.fieldErrors ? (
                <motion.div
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  aria-modal="false"
                  className="fixed inset-x-4 top-4 z-[100] mx-auto max-w-sm rounded-xl border border-[#D4AF37]/35 bg-[#070707]/95 p-4 text-white shadow-[0_24px_70px_rgba(0,0,0,0.45),0_0_32px_rgba(212,175,55,0.18)] backdrop-blur-xl"
                  exit={{ opacity: 0, y: -12, scale: 0.98 }}
                  initial={{ opacity: 0, y: -12, scale: 0.98 }}
                  role="alertdialog"
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/12 text-[#F6E3A3]">
                      <AlertTriangle aria-hidden="true" className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#F6E3A3]">{validationPopupTitle}</p>
                      <p className="mt-1 text-xs leading-5 text-white/70">{state.message}</p>
                    </div>
                    <button
                      aria-label="Close validation notice"
                      className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-white/46 transition hover:bg-white/8 hover:text-white"
                      onClick={() => setDismissedValidationErrorKey(validationPopupKey)}
                      type="button"
                    >
                      <X aria-hidden="true" className="size-4" />
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

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

            {readableNotice ? (
              <div className="mb-3 rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-2 text-xs leading-5 text-[#F6E3A3]" role="status">
                {readableNotice}
              </div>
            ) : null}

            {isGoogleSignup ? (
              <div className="mb-3 overflow-hidden rounded-lg border border-[#D4AF37]/24 bg-[#D4AF37]/10 px-3 py-2 text-xs leading-5 text-white/72" role="status" aria-live="polite">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 font-semibold text-[#F6E3A3]">
                    <GoogleLogo />
                    Google account connected
                  </span>
                  <AnimatePresence mode="wait">
                    {isGoogleProfileSyncing ? (
                      <motion.span
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#D4AF37]/25 bg-black/30 px-2 py-0.5 text-[0.66rem] font-semibold uppercase tracking-normal text-[#F6E3A3]"
                        exit={{ opacity: 0, x: 6 }}
                        initial={{ opacity: 0, x: 6 }}
                        key="syncing"
                      >
                        <span className="size-2.5 rounded-full border-2 border-[#F6E3A3]/75 border-t-transparent animate-spin" />
                        Syncing
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </div>
                <span className="mt-1 block break-words">{googleSignupProfile?.email}</span>
                <AnimatePresence>
                  {isGoogleProfileSyncing ? (
                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 grid gap-1.5"
                      exit={{ opacity: 0, y: -4 }}
                      initial={{ opacity: 0, y: -4 }}
                    >
                      <span className="h-1.5 w-2/3 overflow-hidden rounded-full bg-white/10">
                        <motion.span
                          animate={{ x: ["-45%", "145%"] }}
                          className="block h-full w-1/2 rounded-full bg-gradient-to-r from-transparent via-[#F6E3A3]/70 to-transparent"
                          transition={{ duration: 1.05, ease: "easeInOut", repeat: Infinity }}
                        />
                      </span>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <motion.button
                  aria-busy={isGoogleRedirecting}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] text-[0.78rem] font-normal leading-none text-white/82 transition hover:border-[#D4AF37]/35 hover:bg-white/[0.07] hover:text-white disabled:cursor-wait disabled:opacity-80"
                  disabled={isGoogleRedirecting}
                  onClick={handleGoogleSignup}
                  style={{ fontSize: "0.78rem", lineHeight: 1 }}
                  type="button"
                  whileHover={isGoogleRedirecting ? undefined : { scale: 1.018 }}
                  whileTap={{ scale: 0.985 }}
                >
                  <AnimatePresence mode="wait">
                    {isGoogleRedirecting ? (
                      <motion.span
                        animate={{ opacity: 1 }}
                        className="inline-flex items-center gap-2"
                        exit={{ opacity: 0 }}
                        initial={{ opacity: 0 }}
                        key="google-loading"
                      >
                        <span className="size-4 rounded-full border-2 border-[#F6E3A3]/80 border-t-transparent animate-spin" />
                        Connecting Google...
                      </motion.span>
                    ) : (
                      <motion.span
                        animate={{ opacity: 1 }}
                        className="inline-flex items-center gap-2"
                        exit={{ opacity: 0 }}
                        initial={{ opacity: 0 }}
                        key="google-ready"
                      >
                        <GoogleLogo />
                        Sign Up with Google
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                <div className="flex items-center gap-3 py-3">
                  <span className="h-px flex-1 bg-white/8" />
                  <span className="text-xs text-white/38">or complete manually</span>
                  <span className="h-px flex-1 bg-white/8" />
                </div>
              </>
            )}

            <form
              action={formAction}
              className="grid gap-3"
              noValidate
              onSubmit={() => setDismissedValidationErrorKey(null)}
            >
              <input name="next" type="hidden" value={nextPath} />
              <input name="signupProvider" type="hidden" value={isGoogleSignup ? "google" : "email"} />
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={cn(labelClassName, "sm:col-span-2")}>
                  Nationality
                  <SearchableCountrySelect
                    autoComplete="country-name"
                    getOptionLabel={getNationalityOptionLabel}
                    getSearchText={getCountrySearchText}
                    inputExtraClassName={cn(
                      "pl-3",
                      getFieldError("nationality")
                        ? "border-[#F6E3A3]/70 ring-2 ring-[#D4AF37]/20"
                        : null,
                    )}
                    invalid={Boolean(getFieldError("nationality"))}
                    name="nationality"
                    onChange={handleNationalityChange}
                    options={countryProfiles}
                    value={selectedNationality}
                  />
                  {getFieldError("nationality") ? (
                    <span className={helperTextClassName}>{getFieldError("nationality")}</span>
                  ) : null}
                </label>

                <label className={labelClassName}>
                  First Name
                  <span className="relative">
                    <UserRound aria-hidden="true" className={iconClassName} />
                    <input
                      aria-invalid={Boolean(getFieldError("firstName"))}
                      autoComplete="given-name"
                      className={getInputClassName("firstName", cn("pl-10 pr-3", googleSyncedInputClassName))}
                      defaultValue={googleSignupProfile?.firstName}
                      name="firstName"
                      placeholder={nationalityProfile.firstNamePlaceholder}
                      required
                    />
                  </span>
                  {getFieldError("firstName") ? (
                    <span className={helperTextClassName}>{getFieldError("firstName")}</span>
                  ) : null}
                </label>

                <label className={labelClassName}>
                  Last Name
                  <span className="relative">
                    <UserRound aria-hidden="true" className={iconClassName} />
                    <input
                      aria-invalid={Boolean(getFieldError("lastName"))}
                      autoComplete="family-name"
                      className={getInputClassName("lastName", cn("pl-10 pr-3", googleSyncedInputClassName))}
                      defaultValue={googleSignupProfile?.lastName}
                      name="lastName"
                      placeholder={nationalityProfile.lastNamePlaceholder}
                      required
                    />
                  </span>
                  {getFieldError("lastName") ? (
                    <span className={helperTextClassName}>{getFieldError("lastName")}</span>
                  ) : null}
                </label>

                <label className={labelClassName}>
                  Nickname
                  <span className="relative">
                    <ShieldCheck aria-hidden="true" className={iconClassName} />
                    <input
                      aria-invalid={Boolean(getFieldError("nickname"))}
                      className={getInputClassName("nickname", "pl-10 pr-3")}
                      name="nickname"
                      placeholder={nationalityProfile.nicknamePlaceholder}
                      required
                    />
                  </span>
                  {getFieldError("nickname") ? (
                    <span className={helperTextClassName}>{getFieldError("nickname")}</span>
                  ) : null}
                </label>

                <label className={labelClassName}>
                  Phone Number
                  <span className="grid grid-cols-[6.25rem_1fr] gap-2">
                    <SearchableCountrySelect
                      ariaLabel="Phone country"
                      dropdownClassName="min-w-[17rem]"
                      getOptionLabel={getPhoneCountryOptionLabel}
                      getSearchText={getPhoneCountrySearchText}
                      inputExtraClassName={cn(
                        "px-3 pr-8",
                        getFieldError("phoneCountry")
                          ? "border-[#F6E3A3]/70 ring-2 ring-[#D4AF37]/20"
                          : null,
                      )}
                      invalid={Boolean(getFieldError("phoneCountry"))}
                      name="phoneCountry"
                      onChange={setSelectedPhoneCountry}
                      options={phoneCountryProfiles}
                      value={selectedPhoneCountry}
                    />
                    <span className="relative">
                      <Phone aria-hidden="true" className={iconClassName} />
                      <input
                        aria-invalid={Boolean(getFieldError("phone"))}
                        autoComplete="tel"
                        className={getInputClassName("phone", "pl-10 pr-3")}
                        name="phone"
                        placeholder={phoneCountryProfile.phonePlaceholder}
                        required
                        type="tel"
                      />
                    </span>
                  </span>
                  {getFieldError("phoneCountry") || getFieldError("phone") ? (
                    <span className={helperTextClassName}>
                      {getFieldError("phoneCountry") ?? getFieldError("phone")}
                    </span>
                  ) : null}
                </label>

                <label className={cn(labelClassName, "sm:col-span-2")}>
                  Email
                  <span className="relative">
                    <Mail aria-hidden="true" className={iconClassName} />
                    <input
                      aria-invalid={Boolean(getFieldError("email"))}
                      aria-readonly={isGoogleSignup}
                      autoComplete="email"
                      className={getInputClassName(
                        "email",
                        cn(
                          "pl-10 pr-3",
                          isGoogleSignup ? "text-[#F6E3A3]/90" : null,
                          googleSyncedInputClassName,
                        ),
                      )}
                      defaultValue={googleSignupProfile?.email}
                      name="email"
                      placeholder={nationalityProfile.emailPlaceholder}
                      readOnly={isGoogleSignup}
                      required
                      type="email"
                    />
                  </span>
                  {getFieldError("email") ? (
                    <span className={helperTextClassName}>{getFieldError("email")}</span>
                  ) : null}
                </label>

                {!isGoogleSignup ? (
                  <>
                    <label className={labelClassName}>
                      Password
                      <span className="relative">
                        <Lock aria-hidden="true" className={iconClassName} />
                        <input
                          aria-invalid={Boolean(getFieldError("password"))}
                          autoComplete="new-password"
                          className={getInputClassName("password", "pl-10 pr-11")}
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
                      {getFieldError("password") ? (
                        <span className={helperTextClassName}>{getFieldError("password")}</span>
                      ) : null}
                    </label>

                    <label className={labelClassName}>
                      Confirm Password
                      <span className="relative">
                        <Lock aria-hidden="true" className={iconClassName} />
                        <input
                          aria-invalid={Boolean(getFieldError("confirmPassword"))}
                          autoComplete="new-password"
                          className={getInputClassName("confirmPassword", "pl-10 pr-11")}
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
                      {getFieldError("confirmPassword") ? (
                        <span className={helperTextClassName}>{getFieldError("confirmPassword")}</span>
                      ) : null}
                    </label>
                  </>
                ) : null}

                <label className={cn(labelClassName, "sm:col-span-2")}>
                  Access Code
                  <span className="relative">
                    <ShieldCheck aria-hidden="true" className={iconClassName} />
                    <input
                      aria-readonly="true"
                      className={getInputClassName("signupAccessCode", "pl-10 pr-3 text-[#F6E3A3]/90")}
                      name="signupAccessCode"
                      placeholder={accessCodePlaceholder}
                      readOnly
                      required
                      value={autoAccessCode}
                    />
                  </span>
                  {getFieldError("signupAccessCode") ? (
                    <span className={helperTextClassName}>{getFieldError("signupAccessCode")}</span>
                  ) : null}
                </label>
              </div>

              {state.status === "error" ? (
                <div className="rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-2 text-sm text-[#F6E3A3]" role="alert">
                  {state.message}
                </div>
              ) : null}

              <motion.button
                className="group/button relative mt-2 h-11 overflow-hidden rounded-lg bg-white font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isPending}
                type="submit"
                whileHover={{ scale: 1.018 }}
                whileTap={{ scale: 0.985 }}
              >
                <AnimatePresence mode="wait">
                  {isPending ? (
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

              {state.status === "success" && !state.redirectTo ? (
                <p className="rounded-lg border border-[#D4AF37]/28 bg-[#D4AF37]/10 px-3 py-2 text-sm text-[#F6E3A3]">
                  {state.message}
                </p>
              ) : null}
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
