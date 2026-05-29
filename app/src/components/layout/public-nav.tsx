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
        <div className="w-8 h-8 rounded-[8px] bg-gradient-to-br from-[#0F6F73] to-[#1A9DA3] flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="11" r="6" fill="white" opacity="0.9" />
            <path d="M6 28c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
            <circle cx="22" cy="18" r="3" fill="#F77F00" />
          </svg>
        </div>
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
