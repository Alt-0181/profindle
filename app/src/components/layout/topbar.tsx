'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import type { Dictionary } from '@/dictionaries';
import { createClient } from '@/lib/supabase/client';

interface TopbarProps {
  locale: string;
  dict: Dictionary;
  title?: string;
  user?: { initial: string; fullName: string };
}

export function Topbar({ locale, dict, title, user }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}/login`);
  };

  const toggleMobileMenu = () => {
    document.body.classList.toggle('sidebar-open');
  };

  return (
    <header className="page-header">
      <div className="flex items-center gap-3">
        <button className="mobile-menu-btn" onClick={toggleMobileMenu} aria-label="Open menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
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

        {/* User Avatar + Dropdown */}
        {user && (
          <div ref={menuRef} style={{ position: 'relative' }}>
            <div
              onClick={() => setMenuOpen(o => !o)}
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              {user.initial}
            </div>
            {menuOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: 'white', borderRadius: '12px', minWidth: '160px',
                boxShadow: '0 8px 32px rgba(23,26,33,0.14)', border: '1px solid #E4E7ED',
                overflow: 'hidden', zIndex: 100,
              }}>
                <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid #F4F5F7' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#171A21' }}>{user.fullName}</div>
                </div>
                <Link
                  href={`/${locale}/settings`}
                  onClick={() => setMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', fontSize: '13px', color: '#444B5A', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F4F5F7')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  {dict.nav.settings}
                </Link>
                <button
                  onClick={handleLogout}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', fontSize: '13px', color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', width: '100%', fontFamily: 'inherit' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FFF5F5')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  {dict.nav.logout}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
