'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Dictionary } from '@/dictionaries';

interface TopbarProps {
  locale: string;
  dict: Dictionary;
  title?: string;
  user?: { initial: string; fullName: string };
}

export function Topbar({ locale, dict, title, user }: TopbarProps) {
  const pathname = usePathname();

  return (
    <header className="page-header">
      <div className="flex items-center gap-3">
        {title && (
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#171A21', letterSpacing: '-0.01em', margin: 0 }}>{title}</h1>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Language Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#F0F2F5', borderRadius: '10px', padding: '3px', gap: '2px' }}>
          {(['en', 'th'] as const).map(lang => {
            const isActive = locale === lang;
            return (
              <Link
                key={lang}
                href={`/${lang}${pathname.slice(3)}`}
                style={{
                  padding: '5px 12px',
                  borderRadius: '7px',
                  fontSize: '12px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 150ms',
                  background: isActive ? 'white' : 'transparent',
                  color: isActive ? '#0F6F73' : '#9AA0AE',
                  boxShadow: isActive ? '0 1px 4px rgba(23,26,33,0.10), 0 0 0 1px rgba(23,26,33,0.04)' : 'none',
                  letterSpacing: '0.03em',
                }}
              >
                {lang.toUpperCase()}
              </Link>
            );
          })}
        </div>

        {/* User Avatar */}
        {user && (
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
          }}>
            {user.initial}
          </div>
        )}
      </div>
    </header>
  );
}
