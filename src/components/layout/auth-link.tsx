"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import {
  AUTH_MODAL_EVENT_NAME,
  AUTH_MODAL_ROUTES,
  type AuthModalEventDetail,
  type AuthModalMode,
} from "@/config/auth-modal";

type AuthLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  mode: AuthModalMode;
  referralCode?: string;
};

function shouldUseNativeLink(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.altKey ||
    event.ctrlKey ||
    event.shiftKey
  );
}

export function AuthLink({
  mode,
  onClick,
  referralCode,
  ...props
}: AuthLinkProps) {
  return (
    <Link
      {...props}
      href={AUTH_MODAL_ROUTES[mode]}
      onClick={(event) => {
        onClick?.(event);

        if (shouldUseNativeLink(event)) {
          return;
        }

        event.preventDefault();

        const detail: AuthModalEventDetail = {
          mode,
          referralCode,
          returnHref: `${window.location.pathname}${window.location.search}`,
        };

        window.dispatchEvent(new CustomEvent(AUTH_MODAL_EVENT_NAME, { detail }));
      }}
    />
  );
}
