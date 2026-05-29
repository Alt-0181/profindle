/* ============================================================
   Profindle — Dashboard Shell (shared across all /dashboard pages)
   dashboard-shell.js  — injects sidebar + topbar HTML
   ============================================================ */

// ── Default demo user (fallback if a page hasn't set one) ───
// Single source of truth for the signed-in user in this prototype.
// Pages that render user/company chrome should READ from here instead of
// hard-coding values. To run as a different user, override before this
// script loads. See "Demo user & seed data" in HANDOFF_NOTES.md.
window.profindleDemoUser = window.profindleDemoUser || {
  initial: 'S',
  fullName: 'Somchai J.',
  firstName: 'Somchai',
  plan: 'free',            // 'free' | 'premium'
  email: 'somchai@jaidee.co.th',
  company: {
    name:    'Jaidee Solutions Co., Ltd.',
    name_th: 'บริษัท ใจดี โซลูชั่นส์ จำกัด',
  },
};

const LOGO_SVG_DARK = `<svg width="22" height="28" viewBox="-3 -3 44 56" fill="none">
  <path d="M18.56 34.56C27.3966 34.56 34.56 27.3966 34.56 18.56C34.56 9.72345 27.3966 2.56 18.56 2.56C9.72344 2.56 2.56 9.72345 2.56 18.56C2.56 27.3966 9.72344 34.56 18.56 34.56Z" stroke="white" stroke-width="5.12" stroke-linecap="round"/>
  <path d="M18.56 8.96C23.8619 8.96 28.16 13.2581 28.16 18.56" stroke="#F77F00" stroke-width="5.12" stroke-linecap="round"/>
  <path d="M5.76001 47.36C5.76001 47.36 5.76001 34.56 18.56 34.56" stroke="white" stroke-width="5.12" stroke-linecap="round"/>
  <path d="M18.56 34.56L31.36 47.36" stroke="white" stroke-width="5.12" stroke-linecap="round"/>
  <path d="M18.56 38.4C20.6807 38.4 22.4 36.6808 22.4 34.56C22.4 32.4392 20.6807 30.72 18.56 30.72C16.4392 30.72 14.72 32.4392 14.72 34.56C14.72 36.6808 16.4392 38.4 18.56 38.4Z" fill="#F77F00"/>
</svg>`;

const NAV_ITEMS = [
  { label: 'Home',          label_th: 'หน้าหลัก',     icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`, href: 'Dashboard Home.html', id: 'home' },
  { label: 'My Company',    label_th: 'บริษัทของฉัน',  icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M8 10h.01M16 10h.01M12 14h.01M8 14h.01M16 14h.01"/></svg>`, href: 'My Company.html', id: 'company' },
  { section: 'For Providers', section_th: 'สำหรับผู้ให้บริการ' },
  { label: 'Overview',      label_th: 'ภาพรวม',         icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`, href: 'Provider Overview.html', id: 'promote' },
  { label: 'Portfolio',     label_th: 'ผลงาน',           icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`, href: 'Portfolio.html', id: 'portfolio' },
  { label: 'Package',       label_th: 'แพ็กเกจ',         icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`, href: 'Package.html', id: 'package' },
  { section: 'For Buyers',  section_th: 'สำหรับผู้ซื้อ' },
  { label: 'Find Providers',label_th: 'ค้นหาผู้ให้บริการ', icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`, href: 'Find Providers.html', id: 'find' },
  { label: 'Broadcast History', label_th: 'ประวัติประกาศ', icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`, href: 'Broadcast History.html', id: 'history' },
  { section: 'Account',     section_th: 'บัญชีผู้ใช้' },
  { label: 'Settings',      label_th: 'ตั้งค่า',          icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`, href: 'Settings.html', id: 'settings' },
  { label: 'Admin Panel',   label_th: 'แอดมิน',          icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`, href: 'Admin Panel.html', id: 'admin', badge: 'Admin' },
];

function buildSidebar(activeId) {
  let html = `<aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
      <a href="Landing Page.html" class="logo">${LOGO_SVG_DARK}
        <span class="logo-wordmark logo-wordmark-inv"><span class="pro">Pro</span><span class="find">find</span><span class="le">le</span></span>
      </a>
    </div>
    <nav class="sidebar-nav">`;

  // Lock state: features in For Providers / For Buyers require company profile
  // (computed inline below so the new EN/TH toggle re-render is consistent)
  // Note: `hasCompany` removed in favour of inline check, keeping logic identical.

  let currentSection = null;
  NAV_ITEMS.forEach(item => {
    if (item.section) {
      currentSection = item.section;
      html += `<div class="nav-section-label" data-i18n-en="${item.section}" data-i18n-th="${item.section_th || item.section}">${item.section}</div>`;
    } else {
      const active = item.id === activeId ? ' active' : '';
      const badge  = item.badge ? `<span class="nav-item-badge">${item.badge}</span>` : '';
      const lockable = currentSection === 'For Providers' || currentSection === 'For Buyers';
      const locked = lockable && !window.profindleHasCompany();
      const lockIcon = locked
        ? `<svg class="nav-item-lock" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`
        : '';
      const href = locked ? 'My Company.html?from=locked-nav' : item.href;
      const cls = `nav-item${active}${locked ? ' locked' : ''}`;
      const title = locked ? ' title="Add your company info to unlock"' : '';
      const labelTh = item.label_th || item.label;
      html += `<a href="${href}" class="${cls}"${title}>${item.icon}<span data-i18n-en="${item.label}" data-i18n-th="${labelTh}">${item.label}</span>${lockIcon}${badge}</a>`;
    }
  });

  const u = window.profindleDemoUser || { initial: 'S', fullName: 'Somchai J.', plan: 'free', company: null };
  const planLabel = u.plan === 'premium' ? 'Premium plan' : 'Free plan';
  html += `</nav>
    <div class="sidebar-footer">
      <div style="display:flex;align-items:center;gap:10px;">
        <div class="avatar avatar-sm">${u.initial}</div>
        <div style="min-width:0;">
          <div style="font-size:13px;font-weight:600;color:white;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${u.fullName}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.4);">${planLabel}</div>
        </div>
        <a href="Login.html" title="Log out" style="margin-left:auto;color:rgba(255,255,255,0.35);flex-shrink:0;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </a>
      </div>
    </div>
  </aside>`;
  return html;
}

function buildTopbar(title) {
  return `<header class="page-header">
    <div style="display:flex;align-items:center;gap:12px;">
      <button id="sidebar-toggle" class="btn btn-ghost btn-sm" style="display:none;padding:7px 10px;" onclick="toggleSidebar()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
      <h1 class="page-title" data-i18n-en="${title}" data-i18n-th="${title}">${title}</h1>
    </div>
    <div style="display:flex;align-items:center;gap:12px;">
      <div class="lang-toggle" data-lang-toggle role="group" aria-label="Language">
        <button type="button" data-lang="en" onclick="profindleI18n.setLang('en')">EN</button>
        <button type="button" data-lang="th" onclick="profindleI18n.setLang('th')">TH</button>
      </div>
      <div class="avatar avatar-sm">${(window.profindleDemoUser && window.profindleDemoUser.initial) || 'U'}</div>
    </div>
  </header>`;
}

function initDashboard(activeId, pageTitle) {
  document.body.insertAdjacentHTML('afterbegin', buildSidebar(activeId));
  const main = document.querySelector('.main-with-sidebar');
  if (main) main.insertAdjacentHTML('afterbegin', buildTopbar(pageTitle));

  // Translate the freshly-injected shell + sync EN|TH toggle button
  if (window.profindleI18n) {
    window.profindleI18n.apply(document);
    // Re-sync the toggle's visual state (.active class) after we inserted it
    document.querySelectorAll('[data-lang-toggle] [data-lang]').forEach(b => {
      b.classList.toggle('active', b.dataset.lang === window.profindleI18n.getLang());
    });
  }

  // Mobile
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar-toggle').style.display = 'flex';
  }
  window.addEventListener('resize', () => {
    const t = document.getElementById('sidebar-toggle');
    if (t) t.style.display = window.innerWidth <= 768 ? 'flex' : 'none';
  });
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ── Unified company-flag helpers + dev toggle ─────────────
window.profindleHasCompany = function() {
  const v = localStorage.getItem('profindle_has_company');
  const urlFlag = new URLSearchParams(location.search).get('company');
  if (urlFlag === '1') return true;
  if (urlFlag === '0') return false;
  return v === '1' || v === 'true';
};
window.setHasCompany = function(v) {
  localStorage.setItem('profindle_has_company', v ? '1' : '0');
  location.reload();
};

// Redirect guard for gated pages — call from gated page scripts
window.profindleGuard = function(pageName) {
  if (!window.profindleHasCompany()) {
    location.replace('My Company.html?from=' + encodeURIComponent(pageName));
  }
};

// (Dev-only company-state toggle pill removed for handoff.)
