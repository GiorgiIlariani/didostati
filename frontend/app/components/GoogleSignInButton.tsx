"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, unknown>,
          ) => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  onCredential: (credential: string) => void;
  onError?: (message: string) => void;
}

export default function GoogleSignInButton({
  onCredential,
  onError,
}: GoogleSignInButtonProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  const lastWidthRef = useRef(0);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  onCredentialRef.current = onCredential;
  onErrorRef.current = onError;

  useEffect(() => {
    if (!clientId) return;

    let cancelled = false;

    const buttonWidth = () => {
      const wrap = wrapRef.current;
      const available = Math.round(wrap?.getBoundingClientRect().width || 0);
      // Hug the label on wide screens; only cap when the card is too narrow.
      if (available > 0 && available < 320) {
        return Math.max(200, available);
      }
      return 0;
    };

    const render = () => {
      const el = btnRef.current;
      if (cancelled || !window.google?.accounts?.id || !el) return;
      const width = buttonWidth();
      if (width === lastWidthRef.current && el.childElementCount > 0) return;
      lastWidthRef.current = width;
      el.innerHTML = "";
      const options: Record<string, unknown> = {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "left",
      };
      if (width) options.width = width;
      window.google.accounts.id.renderButton(el, options);
    };

    const init = () => {
      if (cancelled || !window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response.credential) onCredentialRef.current(response.credential);
          else onErrorRef.current?.("Google credential ვერ მოვიდა");
        },
      });
      lastWidthRef.current = 0;
      render();
    };

    const wrap = wrapRef.current;
    const ro = wrap ? new ResizeObserver(() => render()) : null;
    if (wrap && ro) ro.observe(wrap);

    if (window.google?.accounts?.id) {
      init();
    } else {
      const existing = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]',
      );
      if (existing) {
        existing.addEventListener("load", init);
      } else {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.onload = init;
        document.body.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
      ro?.disconnect();
      const existing = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]',
      );
      existing?.removeEventListener("load", init);
    };
  }, [clientId]);

  if (!clientId) return null;

  return (
    <div
      ref={wrapRef}
      className="w-full max-w-full overflow-hidden flex justify-center">
      <div ref={btnRef} className="inline-flex min-h-10" />
    </div>
  );
}
