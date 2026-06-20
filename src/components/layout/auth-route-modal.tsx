"use client";

import { useEffect, useState } from "react";
import { AuthModal, type AuthMode } from "@/components/layout/auth-modal";
import {
  AUTH_MODAL_EVENT_NAME,
  AUTH_MODAL_ROUTES,
  AUTH_MODAL_SKIP_SCROLL_EVENT_NAME,
  getAuthModalRouteHref,
  type AuthModalEventDetail,
} from "@/config/auth-modal";
import { HOME_PATH } from "@/config/home-sections";
import type { GoogleSignupProfile } from "@/lib/member/profile";

type AuthRouteModalProps = {
  accessCode?: string;
  initialGoogleSignupProfile?: GoogleSignupProfile;
  initialMode?: AuthMode | null;
  initialNotice?: string;
};

function getModeFromPathname(pathname: string): AuthMode | null {
  if (pathname === AUTH_MODAL_ROUTES.login) {
    return "login";
  }

  if (pathname === AUTH_MODAL_ROUTES.signup) {
    return "signup";
  }

  if (pathname === AUTH_MODAL_ROUTES.forgotPassword) {
    return "forgotPassword";
  }

  return null;
}

function getAccessCodeFromSearch(search: string) {
  const searchParams = new URLSearchParams(search);

  return (
    searchParams.get("ref") ??
    searchParams.get("refCode") ??
    searchParams.get("referral") ??
    searchParams.get("referralCode") ??
    undefined
  );
}

function getCurrentHref() {
  return `${window.location.pathname}${window.location.search}`;
}

function pushUrlWithoutRouteRefresh(href: string, { skipScroll = false } = {}) {
  if (getCurrentHref() !== href) {
    if (skipScroll) {
      window.dispatchEvent(new Event(AUTH_MODAL_SKIP_SCROLL_EVENT_NAME));
    }

    window.history.pushState(null, "", href);
  }
}

function getInitialMode(initialMode?: AuthMode | null) {
  if (initialMode) {
    return initialMode;
  }

  if (typeof window === "undefined") {
    return null;
  }

  return getModeFromPathname(window.location.pathname);
}

function getInitialAccessCode(accessCode?: string) {
  if (accessCode) {
    return accessCode;
  }

  if (typeof window === "undefined") {
    return undefined;
  }

  return getAccessCodeFromSearch(window.location.search);
}

export function AuthRouteModal({
  accessCode,
  initialGoogleSignupProfile,
  initialMode = null,
  initialNotice,
}: AuthRouteModalProps) {
  const [mode, setMode] = useState<AuthMode | null>(() => getInitialMode(initialMode));
  const [activeAccessCode, setActiveAccessCode] = useState<string | undefined>(() =>
    getInitialAccessCode(accessCode),
  );
  const [returnHref, setReturnHref] = useState(HOME_PATH);

  useEffect(() => {
    function syncFromLocation() {
      setMode(getModeFromPathname(window.location.pathname));
      setActiveAccessCode(getAccessCodeFromSearch(window.location.search));
    }

    function handleAuthModalEvent(event: Event) {
      const detail = (event as CustomEvent<AuthModalEventDetail>).detail;

      if (!detail?.mode) {
        return;
      }

      setMode(detail.mode);
      const nextAccessCode = detail.accessCode ?? getAccessCodeFromSearch(window.location.search);

      setActiveAccessCode(nextAccessCode);
      setReturnHref(detail.returnHref ?? HOME_PATH);
      pushUrlWithoutRouteRefresh(getAuthModalRouteHref(detail.mode, nextAccessCode));
    }

    window.addEventListener("popstate", syncFromLocation);
    window.addEventListener(AUTH_MODAL_EVENT_NAME, handleAuthModalEvent);

    return () => {
      window.removeEventListener("popstate", syncFromLocation);
      window.removeEventListener(AUTH_MODAL_EVENT_NAME, handleAuthModalEvent);
    };
  }, []);

  function closeModal() {
    setMode(null);
    pushUrlWithoutRouteRefresh(returnHref, { skipScroll: true });
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    pushUrlWithoutRouteRefresh(getAuthModalRouteHref(nextMode, activeAccessCode));
  }

  return (
    <AuthModal
      accessCode={activeAccessCode}
      googleSignupProfile={initialGoogleSignupProfile}
      mode={mode}
      notice={initialNotice}
      onClose={closeModal}
      onModeChange={changeMode}
    />
  );
}
