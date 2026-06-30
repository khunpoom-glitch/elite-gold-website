"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import {
  authNoticeParamName,
  loggedInAuthNoticeValue,
  signedOutAuthNoticeValue,
} from "@/lib/auth/redirect-notice";

export type HomeAuthNoticeType = "logged_in" | "signed_out";

type HomeAuthNoticeProps = {
  notice?: HomeAuthNoticeType;
};

export const homeLoggedInNoticeEventName = "elite-gold:logged-in";
export const homeSignedOutNoticeEventName = "elite-gold:signed-out";

const noticeCopy = {
  logged_in: {
    title: "Logged in successfully",
    message: "Your member session is now active.",
  },
  signed_out: {
    title: "Logged out securely",
    message: "Your session has been cleared.",
  },
} satisfies Record<HomeAuthNoticeType, { title: string; message: string }>;

function getNoticeFromSearch(search: string): HomeAuthNoticeType | undefined {
  const searchParams = new URLSearchParams(search);
  const authNotice = searchParams.get(authNoticeParamName);

  if (authNotice === loggedInAuthNoticeValue) {
    return "logged_in";
  }

  if (authNotice === signedOutAuthNoticeValue) {
    return "signed_out";
  }

  return undefined;
}

function cleanAuthNoticeFromUrl() {
  const searchParams = new URLSearchParams(window.location.search);

  if (!searchParams.has(authNoticeParamName)) {
    return;
  }

  searchParams.delete(authNoticeParamName);

  const cleanSearch = searchParams.toString();
  const cleanUrl = `${window.location.pathname}${cleanSearch ? `?${cleanSearch}` : ""}${window.location.hash}`;

  window.history.replaceState(null, "", cleanUrl || "/");
}

export function HomeAuthNotice({ notice }: HomeAuthNoticeProps) {
  const [activeNotice, setActiveNotice] = useState<HomeAuthNoticeType | undefined>(() => {
    if (notice || typeof window === "undefined") {
      return notice;
    }

    return getNoticeFromSearch(window.location.search);
  });
  const [isDismissed, setIsDismissed] = useState(false);
  const isVisible = Boolean(activeNotice) && !isDismissed;
  const portalTarget = typeof document === "undefined" ? null : document.body;

  useEffect(() => {
    function handleLoggedInNotice() {
      setActiveNotice("logged_in");
      setIsDismissed(false);
    }

    function handleSignedOutNotice() {
      setActiveNotice("signed_out");
      setIsDismissed(false);
    }

    window.addEventListener(homeLoggedInNoticeEventName, handleLoggedInNotice);
    window.addEventListener(homeSignedOutNoticeEventName, handleSignedOutNotice);

    return () => {
      window.removeEventListener(homeLoggedInNoticeEventName, handleLoggedInNotice);
      window.removeEventListener(homeSignedOutNoticeEventName, handleSignedOutNotice);
    };
  }, []);

  useEffect(() => {
    if (!activeNotice) {
      return;
    }

    const timer = window.setTimeout(() => setIsDismissed(true), 3200);

    cleanAuthNoticeFromUrl();

    return () => window.clearTimeout(timer);
  }, [activeNotice]);

  if (!activeNotice || !portalTarget) {
    return null;
  }

  const copy = noticeCopy[activeNotice];

  return createPortal(
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+5.75rem)] z-[220] flex justify-center px-4 sm:top-[6.25rem] lg:top-[6.75rem]"
          data-home-auth-notice
          exit={{ opacity: 0, y: -10 }}
          initial={{ opacity: 0, y: -10 }}
          role="status"
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="pointer-events-auto relative flex min-h-[4.5rem] w-[min(22rem,calc(100vw-2rem))] items-center gap-3 rounded-2xl border border-white/10 bg-[#171717]/92 px-4 py-3 pr-11 text-left text-white shadow-[0_18px_55px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <span className="grid size-7 shrink-0 place-items-center rounded-full border border-emerald-400/24 bg-emerald-400/10 text-emerald-300">
              <CheckCircle2 aria-hidden="true" className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold leading-5 text-white">{copy.title}</span>
              <span className="mt-0.5 block text-xs leading-5 text-white/58">{copy.message}</span>
            </span>
            <button
              aria-label={`Dismiss ${copy.title.toLowerCase()} notice`}
              className="absolute right-3 top-3 inline-flex size-7 shrink-0 items-center justify-center rounded-full text-white/42 transition hover:bg-white/8 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/35"
              onClick={() => setIsDismissed(true)}
              type="button"
            >
              <X aria-hidden="true" className="size-3.5" />
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    portalTarget,
  );
}
