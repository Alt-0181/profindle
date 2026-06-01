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
        {/* Language pill toggle */}
        <div className={cn(
          'flex items-center rounded-full p-[3px] gap-[2px]',
          dark ? 'bg-white/10' : 'bg-[#E4E7ED]'
        )}>
          <Link
            href={`/en${pathname.slice(3)}`}
            className={cn(
              'text-[12px] font-bold px-3 py-1 rounded-full no-underline transition-all duration-150',
              locale === 'en'
                ? 'bg-white text-[#171A21] shadow-sm'
                : (dark ? 'text-white/50 hover:text-white/80' : 'text-[#9AA0AE] hover:text-[#444B5A]')
            )}
          >
            EN
          </Link>
          <Link
            href={`/th${pathname.slice(3)}`}
            className={cn(
              'text-[12px] font-bold px-3 py-1 rounded-full no-underline transition-all duration-150',
              locale === 'th'
                ? 'bg-white text-[#171A21] shadow-sm'
                : (dark ? 'text-white/50 hover:text-white/80' : 'text-[#9AA0AE] hover:text-[#444B5A]')
            )}
          >
            TH
          </Link>
        </div>

        {/* Join as Provider FREE */}
        <Link
          href={`/${locale}/signup`}
          className={cn(
            'text-[13px] font-semibold no-underline hidden sm:block transition-colors',
            dark ? 'text-white/80 hover:text-white' : 'text-[#444B5A] hover:text-[#0F6F73]'
          )}
        >
          {locale === 'th' ? (
            <>สมัครเป็นผู้ให้บริการ <strong style={{ color: '#F77F00' }}>ฟรี</strong></>
          ) : (
            <>Join as Provider <strong style={{ color: '#F77F00' }}>FREE</strong></>
          )}
        </Link>

        {/* Sign In */}
        <Link
          href={`/${locale}/login`}
          className={cn(
            'text-[13px] font-semibold px-4 py-2 rounded-[10px] no-underline transition-all duration-150',
            dark
              ? 'bg-white/12 text-white border border-white/20 hover:bg-white/20'
              : 'bg-[#171A21] text-white hover:bg-[#2A2D38]'
          )}
        >
          {dict.nav.signIn}
        </Link>
      </div>
    </nav>
  );
}
