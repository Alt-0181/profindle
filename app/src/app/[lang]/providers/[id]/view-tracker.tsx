'use client';
import { useEffect, useRef } from 'react';

// Fires one anonymous view ping when a profile loads. The server dedupes by
// viewer+day, so a refresh won't count again. Fire-and-forget — never blocks.
export function ViewTracker({ companyId }: { companyId: string }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    try {
      fetch('/api/profile-view', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ companyId }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* ignore */
    }
  }, [companyId]);
  return null;
}
