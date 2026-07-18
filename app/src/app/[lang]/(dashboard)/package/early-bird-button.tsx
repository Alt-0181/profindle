'use client';

import { useState } from 'react';

interface Props {
  label: string;
  style?: React.CSSProperties;
}

export function EarlyBirdButton({ label, style }: Props) {
  const [clicked, setClicked] = useState(false);

  const handleClick = async () => {
    if (clicked) return;
    setClicked(true);
    fetch('/api/notify/early-bird', { method: 'POST' }).catch(() => {});
    window.location.href = 'mailto:support@profindle.com?subject=Premium%20Early%20Bird%20Request';
  };

  return (
    <button
      onClick={handleClick}
      style={{
        ...style,
        cursor: 'pointer',
        fontFamily: 'inherit',
        border: 'none',
      }}
    >
      {label}
    </button>
  );
}
