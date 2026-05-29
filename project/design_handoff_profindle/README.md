# Handoff: Profindle

## Overview

Profindle is a Thai B2B service marketplace: businesses register as **service providers** (digital agencies, lawyers, accountants, designers, etc.) and **buyers** either search the directory or broadcast a request that fans out to matching providers via LINE. The product is bilingual (Thai default, English secondary) and integrates deeply with LINE Messaging API for notifications and the LIFF in-chat web view.

This bundle is the **canonical design + behavior + data model** for the production build. There are 20 HTML pages covering the full product surface (landing, auth, dashboards, profile editor, portfolio, search/broadcast, admin, LIFF) plus a shared design system, an i18n runtime, and an industries/services seed catalog.

---

## About the Design Files

The files in this bundle are **design references** — interactive HTML/JS prototypes that show intended look, copy, layout, interactions, empty/loading/error states, and bilingual behavior. They are not production code to ship as-is.

**The task is to recreate these designs in a real codebase** using its established patterns. Our recommendation for greenfield (covered in detail in `HANDOFF_NOTES.md` §1):

- **Frontend:** Next.js 14+ App Router or Remix. Tailwind on top of the existing token set in `colors_and_type.css`. Keep the `data-i18n-*` semantics behind `next-intl` / `react-i18next` with EN strings as the keys.
- **Backend:** Node + PostgreSQL. The data model in `HANDOFF_NOTES.md` §4 maps cleanly to relational tables.
- **Auth:** Email OTP + LINE OAuth.
- **Search:** Postgres `pg_trgm` for the client autocomplete + provider search; Elasticsearch / Meilisearch after ~50k providers.
- **LINE:** Messaging API webhook + LIFF + rich menus (visual spec in `LINE Rich Menus.html`, setup runbook in `LINE_OA_SETUP_GUIDE.md`).
- **Files:** S3 / R2, pre-render 4 derivatives (4:3, 4:5, 1:1, 16:9) per upload around the focal point — see `HANDOFF_NOTES.md` §10.

If a target stack is already chosen, follow its conventions and treat this bundle as the spec.

---

## Fidelity

**High-fidelity.** Pixel-precise mockups with final colors, type, spacing, micro-interactions, empty states, and copy in both Thai and English. The developer should match the design closely using the target codebase's component library. Tokens are codified in `colors_and_type.css` — port them to whatever your platform's token system is.

---

## ⭐ Read this first: `HANDOFF_NOTES.md`

`HANDOFF_NOTES.md` (446 lines, in this folder) is the **canonical engineering doc**. Don't skip it. It covers:

| § | Topic |
|---|---|
| 0a | Demo user & seed data — what's hardcoded vs. real seed vs. empty |
| 1 | Tech-stack assumptions |
| 2 | Page index — what each HTML file is |
| 3 | **The two-gate rule** — `has_company_profile` vs. `verification_status`. Don't conflate them. |
| 4 | Full data model (users, companies, services_catalog, portfolio, clients, broadcasts, broadcast_matches, premium_grants, activity_logs) |
| 5 | Email OTP auth |
| 6 | Bilingual content rules (UI strings + bilingual content fields) |
| 7 | LINE integration (rich menus, OAuth, manual UID fallback, webhook, broadcast push) |
| 8 | Premium grants — duration, stacking, audit log, banner states |
| 9 | Client autocomplete (the 150-brand directory) |
| 10 | Image upload + focal-point picker + responsive ratio system |
| 11 | Broadcast flow — 4-step canonical flow, matching algorithm v1 |
| 12 | Why service categories stay English |
| 13 | What's stubbed vs. what to build |
| 14 | What you don't have to build (already done) |
| 15 | Open product questions for kickoff |

Print it. Read it end-to-end. Then come back here.

---

## Page index

20 HTML files in this bundle. Detailed roles in `HANDOFF_NOTES.md` §2 — quick map:

**Public / auth**
- `Landing Page.html` — marketing home with service-search autocomplete
- `Login.html`, `Signup.html`, `Forgot Password.html` — email-OTP auth

**Provider dashboard (gated by `has_company_profile`)**
- `Dashboard Home.html` — welcome, Getting Started accordion, Quick Actions, Recent Activity
- `My Company.html` — bilingual profile editor + verification-doc upload + Profile Views
- `Provider Overview.html` — service-management dashboard for providers
- `Portfolio.html` — portfolio editor with focal-point image picker and 150-brand client autocomplete
- `Package.html` — premium plan picker (no real checkout)

**Buyer surfaces (gated by `has_company_profile`)**
- `Find Providers.html` — filter rail + provider directory + broadcast CTA
- `Search Providers.html` — public provider directory + profile drawer
- `Broadcast Request.html` — **canonical 4-step broadcast flow**
- `Broadcast History.html` — past broadcasts list

**Account**
- `Settings.html` — account, LINE Connect (real bot flow + manual UID fallback), notifications, password, delete-account
- `Admin Panel.html` — companies, verification queue, industries, LINE templates, activity log, premium grant modal
- `LINE Rich Menus.html` — visual spec for the 3 rich menus (`rm-main`, `rm-search`, `rm-provider`)

**LINE in-chat**
- `LIFF Broadcast Detail.html` — LIFF web view of a single broadcast with contact-reveal mechanic (Free: 12 reveals/month, Premium: unlimited)

**Legal**
- `Privacy.html`, `Terms.html`

---

## Shared infrastructure

| File | Role |
|---|---|
| `ds.css` | Design system primitives — buttons, cards, inputs, modals, alerts, pills, gradient text, avatars |
| `colors_and_type.css` | CSS custom properties for the entire color + typography token set |
| `i18n.css` | Styles for the EN/TH toggle and bilingual-field UI pattern (paired textareas, fallback badge) |
| `i18n.js` | EN/TH runtime: `profindleI18n.getLang() / setLang() / t() / withFallback() / apply()`. Reads `data-i18n-*` attributes. Default language is **TH**. |
| `dashboard-shell.js` | Injects sidebar + topbar into every gated page; defines `window.profindleDemoUser`; manages `has_company_profile` localStorage gate; provides `profindleGuard(pageName)` |
| `industries-data.js` | **Real seed data** — 39 industries × ~400 services. Ship this to production via an `/api/industries` endpoint (see `HANDOFF_NOTES.md` §0a) |

---

## What's hardcoded vs. real seed vs. empty

`HANDOFF_NOTES.md` §0a has the full breakdown, but the TL;DR:

1. **One hardcoded user** — `window.profindleDemoUser` in `dashboard-shell.js`. Every page that renders user/company chrome reads from it. Replace with your session user before the script loads (the fallback pattern `window.profindleDemoUser = window.profindleDemoUser || {…}` means an early `<script>` override wins).
2. **`industries-data.js` is real seed data** — keep it, ship it.
3. **Everything else is empty.** No fake providers, no fake broadcasts, no fake activity items. Each empty list has a no-data copy already designed.

If something looks like a real company name, it's either (a) the demo user's company (`Jaidee Solutions Co., Ltd.`), or (b) an `<input placeholder="">` value. Don't take it for production data.

---

## Interactions & behavior

These are documented per-page in `HANDOFF_NOTES.md`. Highlights worth calling out here:

- **EN/TH toggle is global.** Click sets language → fires `profindle:lang-change` event → every page re-renders dynamic strings. TH is the default.
- **The two gates** (see `HANDOFF_NOTES.md` §3) — don't gate provider/buyer features on `verification_status`. That was wrong in an earlier iteration. Gate on `has_company_profile` only; `verification_status` only controls the public Verified badge.
- **Locked sidebar items** route to `My Company.html?from=<page>` so the user knows why they bounced.
- **Broadcast flow** is the multi-step `Broadcast Request.html`, not the older single-form one inside `Find Providers.html` (kept for reference).
- **Focal-point picker** in Portfolio sets `--focal-x` / `--focal-y` custom properties that flow into `object-position`. Re-renders the same image at 5 aspect ratios live.
- **Premium grant flow** in Admin Panel is fully designed including the audit-log schema. Stacking rule: if `premium_until` is in the future, extend from that date; otherwise from today.
- **LINE Connect** in Settings supports both OAuth and a manual UID fallback (user DMs `สถานะ` / `status` to the bot, copies the returned `U…` ID, pastes it).

---

## Design tokens

All values live in `colors_and_type.css`. Quick reference (from the parent `README.md` of the design system):

**Colors**
- Primary Teal `#0F6F73` · Teal Light `#1A9DA3` · Cyan `#2BBEC5`
- Amber `#F77F00` · Amber Deep `#E06B00`
- Coral `#FF5A5F` (alerts/required)
- Charcoal `#171A21` (text) · Graphite `#444B5A` · Slate `#6B7385` · `#9AA0AE`
- Backgrounds `#FFFFFF`, `#F4F8F8`, `#F4F5F7`
- LINE green `#06C755`

**Type:** Inter, weights 400/500/600/700. Display sizes use `letter-spacing: -0.02em`. Default font-feature `cv11` on (looks nicer for Thai mixing).

**Radii:** buttons 12px · cards 16-20px · pills 999px · inputs 12px.

**Shadows:** subtle teal-tinted — `0 4px 16px rgba(15,111,115,0.08)` for cards, `0 8px 32px rgba(15,111,115,0.18)` for modals.

**Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` everywhere. 150ms micro, 200-250ms medium, 400ms entrance.

---

## Assets

- `assets/` — the Profindle logo (SVG wordmark) plus any placeholder imagery used by the prototype.
- The sidebar logo is inlined as an SVG string in `dashboard-shell.js` (`LOGO_SVG_DARK`) — extract for re-use as needed.
- No raster brand assets were provided; the wordmark in `assets/` is a constructed placeholder. Get the real logo before shipping.

---

## Files in this bundle

```
README.md                       ← this file
HANDOFF_NOTES.md                ← the engineering doc — READ THIS FIRST
LINE_OA_SETUP_GUIDE.md          ← runbook for the LINE Official Account + rich menu deploy

<20 .html pages>                ← page-by-page prototypes
ds.css                          ← design system primitives
colors_and_type.css             ← token sheet
i18n.css / i18n.js              ← EN/TH runtime
dashboard-shell.js              ← sidebar + topbar + DEMO_USER + gate helpers
industries-data.js              ← REAL seed: 39 industries × ~400 services
assets/                         ← logo + supporting imagery
```

---

## Recommended kickoff order

1. Read `HANDOFF_NOTES.md` end-to-end. (~30 min.)
2. Stand up the data model from §4 in Postgres.
3. Implement Email OTP auth (§5) + session.
4. Build `My Company.html` first — saving it is the gate (§3) for everything else.
5. Wire `window.profindleDemoUser` replacement to your session user; verify `Dashboard Home.html`, `My Company.html`, `Settings.html` hydrate correctly.
6. Build the multi-step `Broadcast Request.html` flow with the matching query from §11.
7. LINE setup using `LINE_OA_SETUP_GUIDE.md` + the rich-menu spec in `LINE Rich Menus.html`.
8. Premium grant admin flow (§8) — including the `premium_grants` audit log.
9. Everything else (search, portfolio, admin queues).
10. Settle the open product questions in §15 with your PM.

Open questions live in `HANDOFF_NOTES.md` §15 — surface them in your engineering kickoff.
