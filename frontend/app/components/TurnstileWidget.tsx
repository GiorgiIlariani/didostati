"use client";

/**
 * Cloudflare Turnstile ("I'm not a robot", usually invisible) used in front
 * of OTP SMS sends. Renders nothing and reports no token when
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY is unset — the backend then also skips the
 * check, so the feature is fully opt-in via env vars.
 *
 * Tokens are single-use: call `reset()` after every send attempt (success or
 * failure) so the next attempt gets a fresh token.
 */
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
export const captchaEnabled = TURNSTILE_SITE_KEY.length > 0;

type TurnstileApi = {
  render: (
    el: HTMLElement,
    options: Record<string, unknown>,
  ) => string | undefined;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export type TurnstileHandle = { reset: () => void };

type Props = {
  /** Called with a fresh token, or null when it expires / errors / resets. */
  onToken: (token: string | null) => void;
};

function loadScript(onLoad: () => void): () => void {
  if (window.turnstile) {
    onLoad();
    return () => {};
  }
  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${SCRIPT_SRC}"]`,
  );
  if (existing) {
    existing.addEventListener("load", onLoad);
    return () => existing.removeEventListener("load", onLoad);
  }
  const script = document.createElement("script");
  script.src = SCRIPT_SRC;
  script.async = true;
  script.defer = true;
  script.addEventListener("load", onLoad);
  document.head.appendChild(script);
  return () => script.removeEventListener("load", onLoad);
}

const TurnstileWidget = forwardRef<TurnstileHandle, Props>(function TurnstileWidget(
  { onToken },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      onTokenRef.current(null);
      if (widgetIdRef.current !== undefined) {
        try {
          window.turnstile?.reset(widgetIdRef.current);
        } catch {
          // widget may already be gone
        }
      }
    },
  }));

  useEffect(() => {
    if (!captchaEnabled) return;
    let cancelled = false;

    const render = () => {
      const el = containerRef.current;
      if (cancelled || !el || !window.turnstile || widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile.render(el, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: "dark",
        // Invisible unless Cloudflare decides a visible challenge is needed.
        appearance: "interaction-only",
        callback: (token: string) => onTokenRef.current(token),
        "expired-callback": () => onTokenRef.current(null),
        "error-callback": () => onTokenRef.current(null),
        "timeout-callback": () => onTokenRef.current(null),
      });
    };

    const unsubscribe = loadScript(render);

    return () => {
      cancelled = true;
      unsubscribe();
      if (widgetIdRef.current !== undefined) {
        try {
          window.turnstile?.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = undefined;
      }
      onTokenRef.current(null);
    };
  }, []);

  if (!captchaEnabled) return null;

  return <div ref={containerRef} className="flex justify-center" />;
});

export default TurnstileWidget;
