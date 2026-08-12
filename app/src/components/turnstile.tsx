'use client';

import { useEffect, useRef } from 'react';

// Public site key. When unset, the widget renders nothing and auth flows behave
// exactly as before (see `captchaEnabled`). To activate: set this env var AND
// enable Turnstile in the Supabase dashboard (Auth → Settings → Bot protection)
// with the matching secret. Both must be done together.
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// True when a Turnstile site key is configured. Auth forms use this to decide
// whether to require a token before submitting.
export const captchaEnabled = Boolean(SITE_KEY);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
      reset: (id?: string) => void;
    };
    __turnstileLoading?: Promise<void>;
  }
}

// Loads the Cloudflare Turnstile script once, shared across widget instances.
function loadScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (window.__turnstileLoading) return window.__turnstileLoading;
  window.__turnstileLoading = new Promise<void>((resolve) => {
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => resolve(); // never block the form if the script fails
    document.head.appendChild(s);
  });
  return window.__turnstileLoading;
}

/**
 * Cloudflare Turnstile CAPTCHA. Renders nothing when no site key is configured.
 * Calls onToken with the solved token (or '' when it expires / errors), which
 * the parent form passes to Supabase auth as `captchaToken`.
 */
export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (!SITE_KEY || !ref.current) return;
    let cancelled = false;

    loadScript().then(() => {
      if (cancelled || !ref.current || !window.turnstile) return;
      // Avoid double-render (e.g. React strict mode remount).
      if (widgetId.current) return;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: SITE_KEY,
        callback: (token: string) => onToken(token),
        'expired-callback': () => onToken(''),
        'error-callback': () => onToken(''),
        theme: 'light',
      });
    });

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        try { window.turnstile.remove(widgetId.current); } catch { /* ignore */ }
        widgetId.current = null;
      }
    };
    // onToken is stable enough for this one-time mount; re-running would re-render the widget.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!SITE_KEY) return null;
  return <div ref={ref} style={{ minHeight: '65px' }} />;
}
