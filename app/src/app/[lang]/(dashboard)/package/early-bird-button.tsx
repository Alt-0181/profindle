'use client';

import { useState } from 'react';

interface Props {
  label: string;
  /** Label shown after a successful request (localised by the caller). */
  sentLabel?: string;
  /** Start in the "done" state — e.g. the user already has a pending claim. */
  initialRequested?: boolean;
  style?: React.CSSProperties;
}

export function EarlyBirdButton({ label, sentLabel, initialRequested, style }: Props) {
  const [state, setState] = useState<'idle' | 'sending' | 'done'>(initialRequested ? 'done' : 'idle');

  const handleClick = async () => {
    if (state !== 'idle') return;
    setState('sending');
    try {
      // Records the claim + notifies the admin server-side. We show the
      // confirmation regardless of the result so the user always gets feedback.
      await fetch('/api/notify/early-bird', { method: 'POST' });
    } catch {
      // ignore — the admin is still notified via the other channels
    }
    setState('done');
  };

  const doneLabel = sentLabel ?? '✓ Request received';

  return (
    <button
      onClick={handleClick}
      disabled={state !== 'idle'}
      style={{
        ...style,
        cursor: state === 'idle' ? 'pointer' : 'default',
        fontFamily: 'inherit',
        border: 'none',
        opacity: state === 'sending' ? 0.7 : 1,
        ...(state === 'done'
          ? { background: 'linear-gradient(135deg,#06C755,#04a544)', color: 'white' }
          : {}),
      }}
    >
      {state === 'sending' ? '…' : state === 'done' ? doneLabel : label}
    </button>
  );
}
