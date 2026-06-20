"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import {
  AUTH_MODAL_EVENT_NAME,
  getAuthModalRouteHref,
  type AuthModalEventDetail,
  type AuthModalMode,
} from "@/config/auth-modal";

type AuthLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  accessCode?: string;
  mode: AuthModalMode;
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
  accessCode,
  mode,
  onClick,
  ...props
}: AuthLinkProps) {
  return (
    <Link
      {...props}
      href={getAuthModalRouteHref(mode, accessCode)}
      onClick={(event) => {
        onClick?.(event);

        if (shouldUseNativeLink(event)) {
          return;
        }

        event.preventDefault();

        const detail: AuthModalEventDetail = {
          accessCode,
          mode,
          returnHref: `${window.location.pathname}${window.location.search}`,
        };

        window.dispatchEvent(new CustomEvent(AUTH_MODAL_EVENT_NAME, { detail }));
      }}
    />
  );
}
