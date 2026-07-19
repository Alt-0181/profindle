'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Re-fetches server-rendered data without a manual reload so things like a
 * super-admin granting Premium reflect on the user's screen automatically.
 *
 * router.refresh() re-runs the server component and updates its data/props
 * while preserving client component state (form inputs, scroll, etc.), so it
 * is safe to place on pages that also contain forms.
 *
 * Triggers: when the tab becomes visible again, and on a gentle interval
 * while the tab is visible (skipped when hidden to avoid wasted queries).
 */
export function AutoRefresh({ intervalMs = 30000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible') router.refresh();
    };

    document.addEventListener('visibilitychange', refreshIfVisible);
    const id = setInterval(refreshIfVisible, intervalMs);

    return () => {
      document.removeEventListener('visibilitychange', refreshIfVisible);
      clearInterval(id);
    };
  }, [router, intervalMs]);

  return null;
}
