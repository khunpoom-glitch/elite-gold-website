"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { turnstileResponseFieldName } from "@/lib/auth/turnstile-fields";
import { authBotProtectionFieldNames } from "@/lib/auth/validation";

type TurnstileWidgetId = string;
type TurnstileApi = {
  execute: (widgetId: TurnstileWidgetId) => void;
  remove: (widgetId: TurnstileWidgetId) => void;
  render: (
    container: HTMLElement,
    options: {
      callback: (token: string) => void;
      "error-callback": () => void;
      "expired-callback": () => void;
      sitekey: string;
      size: "invisible";
      theme: "dark";
    },
  ) => TurnstileWidgetId;
  reset: (widgetId: TurnstileWidgetId) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let turnstileScriptPromise: Promise<void> | null = null;

function loadTurnstileScript() {
  if (window.turnstile) {
    return Promise.resolve();
  }

  if (turnstileScriptPromise) {
    return turnstileScriptPromise;
  }

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      "script[data-cloudflare-turnstile]",
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(), { once: true });
      return;
    }

    const script = document.createElement("script");

    script.async = true;
    script.dataset.cloudflareTurnstile = "true";
    script.defer = true;
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(), { once: true });
    document.head.appendChild(script);
  });

  return turnstileScriptPromise;
}

export function AuthBotProtectionFields() {
  const [startedAt] = useState(() => Date.now());
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileInputRef = useRef<HTMLInputElement>(null);
  const turnstileWidgetRef = useRef<TurnstileWidgetId | null>(null);
  const allowNextSubmitRef = useRef(false);
  const pendingSubmitRef = useRef(false);
  const turnstileTokenRef = useRef("");
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();

  const writeTurnstileToken = useCallback((token: string) => {
    turnstileTokenRef.current = token;
    setTurnstileToken(token);

    if (turnstileInputRef.current) {
      turnstileInputRef.current.value = token;
    }
  }, []);

  const clearTurnstileToken = useCallback(() => {
    writeTurnstileToken("");
  }, [writeTurnstileToken]);

  useEffect(() => {
    if (!turnstileSiteKey || !turnstileContainerRef.current) {
      return;
    }

    let isMounted = true;

    loadTurnstileScript()
      .then(() => {
        if (!isMounted || !window.turnstile || !turnstileContainerRef.current) {
          return;
        }

        const widgetId = window.turnstile.render(turnstileContainerRef.current, {
          callback: (token) => {
            writeTurnstileToken(token);

            if (pendingSubmitRef.current) {
              const form = turnstileContainerRef.current?.closest("form");

              pendingSubmitRef.current = false;
              allowNextSubmitRef.current = true;
              form?.requestSubmit();
            }
          },
          "error-callback": () => {
            pendingSubmitRef.current = false;
            clearTurnstileToken();
          },
          "expired-callback": () => {
            clearTurnstileToken();
            if (turnstileWidgetRef.current && window.turnstile) {
              window.turnstile.reset(turnstileWidgetRef.current);
              window.turnstile.execute(turnstileWidgetRef.current);
            }
          },
          sitekey: turnstileSiteKey,
          size: "invisible",
          theme: "dark",
        });

        turnstileWidgetRef.current = widgetId;
        window.turnstile.execute(widgetId);
      })
      .catch((error) => {
        console.warn("[auth] Turnstile script failed to load.", error);
      });

    return () => {
      isMounted = false;

      if (turnstileWidgetRef.current && window.turnstile) {
        window.turnstile.remove(turnstileWidgetRef.current);
      }
    };
  }, [clearTurnstileToken, turnstileSiteKey, writeTurnstileToken]);

  useEffect(() => {
    if (!turnstileSiteKey || !turnstileContainerRef.current) {
      return;
    }

    const form = turnstileContainerRef.current.closest("form");

    if (!form) {
      return;
    }

    function handleSubmit(event: SubmitEvent) {
      if (allowNextSubmitRef.current) {
        allowNextSubmitRef.current = false;
        return;
      }

      const widgetId = turnstileWidgetRef.current;

      if (!widgetId || !window.turnstile) {
        return;
      }

      if (turnstileTokenRef.current) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      pendingSubmitRef.current = true;
      clearTurnstileToken();
      window.turnstile.reset(widgetId);
      window.turnstile.execute(widgetId);
    }

    form.addEventListener("submit", handleSubmit, { capture: true });

    return () => {
      form.removeEventListener("submit", handleSubmit, { capture: true });
    };
  }, [clearTurnstileToken, turnstileSiteKey]);

  return (
    <>
      <div aria-hidden="true" className="hidden">
        <input
          name={authBotProtectionFieldNames.startedAt}
          readOnly
          tabIndex={-1}
          type="hidden"
          value={startedAt}
        />
        <label>
          Website
          <input
            autoComplete="off"
            name={authBotProtectionFieldNames.website}
            tabIndex={-1}
            type="text"
          />
        </label>
      </div>
      {turnstileSiteKey ? (
        <>
          <input
            name={turnstileResponseFieldName}
            readOnly
            ref={turnstileInputRef}
            tabIndex={-1}
            type="hidden"
            value={turnstileToken}
          />
          <div
            ref={turnstileContainerRef}
            aria-hidden="true"
            className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
          />
        </>
      ) : null}
    </>
  );
}
