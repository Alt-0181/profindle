'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// Fires one first-party page-view beacon per navigation. Paired with
// /api/pageview, which does the PDPA-safe hashing and bot/admin filtering.
export function PageViewTracker() {
  const pathname = usePathname();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastSent.current === pathname) return;
    lastSent.current = pathname;

    // Only send the referrer on the first page of a session (external source);
    // internal navigations report no referrer and are treated as direct.
    const referrer = typeof document !== 'undefined' ? document.referrer : '';

    fetch('/api/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname, referrer }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
