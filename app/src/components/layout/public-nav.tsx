'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Dictionary } from '@/dictionaries';

interface PublicNavProps {
  locale: string;
  dict: Dictionary;
  dark?: boolean;
}

export function PublicNav({ locale, dict, dark = false }: PublicNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 h-16 px-12 flex items-center justify-between',
        'max-[640px]:px-5',
        dark
          ? 'bg-transparent'
          : 'bg-white/95 backdrop-blur-sm border-b border-[#E4E7ED]'
      )}
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
        <span className={cn('text-[20px] font-bold tracking-tight', dark ? 'text-white' : 'text-[#171A21]')}>
          <span className={dark ? 'text-[#2BBEC5]' : 'text-[#0F6F73]'}>Pro</span>
          <span style={{ color: '#F77F00' }}>find</span>
          <span className={dark ? 'text-[#2BBEC5]' : 'text-[#0F6F73]'}>le</span>
        </span>
      </Link>

      {/* Right nav */}
      <div className="flex items-center gap-5">
        {/* Language Toggle */}
        <div className="flex items-center gap-1">
          <Link
            href={`/en${pathname.slice(3)}`}
            className={cn(
              'text-[13px] font-semibold transition-colors no-underline',
              locale === 'en'
                ? (dark ? 'text-white' : 'text-[#0F6F73]')
                : (dark ? 'text-white/40 hover:text-white/70' : 'text-[#9AA0AE] hover:text-[#444B5A]')
            )}
          >
            EN
          </Link>
          <span className={cn('text-[11px]', dark ? 'text-white/25' : 'text-[#C8CDD7]')}>|</span>
          <Link
            href={`/th${pathname.slice(3)}`}
            className={cn(
              'text-[13px] font-semibold transition-colors no-underline',
              locale === 'th'
                ? (dark ? 'text-white' : 'text-[#0F6F73]')
                : (dark ? 'text-white/40 hover:text-white/70' : 'text-[#9AA0AE] hover:text-[#444B5A]')
            )}
          >
            TH
          </Link>
        </div>

        <Link
          href={`/${locale}/search-providers`}
          className={cn(
            'text-[13px] font-semibold transition-colors no-underline hidden sm:block',
            dark ? 'text-white/70 hover:text-white' : 'text-[#444B5A] hover:text-[#0F6F73]'
          )}
        >
          {dict.nav.findProviders}
        </Link>

        <Link
          href={`/${locale}/login`}
          className={cn(
            'text-[13px] font-semibold px-4 py-2 rounded-[10px] no-underline transition-all duration-150',
            dark
              ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
              : 'bg-gradient-to-br from-[#0F6F73] to-[#1A9DA3] text-white hover:brightness-110'
          )}
        >
          {dict.nav.signIn}
        </Link>
      </div>
    </nav>
  );
}
