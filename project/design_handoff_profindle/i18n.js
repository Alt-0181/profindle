/* ============================================================
   Profindle — i18n (EN / TH)
   ------------------------------------------------------------
   Tiny, attribute-driven. No templating engine.

   USAGE
   ─────
   1. Add this script to every page BEFORE other scripts:
        <script src="i18n.js"></script>

   2. Mark static text by adding TH siblings to existing EN nodes:
        <h2 data-i18n-en="Welcome back" data-i18n-th="ยินดีต้อนรับกลับมา">Welcome back</h2>
        <input data-i18n-en-ph="Search…" data-i18n-th-ph="ค้นหา…">

      For text that contains inline markup, use ‑html variants
      (innerHTML is set — trust your own translations):
        <p data-i18n-en-html="Hello <b>{name}</b>" data-i18n-th-html="สวัสดี <b>{name}</b>"></p>

   3. From JS, get a translated string at any moment:
        const s = profindleI18n.t('Hello', 'สวัสดี');

   4. Listen for language change to re-render dynamic content:
        window.addEventListener('profindle:lang-change', () => renderCards());

   The current language is persisted in localStorage as
   `profindle_lang` and defaults to TH (target market is Thailand).
   ============================================================ */

(function () {
  const KEY = 'profindle_lang';
  const DEFAULT = 'th';                 // Thailand-first

  function load()   { return localStorage.getItem(KEY) || DEFAULT; }
  function save(v)  { localStorage.setItem(KEY, v); }

  let lang = load();

  function apply(root) {
    root = root || document;

    // textContent
    root.querySelectorAll('[data-i18n-en], [data-i18n-th]').forEach(el => {
      const v = el.getAttribute('data-i18n-' + lang);
      if (v != null) el.textContent = v;
    });

    // innerHTML
    root.querySelectorAll('[data-i18n-en-html], [data-i18n-th-html]').forEach(el => {
      const v = el.getAttribute('data-i18n-' + lang + '-html');
      if (v != null) el.innerHTML = v;
    });

    // placeholder
    root.querySelectorAll('[data-i18n-en-ph], [data-i18n-th-ph]').forEach(el => {
      const v = el.getAttribute('data-i18n-' + lang + '-ph');
      if (v != null) el.placeholder = v;
    });

    // aria-label
    root.querySelectorAll('[data-i18n-en-aria], [data-i18n-th-aria]').forEach(el => {
      const v = el.getAttribute('data-i18n-' + lang + '-aria');
      if (v != null) el.setAttribute('aria-label', v);
    });

    // title attr
    root.querySelectorAll('[data-i18n-en-title], [data-i18n-th-title]').forEach(el => {
      const v = el.getAttribute('data-i18n-' + lang + '-title');
      if (v != null) el.setAttribute('title', v);
    });

    // <html lang="…"> for accessibility + correct line-break behaviour
    document.documentElement.setAttribute('lang', lang);
  }

  function setLang(next) {
    if (next !== 'en' && next !== 'th') return;
    if (next === lang) return;
    lang = next;
    save(lang);
    apply();
    // Tell the page so dynamic UIs (cards, modals, etc.) can re-render
    window.dispatchEvent(new CustomEvent('profindle:lang-change', { detail: { lang } }));
    // Update visual state on any toggle button
    syncToggleUI();
  }

  function t(en, th) {
    return lang === 'th' ? (th || en) : (en || th);
  }

  function getLang() { return lang; }

  /* Show EN text with a small "EN" badge when the TH version is empty.
     Returns inner HTML — the caller is responsible for placement.   */
  function withFallback(enText, thText) {
    const tT = (thText || '').trim();
    const eT = (enText || '').trim();
    if (lang === 'th' && !tT && eT) {
      return `<span>${escapeHTML(eT)}</span> <span class="i18n-fallback-badge" title="No Thai version yet">EN</span>`;
    }
    return escapeHTML(lang === 'th' ? (tT || eT) : (eT || tT));
  }

  function escapeHTML(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  /* ── Visual sync for the EN | TH toggle (in topbar) ────── */
  function syncToggleUI() {
    document.querySelectorAll('[data-lang-toggle] [data-lang]').forEach(b => {
      b.classList.toggle('active', b.dataset.lang === lang);
    });
  }

  // Public API
  window.profindleI18n = {
    t,
    getLang,
    setLang,
    apply,
    withFallback,
  };

  // Apply on DOMContentLoaded — early enough to avoid an EN-flash
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { apply(); syncToggleUI(); });
  } else {
    apply();
    syncToggleUI();
  }
})();
