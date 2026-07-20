'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { Dictionary } from '@/dictionaries';

interface PublicNavProps {
  locale: string;
  dict: Dictionary;
  dark?: boolean;
}

export function PublicNav({ locale, dict, dark = false }: PublicNavProps) {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
    });
  }, []);

  return (
    <nav
      className="px-4 sm:px-12"
      style={{
        position: dark ? 'absolute' : 'sticky',
        top: 0, left: 0, right: 0, zIndex: 50,
        height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: dark ? 'transparent' : 'rgba(255,255,255,0.95)',
        backdropFilter: dark ? 'none' : 'blur(8px)',
        borderBottom: dark ? 'none' : '1px solid #E4E7ED',
      }}
    >
      {/* Logo */}
      <Link href={`/${locale}`} className="flex items-center gap-2.5 no-underline">
        <svg width="28" height="37" viewBox="-3 -3 44 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18.56" cy="18.56" r="16" fill="none" stroke={dark ? 'white' : '#0F6F73'} strokeWidth="5.12" />
          <path d="M18.56 8.96C23.8619 8.96 28.16 13.2581 28.16 18.56" stroke="#F77F00" strokeWidth="5.12" strokeLinecap="round" />
          <path d="M5.76001 47.36C5.76001 47.36 5.76001 34.56 18.56 34.56" stroke={dark ? 'white' : '#0F6F73'} strokeWidth="5.12" strokeLinecap="round" />
          <path d="M18.56 34.56L31.36 47.36" stroke={dark ? 'white' : '#0F6F73'} strokeWidth="5.12" strokeLinecap="round" />
          <circle cx="18.56" cy="34.56" r="3.84" fill="#F77F00" />
        </svg>
        <span style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>
          <span style={{ color: dark ? 'white' : '#0F6F73' }}>Pro</span>
          <span style={{ color: '#F77F00' }}>find</span>
          <span style={{ color: dark ? 'white' : '#0F6F73' }}>le</span>
        </span>
      </Link>

      {/* Right nav */}
      <div className="flex items-center gap-2 sm:gap-5">
        {/* Language pill toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', borderRadius: '999px', padding: '3px', gap: '2px',
          background: dark ? 'rgba(255,255,255,0.12)' : '#E4E7ED',
          border: dark ? '1px solid rgba(255,255,255,0.15)' : 'none',
        }}>
          {(['en', 'th'] as const).map((l) => (
            <Link
              key={l}
              href={`/${l}${pathname.slice(3)}`}
              style={{
                fontSize: '12px', fontWeight: 700, padding: '4px 14px', borderRadius: '999px',
                textDecoration: 'none', transition: 'all 150ms',
                background: locale === l ? 'white' : 'transparent',
                color: locale === l ? '#171A21' : (dark ? 'rgba(255,255,255,0.55)' : '#9AA0AE'),
                boxShadow: locale === l ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
              }}
            >
              {l.toUpperCase()}
            </Link>
          ))}
        </div>

        {loggedIn ? (
          /* Already signed in — go to dashboard */
          <Link
            href={`/${locale}/home`}
            style={{
              fontSize: '13px', fontWeight: 600, padding: '8px 16px', borderRadius: '10px',
              textDecoration: 'none', transition: 'all 150ms', whiteSpace: 'nowrap',
              background: dark ? 'rgba(255,255,255,0.12)' : '#171A21',
              color: 'white',
              border: dark ? '1.5px solid rgba(255,255,255,0.2)' : 'none',
            }}
          >
            {locale === 'th' ? 'แดชบอร์ด' : 'Dashboard'}
          </Link>
        ) : (
          <>
            {/* Join as Provider FREE */}
            <Link
              href={`/${locale}/signup`}
              style={{
                fontSize: '14px', fontWeight: 500, textDecoration: 'none', transition: 'color 150ms',
                color: dark ? 'rgba(255,255,255,0.75)' : '#444B5A',
              }}
              className="hidden sm:block"
            >
              {locale === 'th' ? (
                <>สมัครเป็นผู้ให้บริการ <strong style={{ color: '#F77F00', fontWeight: 700 }}>ฟรี</strong></>
              ) : (
                <>Join as Provider <strong style={{ color: '#F77F00', fontWeight: 700 }}>FREE</strong></>
              )}
            </Link>

            {/* Sign In */}
            <Link
              href={`/${locale}/login`}
              style={{
                fontSize: '13px', fontWeight: 600, padding: '8px 18px', borderRadius: '10px',
                textDecoration: 'none', transition: 'all 150ms',
                background: dark ? 'rgba(255,255,255,0.12)' : '#171A21',
                color: 'white',
                border: dark ? '1.5px solid rgba(255,255,255,0.2)' : 'none',
              }}
            >
              {dict.nav.signIn}
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
