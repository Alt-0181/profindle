'use client';
import { useState } from 'react';

const LINE_ICON = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.365 9.89c.50 0 .866.37.866.87s-.368.87-.866.87H17.61v1.05h1.754c.498 0 .866.37.866.87s-.368.87-.866.87H16.74a.87.87 0 0 1-.866-.87V8.14c0-.498.368-.868.866-.868h2.624c.498 0 .866.37.866.87s-.368.87-.866.87H17.61v.878h1.754zm-6.735 3.65a.868.868 0 0 1-.607-.247l-2.627-2.78v2.16a.866.866 0 1 1-1.732 0V8.14a.866.866 0 0 1 1.474-.618l2.627 2.78V8.14a.866.866 0 1 1 1.732 0v5.4a.868.868 0 0 1-.866.868v.002zm-5.74 0a.866.866 0 0 1-.866-.868V8.14a.866.866 0 1 1 1.732 0v5.4a.866.866 0 0 1-.866.868v-.002zM24 10.314C24 4.943 18.617.572 12 .572S0 4.943 0 10.314c0 4.814 4.27 8.842 10.035 9.608.392.084.923.258 1.058.592.12.302.079.776.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.07 9.436-6.966C23.176 14.143 24 12.33 24 10.314z"/>
  </svg>
);

function parseLineId(raw: string) {
  let type: 'oa' | 'id' | 'phone' = 'id';
  let value = raw;
  if (raw.startsWith('oa:')) { type = 'oa'; value = raw.slice(3); }
  else if (raw.startsWith('id:')) { type = 'id'; value = raw.slice(3); }
  else if (raw.startsWith('phone:')) { type = 'phone'; value = raw.slice(6); }
  const display = type === 'oa' ? `@${value}` : value;
  const label = type === 'oa' ? 'LINE Official' : type === 'phone' ? 'LINE Phone' : 'LINE ID';
  return { type, value, display, label };
}

export function LineContactRow({ raw, isTh }: { raw: string; isTh: boolean }) {
  const [copied, setCopied] = useState(false);
  const { type, value, display, label } = parseLineId(raw);

  const copy = () => {
    navigator.clipboard?.writeText(display).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (type === 'oa') {
    return (
      <a
        href={`https://line.me/R/ti/p/@${value}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '1.5px solid #06C755', borderRadius: '10px', textDecoration: 'none', color: '#171A21', fontSize: '13px', background: '#F0FFF4' }}
      >
        <span style={{ color: '#06C755' }}>{LINE_ICON}</span>
        <span style={{ flex: 1 }}><span style={{ fontSize: '11px', fontWeight: 700, color: '#3d9c40', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>{display}</span>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#06C755', flexShrink: 0 }}>{isTh ? 'เพิ่มเพื่อน →' : 'Add Friend →'}</span>
      </a>
    );
  }

  return (
    <div
      onClick={copy}
      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '1.5px solid #06C755', borderRadius: '10px', color: '#171A21', fontSize: '13px', background: '#F0FFF4', cursor: 'pointer' }}
    >
      <span style={{ color: '#06C755' }}>{LINE_ICON}</span>
      <span style={{ flex: 1 }}><span style={{ fontSize: '11px', fontWeight: 700, color: '#3d9c40', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>{display}</span>
      <span style={{ fontSize: '11px', color: copied ? '#06C755' : '#9AA0AE', flexShrink: 0, fontWeight: copied ? 600 : 400 }}>
        {copied ? (isTh ? '✓ คัดลอก' : '✓ Copied') : (isTh ? 'แตะเพื่อคัดลอก' : 'tap to copy')}
      </span>
    </div>
  );
}
