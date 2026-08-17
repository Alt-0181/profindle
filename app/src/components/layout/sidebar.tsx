'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Dictionary } from '@/dictionaries';
import { createClient } from '@/lib/supabase/client';

interface NavItem {
  type: 'item';
  id: string;
  labelKey: keyof Dictionary['nav'];
  icon: React.ReactNode;
  href: string;
  locked?: boolean;
  badge?: string;
}

interface NavSection {
  type: 'section';
  labelKey: keyof Dictionary['nav'];
}

type NavEntry = NavItem | NavSection;

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
function BuildingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
    </svg>
  );
}
function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}
function LayoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
    </svg>
  );
}
function InboxIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

interface SidebarProps {
  locale: string;
  dict: Dictionary;
  hasCompany?: boolean;
  isAdmin?: boolean;
  leadsCount?: number;
  user?: { initial: string; fullName: string; plan: string };
}

export function Sidebar({ locale, dict, hasCompany = false, isAdmin = false, leadsCount = 0, user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}/login`);
  };

  const navEntries: NavEntry[] = [
    { type: 'item', id: 'home', labelKey: 'home', icon: <HomeIcon />, href: `/${locale}/home` },
    { type: 'item', id: 'company', labelKey: 'myCompany', icon: <BuildingIcon />, href: `/${locale}/my-company` },
    { type: 'section', labelKey: 'forProvidersSec' },
    { type: 'item', id: 'overview', labelKey: 'overview', icon: <GridIcon />, href: `/${locale}/provider-overview`, locked: !hasCompany },
    { type: 'item', id: 'leads', labelKey: 'leads', icon: <InboxIcon />, href: `/${locale}/leads`, locked: !hasCompany, badge: leadsCount > 0 ? String(leadsCount) : undefined },
    { type: 'item', id: 'portfolio', labelKey: 'portfolio', icon: <LayoutIcon />, href: `/${locale}/portfolio`, locked: !hasCompany },
    { type: 'item', id: 'package', labelKey: 'package', icon: <StarIcon />, href: `/${locale}/package`, locked: !hasCompany },
    { type: 'section', labelKey: 'forBuyersSec' },
    { type: 'item', id: 'find', labelKey: 'findProviders', icon: <SearchIcon />, href: `/${locale}/find-providers`, locked: !hasCompany },
    { type: 'item', id: 'history', labelKey: 'broadcastHistory', icon: <SendIcon />, href: `/${locale}/broadcast-history`, locked: !hasCompany },
    { type: 'section', labelKey: 'accountSec' },
    { type: 'item', id: 'settings', labelKey: 'settings', icon: <SettingsIcon />, href: `/${locale}/settings` },
    ...(isAdmin ? [{ type: 'item' as const, id: 'admin', labelKey: 'adminPanel' as const, icon: <ShieldIcon />, href: `/${locale}/admin`, badge: 'Admin' }] : []),
  ];

  const currentUser = user || { initial: 'U', fullName: 'User', plan: 'free' };

  const closeMobileMenu = () => document.body.classList.remove('sidebar-open');

  return (
    <>
    <div className="sidebar-overlay" onClick={closeMobileMenu} />
    <aside className="sidebar">
      {/* Header / Logo */}
      <div className="sidebar-header">
        <Link href={`/${locale}`} className="flex items-center no-underline">
          <img src="/assets/logo-white.svg" alt="Profindle" className="flex-shrink-0" style={{ height: '32px', width: 'auto' }} />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navEntries.map((entry, i) => {
          if (entry.type === 'section') {
            return (
              <div key={i} style={{ padding: '20px 20px 4px 20px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)' }}>
                {dict.nav[entry.labelKey]}
              </div>
            );
          }

          const isActive = pathname.includes(entry.href.split('/').slice(2).join('/'));
          const href = entry.locked ? `/${locale}/my-company?from=locked-nav` : entry.href;

          return (
            <Link
              key={entry.id}
              href={href}
              onClick={closeMobileMenu}
              title={entry.locked ? 'Add your company info to unlock' : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 20px', margin: '1px 8px',
                borderRadius: isActive ? '8px 0 0 8px' : '8px',
                fontSize: '13px', fontWeight: 500, textDecoration: 'none',
                transition: 'all 150ms',
                color: isActive ? 'white' : 'rgba(255,255,255,0.65)',
                background: isActive ? 'rgba(15,111,115,0.3)' : 'transparent',
                borderRight: isActive ? '3px solid #1A9DA3' : '3px solid transparent',
                opacity: entry.locked ? 0.6 : 1,
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'white'; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; } }}
            >
              <span style={{ flexShrink: 0, display: 'flex' }}>{entry.icon}</span>
              <span style={{ flex: 1, minWidth: 0 }}>{dict.nav[entry.labelKey]}</span>
              {entry.locked && <LockIcon />}
              {entry.badge && !entry.locked && (
                <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(247,127,0,0.2)', color: '#F77F00' }}>
                  {entry.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0F6F73] to-[#1A9DA3] flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0">
            {currentUser.initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-white truncate">{currentUser.fullName}</div>
            <div className="text-[11px] text-white/40 capitalize">{currentUser.plan} plan</div>
          </div>
          <button
            title={dict.nav.logout}
            onClick={handleLogout}
            className="w-7 h-7 flex items-center justify-center rounded text-white/30 hover:text-white/70 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
    </>
  );
}
