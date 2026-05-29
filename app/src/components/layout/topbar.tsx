'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Dictionary } from '@/dictionaries';

interface TopbarProps {
  locale: string;
  dict: Dictionary;
  title?: string;
  user?: { initial: string; fullName: string };
}

export function Topbar({ locale, dict, title, user }: TopbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const otherLocale = locale === 'th' ? 'en' : 'th';
  const otherPath = pathname.replace(`/${locale}`, `/${otherLocale}`);

  return (
    <header className="page-header">
      <div className="flex items-center gap-3">
        {title && (
          <h1 className="text-[18px] font-bold text-[#171A21] tracking-tight">{title}</h1>
        )}
      </div>
      <div className="flex items-center gap-3">
        {/* Language Toggle */}
        <div className="flex items-center gap-0 bg-[#F4F5F7] rounded-[8px] p-0.5">
          <Link
            href={`/en${pathname.slice(3)}`}
            className={cn(
              'px-3 py-1 text-[12px] font-semibold rounded-[6px] transition-all duration-150 no-underline',
              locale === 'en'
                ? 'bg-white text-[#0F6F73] shadow-[0_1px_4px_rgba(23,26,33,0.08)]'
                : 'text-[#9AA0AE] hover:text-[#444B5A]'
            )}
          >
            EN
          </Link>
          <Link
            href={`/th${pathname.slice(3)}`}
            className={cn(
              'px-3 py-1 text-[12px] font-semibold rounded-[6px] transition-all duration-150 no-underline',
              locale === 'th'
                ? 'bg-white text-[#0F6F73] shadow-[0_1px_4px_rgba(23,26,33,0.08)]'
                : 'text-[#9AA0AE] hover:text-[#444B5A]'
            )}
          >
            TH
          </Link>
        </div>

        {/* User Avatar */}
        {user && (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0F6F73] to-[#1A9DA3] flex items-center justify-center text-white text-[14px] font-bold cursor-pointer hover:brightness-110 transition-all">
            {user.initial}
          </div>
        )}
      </div>
    </header>
  );
}
