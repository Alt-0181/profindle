# PROFINDLE — Product, Technical & Business Handover

> **Audience:** ChatGPT (incoming Product/Strategy owner). **Author:** Claude (Design + Engineering owner).
> **Source of truth:** the actual codebase at `github.com/Alt-0181/profindle` (app under `app/`, SQL migrations at repo root), inspected directly — **not** READMEs. Where a README/doc conflicts with code, code wins and it's flagged.
>
> **Status legend:** ✅ implemented · 🟡 partial / UI-only · 🔴 planned or referenced but not implemented · ⚠️ technical debt / limitation / risk.
> **Rule:** nothing here is invented. "Cannot determine from current codebase" is used where the code doesn't say.

---

## 1. EXECUTIVE PRODUCT SUMMARY

**What Profindle is.** A Thai B2B **service-provider marketplace**. Businesses (buyers) find and contact verified service providers (agencies, firms, freelancer-companies) across ~34 industries and ~256 service types. Buyers browse/search for free and contact providers directly — primarily via **LINE**. Providers list a company profile + portfolio, can earn a "Verified" badge by uploading a DBD (Thai business registration) certificate, and can upgrade to Premium for more visibility and inbound leads.

**Core problem it solves.** Thai SMEs struggle to find trustworthy B2B service providers; discovery today is fragmented across Google, Facebook, and word-of-mouth with no verification or structured comparison. Profindle centralizes discovery + a trust signal (Verified) + a direct contact path (LINE).

**Users.** (1) **Buyers** — businesses looking to hire a service provider. (2) **Providers** — Thai service companies listing themselves. (3) **Super-admin** — the founder/operator. Note: buyers and providers are the *same account type* (a "company"); a company can be flagged `buyer_only` to opt out of receiving leads.

**Buyer value prop.** Free, no-signup browsing; verified providers; filter by service/province/budget; contact directly on LINE; optionally "broadcast" a request to many providers at once.

**Provider value prop.** Free listing + free Verified badge (via DBD); a bilingual (TH/EN) profile with portfolio; get discovered in search; **Premium** providers additionally receive **broadcast leads** via LINE and rank higher.

**How the marketplace works.** Providers create/seed profiles → become searchable → buyers discover them and contact via LINE, **or** a verified buyer posts a **broadcast request** (RFQ) that fans out a LINE notification to matching **Premium** providers, who respond.

**Primary conversion loops.**
1. **Organic discovery:** buyer searches → views provider profile → reveals contact → contacts on LINE.
2. **Broadcast:** verified buyer posts request → matching Premium providers get a LINE push → provider responds.
3. **Supply funnel:** seeded/unclaimed profile → provider is contacted to "claim" (manual, via support email/LINE) → becomes a Free provider → upgraded to Premium (manually / Early Bird).

**Current business model.** Freemium. Free listing; **Premium** (nominally ฿990/mo, currently "FREE until Dec 31 2026" via "Early Bird") unlocks broadcast leads + higher ranking. ⚠️ **There is no payment system** — Premium is a manual admin toggle (see §11).

**Key differentiation (as built).** Thai-first bilingual profiles + **DBD "Verified" trust badge** + **LINE-native** contact/notification (the dominant Thai business channel). Broadcast RFQ to providers is the standout marketplace mechanic.

**Stage.** **Pre-launch / cold-start.** Production has ~0 real providers (seeded/mock data only), no payments, several demo stubs still shipped, and the supply-seeding tooling was just built. It is a functional MVP with real auth, DB, search, broadcast, and LINE — but no monetization or automated verification yet.

---

## 2. COMPLETE TECH STACK

### Frontend
- **Framework:** Next.js **16.2.6**, App Router. ⚠️ **Customized fork/build** — `app/AGENTS.md` warns "This is NOT the Next.js you know"; concrete proof: middleware is `src/proxy.ts` exporting `proxy()` (not `middleware.ts`/`middleware()`).
- **React:** 19.2.4 / React DOM 19.2.4. **TypeScript:** ^5, `strict: true`, path alias `@/* → ./src/*`.
- **Styling:** **inline styles dominate** (`style={{…}}` ~1428 uses vs `className` ~100). **Tailwind v4** is installed and imported in `globals.css` but barely used as classes. `globals.css` holds the real design tokens (CSS custom properties) + a few layout classes (`.sidebar`, `.page-body`, dashboard shell, mobile media queries).
- **UI/component libs:** ⚠️ **none actually used.** `@radix-ui/*`, `lucide-react`, `react-hook-form`, `@hookform/resolvers`, `zod`, `zustand`, `next-intl` are all **declared in `package.json` but never imported** in `src/`. Icons are hand-written inline SVGs. Forms are hand-rolled `useState`. **No form/validation library is actually wired.**
- **Fonts:** Inter + Noto Sans Thai (Google Fonts via `<link>` in `layout.tsx` and `@import` in `globals.css`).
- **State management:** local React state only (`useState`/`useRef`). No global store.
- **i18n:** hand-rolled (see §12); `next-intl` unused.

### Backend
- **Runtime:** Next.js server components + **Route Handlers** (`app/src/app/api/**/route.ts`). No separate backend service. No Server Actions used (mutations go through client Supabase or `/api` routes).
- **Background processing:** 🔴 none (no queues, cron, or workers). Broadcast fan-out is synchronous within the request via `Promise.allSettled`.
- **Validation:** ⚠️ manual, ad-hoc (typeof/regex checks in routes). No zod despite being installed.
- **Business logic:** lives in route handlers + `src/lib/*` (`line.ts`, `notify.ts`, `enrich-company.ts`, `services.ts`, `supabase/*`).

### Database
- **Provider:** **Supabase** (Postgres + RLS + Storage + Auth).
- **Query layer:** `@supabase/supabase-js` (^2.106) + `@supabase/ssr` (^0.10). **No ORM.** Two client factories: `src/lib/supabase/server.ts` (cookie/RLS-scoped) and `client.ts` (browser). Service-role client instantiated inline in privileged routes.
- **Schema management:** ⚠️ **loose `supabase-*.sql` files at repo root, applied by hand** — no migration tool. Columns are added incrementally across files.
- **Major tables:** `companies`, `portfolio_projects`, `broadcasts`, `broadcast_matches`, `contact_clicks`, `profile_views`, `early_bird_claims`, `platform_services`, `line_message_templates`. ⚠️ `broadcast_events` exists **only in code**, no SQL. (Full model in §4.)
- **Storage buckets:** `portfolio-images` (public), `company-docs` (private, for DBD certificates).

### Authentication
- **Provider:** Supabase Auth (email/password + OTP email verify).
- **Login/signup:** **client-side** (`supabase.auth.signUp` + `verifyOtp` in `signup/page.tsx`; `signInWithPassword` in `login`). ⚠️ `api/auth/send-otp` and `verify-otp` are **live demo stubs** (fake success) and are **not** used by real signup.
- **Sessions:** Supabase cookies via `@supabase/ssr`.
- **Roles:** `auth.users.user_metadata.role === 'super_admin'` = admin. No DB roles table. Buyer/provider are the same account (a company row); `buyer_only` flag opts out of leads.

### Infrastructure
- **Hosting/CDN:** ⚠️ **not committed in repo** — no `vercel.json`/`netlify.toml`/`Dockerfile`/`.github/`. Vercel is strongly implied (Next.js + boilerplate + auto-deploy-on-push convention). "Cannot determine host from codebase" with certainty.
- **Deploy:** auto on git push to `main` (prod) and `staging` (UAT), kept identical.
- **Domains:** `profindle.com` (prod), `uat.profindle.com` (UAT).
- **Storage:** Supabase Storage. **Email:** Resend. **Monitoring/logging/error-tracking:** 🔴 none (no Sentry, no logging service). **Analytics:** 🔴 no external analytics (see §16).

### External integrations (all via env vars; **values never exposed**)
| Service | Purpose | Env vars |
|---|---|---|
| **Supabase** | DB, Auth, Storage | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| **LINE Messaging API** | push broadcast leads, webhook | `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET` |
| **LINE Login** | provider connects their LINE OA identity | `LINE_LOGIN_CHANNEL_ID`, `LINE_LOGIN_CHANNEL_SECRET` |
| **LINE (admin alerts)** | push admin notifications | `LINE_ADMIN_UID` |
| **Anthropic** | AI autofill / URL enrichment (`claude-haiku-4-5`) | `ANTHROPIC_API_KEY` |
| **Resend** | admin email alerts | `RESEND_API_KEY` |
| **Site config** | URLs, view-hash salt | `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SITE_URL`, `VIEW_HASH_SALT`, `NODE_ENV` |

DBD "verification" is **not** an integration — no DBD registry API; certificates are uploaded files only (see §9).

---

## 3. CODEBASE ARCHITECTURE

```
/app                         ← the Next.js project
  /src
    /app
      /[lang]                ← locale-prefixed routes (en|th)
        /(dashboard)         ← authenticated route group (shared layout gates auth)
          /home  /my-company  /provider-overview  /portfolio  /package
          /find-providers  /broadcast-request  /broadcast-history
          /settings  /admin  /admin/import
        /search-providers    ← public provider search
        /providers/[id]      ← public provider profile (dynamic, service-role)
        /broadcasts/[id]     ← public broadcast detail
        /login /signup /forgot-password /reset-password /privacy /terms
        layout.tsx           ← locale validation + SEO metadata
      /api                   ← Route Handlers (see §14)
      layout.tsx  globals.css  sitemap.ts  opengraph-image.tsx
    /components/layout       ← sidebar.tsx, topbar.tsx, public-nav.tsx (shared chrome)
    /dictionaries            ← en.json, th.json, index.ts (server-only)
    /lib                     ← supabase/{server,client}.ts, line.ts, notify.ts,
                               enrich-company.ts, services.ts, utils.ts
  /scripts                   ← one-off: create-accounts.mjs, migrate-company-branding.mjs
/supabase-*.sql              ← schema migrations + seed (repo root)
/*.md                        ← docs (this file, PITCH, TECH_STACK, pitching.md, growth-plan…)
```

- **Server vs client:** pages are **server components by default** (async, fetch via Supabase). Client components (`'use client'`) are the interactive leaves: auth forms, `search-client`, `portfolio-client`, `company-form`, `admin-client`, `broadcast-request-client`, `contact-card`, `view-tracker`, `location-map`, sidebar/topbar.
- **Data fetching:** server components read via `@/lib/supabase/server` (RLS-scoped). Public pages needing all data (`providers/[id]`, `search-providers`, `sitemap`, admin) use the **service-role** client to bypass RLS.
- **Mutations:** split — simple/auth writes go **client-side** via Supabase directly (login, signup, profile save, portfolio CRUD); side-effectful/privileged ops go through **`/api` routes** (broadcasts, uploads, LINE, admin, tracking, delete-account) that re-check auth server-side.
- **Error handling / loading:** ad-hoc per component (try/catch → `saveError` state, inline messages). No global error boundary/toaster system. Loading = local `busy`/`saving` booleans.
- **Auth checks:** centralized in `(dashboard)/layout.tsx` (redirect if no user); admin pages + `/api/admin/*` re-check `super_admin`.
- **Shared utilities:** `lib/services.ts` (the 34-industry / 256-service catalog, single source of truth), `lib/line.ts`, `lib/notify.ts`, `lib/enrich-company.ts`.

---

## 4. DATABASE / DATA MODEL

**`companies`** (`supabase-schema.sql` + ~10 migration files) — the central entity; represents a provider **and/or** buyer.
- Key fields: `id`, `user_id`→auth.users (SET NULL), `name`, `name_th`, `description`, `description_th`, `province`, `services text[]`, `industry`, `verified bool`, `premium bool`, `plan text CHECK(free|vip|premium)`, `plan_expires_at`, `views int`, `website`, `phone`, `email`, `address`, `line_id` (public contact), `line_user_id` (LINE push target), `line_display_name`, `logo_initial`, banner fields (`banner_url_mobile`, `banner_focus_*`, `banner_zoom*`), `social_facebook/instagram`, `dbd_certificate_url`, `dbd_certificate_name`, `team_size`, `founded_year`, `buyer_only bool`, **`claimed bool default true`**, **`source text default 'signup'`** (seeded vs signup), `created_at`, `updated_at`.
- **Created by:** a user on signup (client insert) OR admin bulk-import (seeded, `claimed=false`). **Read:** public (RLS SELECT true). **Edit:** owner (`user_id = auth.uid()`) or admin.
- **Rules:** one company per user (by convention); seeded profiles have `user_id=null, claimed=false`.

**`portfolio_projects`** (`supabase-portfolio.sql` + images/services/challenge migrations) — showcase projects per company. Fields: `id`, `company_id`→companies (CASCADE), `title`, `client`, `confidential bool`, `year`, `budget`, `category`, `description(_th)`, `results(_th)`, `challenge(_th)`, `images text[]`, `services text[]`, `cover_color`, `sort_order`. **Owner-write, public-read** (RLS). Confidential → `client` hidden.

**`broadcasts`** (`supabase-line.sql`) — buyer RFQs. Fields: `id`, `buyer_user_id`→auth (SET NULL), `buyer_company_id`→companies (SET NULL), `category`, `title`, `description_en/_th`, `budget_band`, `timeline`, `location_pref`, `status CHECK(active|closed|expired)`, `expires_at (now+14d)`. **Created by** verified buyers; owner-scoped read (RLS).

**`broadcast_matches`** (`supabase-line.sql`) — provider↔broadcast pairing + response. Fields: `id`, `broadcast_id`→(CASCADE), `provider_company_id`→(CASCADE), `matched_at`, `notified_at`, `provider_response CHECK(no_reply|interested|declined)`, `responded_at`. **Unique(broadcast_id, provider_company_id).** Buyer and provider can each read their own (RLS).

**`broadcast_events`** ⚠️ — analytics (view/click) on broadcast detail. **Defined only in code** (`broadcasts/track` writes, `broadcast-history` reads). No SQL, no known RLS/FK. Must be created out-of-band.

**`contact_clicks`** (`supabase-claim-and-leads.sql`) — anonymous contact-channel clicks. Fields: `id`, `company_id`→(CASCADE), `channel (reveal|line|phone|email|website)`, `created_at`. **No buyer identity/IP.** RLS enabled, **no policies (service-role only).** ⚠️ **Write-only — never read/surfaced anywhere.**

**`profile_views`** (`supabase-profile-views.sql`) — deduped daily views. Composite PK `(company_id, viewer_hash, viewed_on)`; `viewer_hash` = salted SHA-256 of IP+UA (raw IP never stored). **Trigger `bump_company_views` (SECURITY DEFINER)** increments `companies.views` on each new row. RLS deny-all (service-role).

**`early_bird_claims`** (`supabase-early-bird.sql`) — Premium request queue. Fields: `id`, `user_id`→(CASCADE), `company_id`→(SET NULL), `company_name`, `user_email`, `status CHECK(pending|granted|dismissed)`, `resolved_at`. Partial unique: one pending per user. RLS deny-all.

**`platform_services`** (`supabase-admin-tables.sql`) — admin-editable service catalog. `id`, `label UNIQUE`, `industry`, `deleted_at` (soft delete). ⚠️ RLS not enabled in SQL. (Note: the app mostly uses the hardcoded `lib/services.ts` catalog; this table is a parallel admin-managed copy.)

**`line_message_templates`** (`supabase-admin-tables.sql`) — `id (text PK)`, `name`, `content`. Seeded: `welcome`, `verified`, `broadcast`. ⚠️ RLS not enabled.

**`auth.users`** (Supabase-managed) — identity. `user_metadata.role` carries `super_admin`. FKs from companies/broadcasts/early_bird_claims.

### ASCII ER diagram
```
auth.users ──1:1(SET NULL)──> companies ──1:N(CASCADE)──> portfolio_projects
   │                              │  ▲
   │                              │  └── views ++ (trigger from profile_views)
   ├──(SET NULL)── broadcasts ────┘ (buyer_company_id)
   │                   │
   │                   └──1:N(CASCADE)──> broadcast_matches ──(CASCADE)──> companies (provider)
   │                                            └····> broadcast_events (code-only, logical)
   └──(CASCADE)── early_bird_claims ──(SET NULL)──> companies

companies ──1:N(CASCADE)──> contact_clicks
companies ──1:N(CASCADE)──> profile_views
platform_services (standalone)   line_message_templates (standalone)
Storage: portfolio-images (public), company-docs (private, DBD)
```

---

## 5. COMPLETE FEATURE INVENTORY

### Buyer
- **Landing page** ✅ — `/[lang]` marketing page with hero search. (An "AI Search" entry was built but is **hidden behind a flag** and archived on branch `ai-search-archive` — 🔴 not live.)
- **Provider search** ✅ — `/[lang]/search-providers`. Two-field hero (service + "additional info"). Client-side substring filter (see §8).
- **Search filters** ✅ — Verified toggle, Province dropdown, Budget dropdown (budget derived from providers' portfolio budgets). No industry filter surfaced. Sort: Relevance / Most viewed / A–Z.
- **Provider discovery / profile** ✅ — `/[lang]/providers/[id]`: about, services, portfolio carousel, location map (Google Maps embed from a pasted URL), stats (views/services/projects/founded), contact card. **Unclaimed** profiles hide contact and instead show "similar Verified providers" + a "contact Profindle to claim" block.
- **Contact flow** ✅ — a **"View contact"** button reveals LINE/phone/email/website; reveal + each click logged anonymously (`contact_clicks`). Buyer contacts off-platform (LINE).
- **Broadcast request** ✅ — `/[lang]/broadcast-request` (auth + verified buyer). Multi-step: service → details → budget/timeline → review → submit. Fan-out to Premium providers via LINE.
- **Broadcast history** ✅ — `/[lang]/broadcast-history`: past requests + match/event counts.
- **Account** ✅ — signup/login/settings/delete-account.
- 🔴 **Reviews/ratings, favorites/shortlists, in-app messaging, saved searches** — none.

### Service Provider
- **Registration/auth** ✅ — client-side Supabase signup + email OTP; login; password reset.
- **Onboarding** 🟡 — no guided wizard; provider lands on `/home`, must go to `/my-company` to build profile. Dashboard nav items are "locked" until a company exists.
- **Company profile** ✅ — `/my-company`: bilingual name/description, province, services (multi-select from catalog), industry, team size, founded year, website/phone/email/LINE id, **Google Maps link** (address field), logo + banner (with focus/zoom), socials.
- **AI autofill** ✅ — paste website URL → Claude Haiku fills name/desc/services/province/etc. (`/api/company/autofill`).
- **Services / industries / location** ✅ — chosen from the catalog; province from a fixed list.
- **Portfolio** ✅ — `/portfolio`: up to 5 images per project, client, year, budget, per-project services (constrained to the company's own services), EN/TH description/challenge/results, confidential toggle, delete.
- **Verification / DBD** 🟡 — upload DBD cert to private storage; a **super-admin manually flips `verified`** (no automated check).
- **LINE connection** ✅ — connect via LINE Login OAuth or manual UID (`line_user_id`); required to receive broadcast leads. Premium-gated in settings UI.
- **Lead / broadcast receiving** ✅ (Premium only) — LINE Flex push on matching broadcasts.
- **Plans / Premium** 🟡 — Package page + Early Bird "claim"; **no checkout** (admin grants).
- **Profile visibility** ✅ — searchable once a company exists; ranking premium→verified→views.
- **Settings** ✅ — LINE connect, notification toggles (🟡 UI-only), delete account.
- **Analytics** 🟡 — `/provider-overview`: Profile Views, Broadcast Matches, Active Services. ⚠️ contact-click/lead counts are **not surfaced** despite being collected.

### Admin (super-admin only)
- **Companies** ✅ — view all, toggle `verified`, toggle `premium`, set/unlink `line_user_id`, delete company.
- **Verification queue** ✅ — companies with a DBD doc + `verified=false`; admin eyeballs doc → clicks Verify (manual boolean).
- **Users** ✅ — list all auth users, delete user (+ their company).
- **Early Bird** ✅ — grant (→ Premium) / dismiss claims.
- **Services/Industries** ✅ — manage `platform_services` catalog (add/soft-delete).
- **LINE Templates** ✅ — edit welcome/verified/broadcast templates.
- **LINE Config** ✅ — view linked companies, unlink; KPI tiles are hardcoded "—".
- **Requests** ✅ — read-only broadcast list + match counts.
- **Import** ✅ — bulk-insert seeded/unclaimed providers; AI URL enrichment (`/admin/import`).
- 🔴 **Activity Logs** — "Coming Soon" placeholder; **no admin audit trail**.
- 🔴 **Change user role** — no route mutates `user_metadata.role`.

---

## 6. END-TO-END USER JOURNEYS

**Buyer discovery** ✅: Landing → search-providers (type service + optional "who/where") → results (client-filtered) → provider profile → "View contact" (logged) → contact on LINE. *No account required.*

**Broadcast** ✅ (with gates): Dashboard/`find-providers` → `broadcast-request` → pick service → details → budget/timeline → review (shows live match count via `/api/broadcasts/preview`) → submit (`/api/broadcasts`) → matches inserted → LINE push to matching **Premium** providers who have `line_user_id` → provider taps "View & Respond" → `/broadcasts/[id]`. **Gates:** buyer must be **verified**; **4 broadcasts/user/month**.

**Provider onboarding** 🟡: Signup (Supabase) → email OTP verify → `/home` → `/my-company` (build profile, optionally autofill from URL) → add services → add portfolio → upload DBD → **wait for admin to flip `verified`** → connect LINE → discoverable → (Premium) receive leads. ⚠️ No guided wizard; verification and Premium are manual/async.

**Provider lead** ✅: Broadcast created → flat filter match → LINE Flex push (Premium + `line_user_id` only) → provider views opportunity → contacts buyer / marks response. ⚠️ Response tracking (`provider_response`) exists in schema; "Cannot determine from codebase" whether a provider-facing UI writes it beyond the broadcast detail page.

**Paid conversion** 🔴: Free → Premium upsell (Package page / Early Bird) → **no checkout / no payment** → admin manually grants Premium → activation is the boolean flip. Renewal/expiry: `plan_expires_at` exists but **no code enforces expiry** ("Cannot determine" any cron/expiry job — none found).

---

## 7. MATCHING & MARKETPLACE LOGIC

**This is a flat boolean filter, not an algorithm.** (`api/broadcasts/route.ts`)

```
POST /api/broadcasts:
  require logged-in user
  buyer = company where user_id = user.id
  require buyer.verified                         # else 403
  require category and (descTh or descEn)
  if broadcasts_this_month(buyer) >= 4: 429       # 4/user/calendar-month
  broadcast = insert(...)
  providers = companies
      WHERE id != buyer.id
        AND premium = true                        # ⚠️ Premium ONLY
        AND services @> [category]                # array contains the service
      LIMIT 50                                     # ⚠️ no ORDER BY → arbitrary 50
  providers = providers.filter(not buyer_only)
  insert broadcast_matches for ALL providers
  for p in providers where p.line_user_id:        # push only to LINE-connected
      LINE.pushMessage(p.line_user_id, flex); mark notified_at
  return {matched, notified}
```

- **Service matching:** exact array-contains on `services` (the buyer picks one category). **No fuzzy/synonym/related-service.**
- **Industry / location / budget / timeline matching:** 🔴 **none.** `location_pref`, `budget_band`, `timeline` are stored/displayed but **never used to filter or rank** providers.
- **Verification requirement:** buyer must be verified to send; providers are **not** filtered by verified.
- **Premium prioritization:** absolute — **only Premium providers are matched/notified.** Free providers never receive broadcasts.
- **Ranking / scoring / randomness:** none. Arbitrary DB order, capped at 50 (nondeterministic if >50 match).
- **Manual/admin intervention:** none in matching.

**⚠️ Marketplace implication:** with few Premium providers, most broadcasts match **0** (as observed). The preview count uses a slightly different filter (no `buyer_only` exclusion, no 50 cap), so preview can differ from actual.

---

## 8. SEARCH & DISCOVERY LOGIC

- **Mechanism** (`search-providers/page.tsx` + `search-client.tsx`): server loads **ALL companies** (`ORDER BY premium DESC, views DESC`, **no WHERE, no LIMIT**) **and ALL portfolio_projects**, ships them to the client; the client does `Array.filter` substring matching.
- **`q` (service field)** matches (case-insensitive `includes`): any `services[]`, `name`/`name_th`, `description`/`description_th`.
- **`where` (additional-info field)** matches: portfolio `client`/`title` text, `province`, or `address`. (This is how "who did X for POP MART" works — portfolio client is searchable via `where`.)
- **Filters:** Verified toggle, Province (exact match), Budget (from portfolio budgets). **No industry filter** (despite metadata claiming otherwise).
- **Sorting:** default "relevance" = `premium DESC → verified DESC → views DESC` (⚠️ **not** relevance to the query). Plus "Most viewed" and "A–Z".
- **Pagination:** 🔴 **none** — all matches render at once.
- **Full-text / index:** 🔴 none. No Postgres FTS, no tokenization, **no Thai word segmentation** (Thai has no spaces — substring matching is fragile for Thai).
- **Ranking of unclaimed:** ⚠️ unclaimed profiles are **not** down-ranked (no `claimed` factor in sort).

**⚠️ Weaknesses:** (1) doesn't scale — whole table to client on every search; (2) query-specific result pages aren't SEO-indexable (single canonical, client-only filtering); (3) no synonyms/cross-language (must fill both EN + TH); (4) no pagination/relevance.

---

## 9. VERIFICATION & TRUST SYSTEM

- **DBD upload** ✅ (real): `POST /api/dbd-upload` → private bucket **`company-docs`** (10MB, PDF/image), path namespaced by `user.id`; stores `dbd_certificate_url/name`. `dbd-url`/`dbd-download` give signed URLs with per-user ownership guards. **The file is stored, never parsed or checked against any registry.**
- **Verified badge** 🟡 (status only): `companies.verified` is a **manual boolean an admin flips** (`/api/admin/companies` PATCH). **No automated DBD lookup, OCR, or registry API.** An admin can verify a company with **no** DBD doc; uploading a DBD does **not** auto-verify. The admin "queue" is just `!verified && dbd_certificate_url`.
- **Pro/Premium status:** `premium`/`plan` flags — visibility, not trust.
- **Public trust signals:** ✓ Verified badge, ✦ Premium badge, Unclaimed chip.
- **Fraud prevention:** 🔴 none beyond admin discretion. Nothing binds the uploaded DBD to the company's real legal identity.

**Bottom line:** verification is **human-in-the-loop, document-assisted, but not automated or cryptographically/registry-verified.** The badge means "an admin decided this is legit."

---

## 10. LINE INTEGRATION

- **Two identities:** `line_id` = public **display** contact (parsed `oa:`/`id:`/`phone:` for a contact button); `line_user_id` = the connected **push target** (`^U[a-f0-9]{32}$`).
- **Connect** ✅: (A) **LINE Login OAuth** — `/api/line/auth` → LINE authorize → `/api/line/callback` (state cookie, token+id_token verify, stores `line_user_id`+`line_display_name`, welcome push, admin notify). (B) **Manual UID** — `/api/line/connect` POST (validated, welcome push); DELETE unlinks. Admin can unlink.
- **Messaging** ✅: `lib/line.ts` → `pushMessage`/`replyMessage` to `api.line.me/v2/bot/*` with `LINE_CHANNEL_ACCESS_TOKEN`. `makeBroadcastFlexMessage` builds the lead card (category/budget/timeline/from + "View & Respond →" linking to `/broadcasts/[id]`).
- **Webhook** ✅: `/api/line/webhook` — HMAC-SHA256 signature verified (`LINE_CHANNEL_SECRET`, `timingSafeEqual`). Handles `follow` (welcome), text `get uid` (replies UID), `status/สถานะ` (replies plan). `unfollow` deliberately keeps `line_user_id`.
- **Admin alerts:** `notifyAdminLine` → `LINE_ADMIN_UID`.
- **When messages trigger:** provider connect (welcome), new broadcast (lead push to matching Premium providers with `line_user_id`), webhook replies, Early Bird claim (admin alert).
- **Failure handling:** push failures are non-fatal (`Promise.allSettled`, collected as `pushErrors`).
- **Rate limits:** ⚠️ subject to LINE OA quotas (free OA ~500 pushes/mo) — **not tracked in app**. "Messages Sent/Delivery Rate" admin tiles are hardcoded "—".
- ⚠️ **One OA, one webhook URL** — connecting (login callback/webhook) can point to only one environment (UAT *or* prod); push works from either with the token.

**End-to-end:** provider connects LINE → verified buyer posts broadcast → premium+service match → Flex push → provider taps → responds.

---

## 11. PAYMENT & MONETIZATION SYSTEM

- **Plans:** `companies.plan CHECK(free|vip|premium)` + legacy `premium bool` + `plan_expires_at`. UI shows only **Free (฿0)** and **Premium (฿990/mo, struck-through, "FREE until Dec 31 2026")**; "vip" never surfaced. Prices are **hardcoded literals** in `package/page.tsx`, not from DB.
- **Payment gateway:** 🔴 **none.** Repo-wide search for stripe/omise/2c2p/gbprimepay/paypal/checkout/billing → **zero.** No SDK, no webhook, no products/prices.
- **How Premium is granted:** ✅ manually — super-admin toggles `premium`/`plan`, **or** grants an **Early Bird** claim (`/api/admin/early-bird` → `premium:true, plan:'premium'`).
- **Early Bird** 🟡: provider clicks "Claim" → `/api/notify/early-bird` inserts a `pending` `early_bird_claims` row + emails/LINEs admin → admin later **manually grants**. It is a **request queue, not a purchase**.
- **Expiry/renewal/cancellation/failed payments/tax/invoice:** 🔴 none. `plan_expires_at` exists but **no code enforces it**.

**Summary:** ✅ plan flags + UI; 🟡 Early Bird request flow; 🔴 **no real billing whatsoever.**

---

## 12. BILINGUAL / THAI + ENGLISH SYSTEM

- **Architecture:** custom, **URL-based** — all routes under `/[lang]` (`en`|`th`), **default `th`**. Middleware `src/proxy.ts` sniffs `Accept-Language` and redirects un-prefixed paths. `next-intl` is installed but **unused**.
- **Dictionaries:** `src/dictionaries/{en,th}.json` (15 top-level keys: nav, landing, auth, dashboard, myCompany, search, broadcast, settings, admin, portfolio, package, providerOverview, broadcastHistory, findProviders, common), loaded via `getDictionary` in ~15 server pages.
- ⚠️ **Inconsistency:** ~171 inline `lang === 'th' ? … : …` ternaries across 24 files — a large share of UI strings **bypass the dictionaries** (hardcoded inline, including client components). Translations are split between JSON and inline code.
- **DB bilingual fields:** `name/name_th`, `description/description_th`, portfolio `description/_th`, `results/_th`, `challenge/_th`, broadcast `description_en/_th`.
- **Persistence:** 🔴 none — no cookie/localStorage/`NEXT_LOCALE`. Language is purely the URL prefix; fresh visits default to `th` via Accept-Language.
- **SEO localization:** hreflang alternates on the 4 metadata pages; canonical per-lang.
- **Fallback:** unknown locale → `notFound()`.

**Constraint for future work:** every user-facing string needs EN + TH; search is language-siloed (fill both), so any content feature must be bilingual.

---

## 13. CURRENT DESIGN SYSTEM

Tokens live in `globals.css`; usage is mostly **inline styles** (no component library).
- **Brand teal:** `#0F6F73` (primary), `#1A9DA3`, `#2BBEC5`, `#F0F9F9` (teal bg). **Premium amber:** `#F77F00`, `#E06B00`, `#FFF6EC`. **Danger:** `#FF5A5F`/`#D32F2F`.
- **Neutrals:** `#171A21` (primary text), `#444B5A`, `#6B7385`, `#9AA0AE` (muted), `#E4E7ED` (border), `#F4F5F7` (page bg), white surface.
- **Gradients:** primary `135deg #0F6F73→#1A9DA3`; premium `135deg #F77F00→#E06B00`; hero dark `#0E1017→#0F6F73`.
- **Radii:** 4/8/12 (btn, card, input) / 20 (card-lg) / 999 (pill). **Shadows:** low/med/high + teal. **Motion:** `cubic-bezier(0.4,0,0.2,1)`, 150/250/400ms; keyframes fadeIn/shake/pulse/slideIn.
- **Type:** Inter + Noto Sans Thai, 400–700.
- **Components:** ⚠️ **mostly individually inline-styled**, not shared. Genuinely shared: `sidebar`, `topbar`, `public-nav`, `LineContactRow`, `ContactCard`, `LocationMap`. Buttons/cards/badges/inputs are re-declared inline per screen → **styling drift risk**.
- **Responsive:** mobile media queries in `globals.css` (sidebar collapse at 768px); inline styles use fl/grid.
- **Dark mode:** 🔴 not implemented (dark is used only for hero/marketing surfaces).

**Design debt:** no shared component primitives; ~1428 inline `style={{}}` blocks; two style systems (inline + a barely-used Tailwind).

---

## 14. CURRENT INFORMATION ARCHITECTURE

**Public:** `/` (→`/th`) · `/[lang]` landing · `/[lang]/search-providers` · `/[lang]/providers/[id]` · `/[lang]/broadcasts/[id]` · `/[lang]/login|signup|forgot-password|reset-password` · `/[lang]/privacy|terms` · `/not-found`.

**Authenticated `(dashboard)`** (gated by group layout): `/[lang]/home` · `/my-company` · `/provider-overview` · `/portfolio` · `/package` · `/find-providers` · `/broadcast-request` · `/broadcast-history` · `/settings`.

**Admin (super_admin):** `/[lang]/admin` · `/[lang]/admin/import`.

**API** (see §5/§7/§10 for detail): `auth/*`, `broadcasts(+preview,track)`, `companies` (GET real / POST stub), `company/autofill`, `company-upload`, `portfolio-upload`, `portfolio-image`, `dbd-upload|url|download`, `contact-click`, `profile-view`, `industries`, `search` (🔴 stub), `delete-account`, `notify/early-bird`, `line/{auth,callback,connect,webhook}`, `admin/{users,companies,templates,services,early-bird,line/unlink,import-companies,enrich-urls}`.

**Navigation:** sidebar sections — *(top)* Home, My Company · *For Providers* Overview, Portfolio, Package (locked until a company exists) · *For Buyers* Find Providers, Broadcast History · *Account* Settings, Admin (if super_admin). Topbar: mobile toggle, EN/TH switch, user menu.

---

## 15. BUSINESS RULES (from code)

- **Provider = a `companies` row** owned by a user (`user_id`), or seeded (`claimed=false, user_id=null`).
- **Discoverability:** any company with a `name` appears in search (no completeness gate).
- **Verified** = admin flips `verified` (DBD upload optional, not enforced).
- **Broadcast eligibility:** sender must have a company that is **verified**; **4 broadcasts/user/calendar-month**.
- **Broadcast recipients:** only **Premium**, non-`buyer_only` companies whose `services` contain the category, capped at 50; only those with `line_user_id` are pushed.
- **`buyer_only`** companies never receive leads.
- **Contact visibility:** claimed → contact shown (behind "View contact"); **unclaimed → contact hidden**, redirect to similar Verified providers + "contact Profindle to claim".
- **Portfolio:** 5 image slots/project; per-project services must be a **subset of the company's services**; confidential hides client.
- **Views:** 1 per (viewer-hash, day); provider's own refresh doesn't inflate.
- **Premium:** granted only by admin or Early Bird grant. `plan_expires_at` not enforced.
- **Account:** one company per user (convention); user can delete own account (cascades company).
- **Admin:** `user_metadata.role==='super_admin'`; can verify/premium/delete/import; **cannot** change roles or see audit logs.

---

## 16. ANALYTICS & TRACKING

- **Tracked** ✅: `profile_views` (deduped/day, hashed IP), `contact_clicks` (channel; anonymous), `broadcast_events` (view/click; ⚠️ code-only table), `broadcast_matches` (matches + notified_at).
- **External analytics:** 🔴 **none** (no GA/PostHog/Mixpanel/Plausible/Segment). **Error tracking:** 🔴 none (no Sentry).
- **Shown to providers:** Profile Views, Broadcast Matches, Active Services (`provider-overview`). Buyers: per-broadcast matches + (if events exist) views/contacts.

**⚠️ Metrics that CANNOT be measured today:** signup→activation funnel; search queries/no-result rate; view→contact→lead conversion; **contact-click counts per provider (collected but never surfaced — the intended conversion hook is dead-ended)**; Premium conversion; retention/repeat usage; LINE delivery rate; time-series of views (only a cumulative integer).

---

## 17. SEO / ACQUISITION ARCHITECTURE

- ✅ Root metadata (title template, keywords EN/TH, OG, Twitter, robots index/follow). Dynamic `generateMetadata` on landing, `search-providers`, and **`providers/[id]`** (per-company title/desc/canonical/hreflang/OG `profile`). Dynamic `sitemap.ts` (all companies × 2 locales). Dynamic `opengraph-image.tsx`. Static `robots.txt`.
- 🔴 **No JSON-LD / schema.org** (no LocalBusiness/Organization/BreadcrumbList) — a big miss for a directory.
- 🔴 **No SEO landing pages** for services, industries, or provinces — the highest-leverage organic play ("Top CRM agencies in Bangkok") **does not exist**.
- ⚠️ Search results aren't per-query indexable (client-side filtering, single canonical).

**Opportunity:** programmatic SEO (service × province pages) + schema.org on provider pages could be the primary acquisition channel; currently only the homepage + individual provider pages are meaningfully indexable.

---

## 18. NOTIFICATIONS

| Trigger | Recipient | Channel | Status |
|---|---|---|---|
| New broadcast | matching Premium providers (w/ `line_user_id`) | LINE Flex push | ✅ |
| Provider connects LINE / follows OA | that provider | LINE reply (welcome) | ✅ |
| Early Bird claim | admin (`support@profindle.com` + `LINE_ADMIN_UID`) | Email (Resend) + LINE | ✅ |
| Signup / OTP / password reset | end user | Email via **Supabase Auth** (not app code) | ✅ external |
| Company verified | provider | template exists but **no code sends it** | 🟡 unwired |
| Profile view / "system" | provider | none | 🔴 (settings toggle is UI-only) |
| Contact click / lead | provider | none | 🔴 |

- **Email:** Resend, **admin-only, single hardcoded recipient**. No user-facing transactional email in app code.
- **In-app notifications:** 🔴 none. **Settings toggles** (broadcast/views/system): 🟡 local state only, never persisted/read.

---

## 19. SECURITY & PRIVACY

- **AuthZ:** public read of companies (RLS SELECT true); owner-scoped write; `/api/admin/*` gated by `super_admin`; uploads require auth + namespace by `user.id`.
- **RLS:** ✅ on companies, portfolio_projects, broadcasts, broadcast_matches, contact_clicks, profile_views, early_bird_claims. ⚠️ **`broadcast_events` has no SQL (RLS unknown)**; ⚠️ `platform_services` + `line_message_templates` **RLS not enabled** in SQL.
- **Secrets:** ✅ service-role/Resend/Anthropic/LINE keys server-only; no `NEXT_PUBLIC_` leakage found.
- **Privacy/PDPA:** ✅ `contact_clicks` store no IP/identity; `profile_views` store a salted hash of IP+UA, never raw IP. ⚠️ **default view-hash salt** (`'profindle-views'`) if `VIEW_HASH_SALT` unset — set a real secret.

**Vulnerabilities / risks (ranked):**
1. ⚠️ **No CAPTCHA / no signup rate-limiting** → automated spam accounts (already observed in prod). Highest-impact gap.
2. ⚠️ **Live demo stub auth routes** (`send-otp`, `verify-otp`) return fake success — dead, misleading, should be deleted.
3. ⚠️ **`check-email` is a public account-enumeration oracle** (exact yes/no; O(n) listUsers).
4. ⚠️ **Admin role trusts `user_metadata.role`** — in default Supabase, `user_metadata` is **user-writable** via `auth.updateUser`; if not locked down, a user could self-assign `super_admin`. **Move to `app_metadata` / verify server-side.** (Highest-severity if unmitigated.)
5. ⚠️ **`broadcast_events` (+ admin tables) RLS unmanaged** — confirm in live DB.
6. ⚠️ **No audit logging** of admin actions (delete user/company, grant premium).
7. ⚠️ `portfolio-upload` verifies project exists but **not ownership** (mitigated by path namespacing); `broadcasts/track` is unauthenticated/unvalidated (anyone can insert events).

---

## 20. TECHNICAL DEBT & RISKS (prioritized)

**Critical**
- **`user_metadata.role` privilege check** — potential self-escalation to `super_admin`. *Fix:* enforce via `app_metadata` / server-verified claim. (`api/admin/*`, `(dashboard)/admin`.)
- **No payment system** but Premium is the model — monetization is 100% manual. *Fix:* integrate a Thai gateway (Omise/2C2P/GBPrimePay) before scaling paid.
- **`broadcast_events` table undefined in SQL** — analytics can silently fail / be unsecured. *Fix:* add migration + RLS.

**High**
- **No CAPTCHA / signup rate limit** → spam (observed). *Fix:* Turnstile/hCaptcha + Supabase attack protection.
- **Search doesn't scale** (whole tables shipped to client, no pagination/FTS). *Fix:* server-side filtered/paginated query, Postgres FTS or trigram, Thai tokenization.
- **Contact-click data is a dead-end** (collected, never surfaced) — kills the provider conversion hook. *Fix:* provider analytics dashboard.
- **Verification is fully manual** — won't scale supply. *Fix:* semi-automated DBD checks / clearer queue.
- **No monitoring/error tracking** — blind to prod failures. *Fix:* Sentry + logging.

**Medium**
- **Live stub routes** (`auth/send-otp`, `verify-otp`, `api/search`, `companies` POST) — delete.
- **i18n split** (JSON + 171 inline ternaries) — consolidate.
- **No SEO landing pages / schema.org** — organic acquisition left on the table.
- **`plan_expires_at` unenforced** — Premium never expires.
- **Admin tables RLS off**; **default view-hash salt**.

**Low**
- **No shared UI component library** (~1428 inline styles) — design drift. *Fix:* extract primitives.
- **Unused deps** (radix, zod, react-hook-form, zustand, next-intl, lucide) — remove or adopt.
- **Two style systems** (inline + unused Tailwind).

---

## 21. PRODUCT / UX GAPS OBSERVED

**Buyers**
- May be **confused** by the two-field search ("service" vs "additional info") — the second field's purpose isn't obvious.
- May **lose trust** seeing unclaimed/"hasn't joined" providers or thin profiles; Verified badge meaning is ambiguous (admin-decided, not registry-checked).
- May **abandon** on empty/near-empty result sets (cold-start) with no "notify me"/broadcast nudge inline.
- **Hard to compare** providers — no side-by-side, no reviews/ratings, no sorting by relevance-to-query.
- **Next step unclear** after finding a provider beyond "View contact" (no saved shortlist, no in-app message).

**Providers**
- **Onboarding has no wizard** — provider must discover `/my-company` and locked nav; easy to stall pre-profile.
- **Verification is async + opaque** — upload DBD then wait indefinitely for an admin; no status/ETA.
- **LINE connection friction** — OAuth vs manual UID is confusing; it's the gate for leads but its importance isn't sold.
- **Premium value unclear** — Package page shows price but the "you have N leads/views waiting" proof is missing (contact-click data unused).
- **Lead response** — providers get a LINE push but the response loop (`provider_response`) has thin UI.

---

## 22. MARKETPLACE HEALTH MECHANICS

- **Liquidity / supply growth:** 🟡 seeded-import + AI enrichment + unclaimed→claim funnel (just built). Demand growth: 🔴 no dedicated engine (SEO minimal).
- **Provider activation:** 🟡 nav-locking nudges profile creation; no wizard/checklist.
- **Provider response rate:** 🟡 `broadcast_matches.provider_response` schema exists; measurement/UI thin.
- **Buyer conversion:** 🟡 contact-reveal tracking exists; not surfaced.
- **Quality control:** 🟡 manual admin verify; no content moderation.
- **Spam prevention:** 🔴 no signup captcha; 🟡 broadcast 4/mo limit only.
- **Inactive providers / response speed / SLA:** 🔴 not tracked.
- **Reputation / reviews / ratings:** 🔴 **not implemented** (no reviews table or UI).
- **Repeat usage / retention:** 🔴 not tracked.

---

## 23. CURRENT STRATEGY IMPLIED BY THE PRODUCT
*(Inference from implementation, not confirmed product strategy.)*

- **Acquisition:** provider-supply-first, seeded via crawl/import + AI enrichment; buyer acquisition appears under-built (weak SEO). Implies a **supply-led cold-start**.
- **Supply:** seed unclaimed profiles → convert to claimed (human/manual) → upsell Premium. Freemium with a generous "Early Bird free Premium" to build supply density.
- **Demand:** rely on organic + direct browsing; broadcast RFQ as the demand-capture mechanic.
- **Trust:** DBD + Verified badge as the differentiator vs Facebook/Google.
- **Monetization:** Premium subscription (visibility + leads) — but deferred (no billing), signaling **land-grab now, monetize later**.
- **Retention:** minimal mechanics — implies focus is still on acquisition/liquidity, not retention.
- **Positioning:** Thai-first, LINE-native, verification-led B2B directory/marketplace.

---

## 24. WHAT CHATGPT NEEDS TO KNOW BEFORE PROPOSING FEATURES (constraints)

1. **Bilingual is mandatory** — every string/feature needs EN + TH; search is language-siloed.
2. **LINE is the notification & contact backbone** — one OA, one webhook URL (UAT *or* prod for connect flows); push needs `line_user_id`.
3. **No payment infrastructure** — anything "paid" needs a gateway built first; today Premium = manual admin flag.
4. **Verification is manual** — no DBD API; features assuming automated verification don't exist.
5. **Search is client-side & unscalable** — don't assume server FTS/pagination; it must be built.
6. **Auth is Supabase, roles via `user_metadata`** — admin is a single `super_admin`; no multi-role/team concept.
7. **Schema is hand-managed SQL** — new tables = a new `supabase-*.sql` file run on both UAT+prod (no migration tool). `claimed`/`source`/`services`/`contact_clicks`/`profile_views` already exist.
8. **Styling is inline (no component lib)** — new UI follows the `globals.css` token palette; there's no design-system library to reuse.
9. **Deploy = push to `main` + `staging` (kept identical)** — auto-deploy; no CI config in repo.
10. **Data-seeding is admin-gated** (`/admin/import` + enrich-urls) — supply growth tooling exists; monetization/analytics tooling largely doesn't.
11. **Customized Next.js** — framework APIs may differ from docs (`app/AGENTS.md`).

---

## 25. CURRENT PRODUCT MATURITY SCORECARD (1–5, implementation maturity)

| Dimension | Score | Note |
|---|---|---|
| Buyer discovery | 3 | Works, but client-side search, no pagination/relevance. |
| Provider onboarding | 2 | Profile builder + autofill exist; no wizard, verification async/opaque. |
| Provider credibility | 2 | Verified badge is manual/admin; no reviews; DBD stored not checked. |
| Marketplace liquidity | 1 | Cold-start; ~0 real providers; seeding just built. |
| Search | 2 | Substring over whole table; no FTS/pagination/Thai tokenization. |
| Matching | 2 | Flat premium+service filter; no scoring/location/budget. |
| Broadcast workflow | 3 | Solid end-to-end incl. LINE, but Premium-only recipients. |
| LINE integration | 4 | Login OAuth + push + webhook + Flex; the most mature piece. |
| Monetization | 1 | No payment; Premium is a manual flag. |
| Analytics | 2 | Views/clicks/events collected; contact data unsurfaced; no external analytics. |
| SEO | 2 | Good per-provider metadata + sitemap; no schema.org / programmatic pages. |
| Admin tooling | 3 | Broad manual console (verify/premium/import/templates); no audit log. |
| Security | 2 | RLS mostly good; but no captcha, role-in-metadata risk, stub routes, enum oracle. |
| Mobile UX | 3 | Responsive via media queries + inline flex/grid; not audited deeply. |
| Bilingual UX | 3 | Real TH/EN, but split JSON+inline; no persistence. |
| Design consistency | 2 | Token palette exists but ~1428 inline styles, no shared components. |
| Scalability | 2 | Client-side search + synchronous fan-out + hand-run SQL won't scale as-is. |

---

## 26. RECOMMENDED PRODUCT BACKLOG — *do not implement yet*

**P0 — Fix immediately**
- **Lock down admin role** — move `super_admin` out of user-writable `user_metadata` (→ `app_metadata` / verified claim). *Why:* potential privilege escalation.
- **Signup CAPTCHA + rate limiting** — Turnstile/hCaptcha + Supabase attack protection. *Why:* active spam-account abuse.
- **Delete/seal stub routes** (`auth/send-otp`, `verify-otp`, `api/search`, `companies` POST) + fix `check-email` enumeration. *Why:* fake-auth endpoints + account-enumeration.
- **Define `broadcast_events` in SQL with RLS** (+ enable RLS on admin tables). *Why:* silent/insecure analytics table.

**P1 — Next**
- **Surface the contact/lead + view analytics to providers** ("N buyers viewed/tried to reach you"). *Outcome:* the claim→Premium conversion hook. *Why:* data is collected but dead-ended.
- **Server-side, paginated, indexable search** (Postgres FTS/trigram + Thai tokenization). *Outcome:* scalable, SEO-able discovery. *Why:* current search won't scale and isn't indexable.
- **Programmatic SEO pages** (service × province, industry) + **schema.org** on provider pages. *Outcome:* organic buyer acquisition. *Why:* the cheapest demand channel is currently absent.
- **Real payment for Premium** (Omise/2C2P/GBPrimePay) + expiry enforcement. *Outcome:* actual revenue. *Why:* monetization is 100% manual.
- **Provider onboarding wizard + verification status UI.** *Outcome:* higher activation + fewer stalls. *Why:* onboarding/verification are opaque and async.

**P2 — Later**
- **Reviews/ratings** (reputation layer). *Why:* trust + repeat usage; none exists.
- **Ranking/relevance scoring** in search & matching (weight verified/completeness/response-rate). *Why:* quality of results.
- **Admin audit logging** + monitoring/error tracking (Sentry). *Why:* operability at scale.
- **Shared UI component library** from the token palette. *Why:* design consistency, velocity.
- **In-app notifications / lead inbox** + persisted settings. *Why:* engagement, response loop.

---

## FINAL HANDOVER SUMMARY

### Profindle in 20 bullets
1. Thai B2B service-provider marketplace; buyers find/contact providers, mostly via **LINE**.
2. Buyers & providers are the **same account** (a `companies` row); `buyer_only` opts out of leads.
3. **Pre-launch / cold-start:** ~0 real providers in prod (seed/mock), no payments.
4. **Next.js 16 (customized) + React 19 + Supabase**; **inline styles** (no component lib); many installed deps unused.
5. **Auth = Supabase**, client-side signup; admin = `user_metadata.role === 'super_admin'` (⚠️ escalation risk).
6. **Search** loads the whole companies table to the client and substring-filters — no FTS, no pagination, no Thai tokenization.
7. Search `q` = service/name/desc; `where` = portfolio-client/province/address; sort = premium→verified→views.
8. **Broadcast (RFQ):** verified buyer → matching **Premium** providers get a LINE Flex push; 4/user/month.
9. **Matching is a flat filter** (premium ∧ services∋category, ≤50) — no scoring/location/budget/timeline.
10. **LINE is the most mature system** — Login OAuth connect, push, webhook, Flex lead cards.
11. **Verified badge is a manual admin boolean** — DBD certs are stored (private bucket) but never checked.
12. **No payment system at all** — Premium is granted manually (admin or Early Bird), ฿990 "free until Dec 2026".
13. **Supply-seeding tooling exists** (`/admin/import` + AI URL enrichment) → seeds `claimed=false` profiles.
14. **Unclaimed profiles** hide contact, redirect buyers to similar Verified providers, and prompt manual claim via support.
15. **Analytics:** views (deduped, hashed IP), contact-clicks, broadcast-events — **but contact-click data is never surfaced** (dead hook); no GA/Sentry.
16. **Bilingual TH/EN** via `/[lang]` URL routing (default `th`); ~171 strings hardcoded inline outside dictionaries.
17. **SEO:** good per-provider metadata + dynamic sitemap; **no schema.org, no service/industry/province pages**.
18. **Notifications:** LINE push (leads) + admin email/LINE (Early Bird); no user transactional email in-app; settings toggles are cosmetic.
19. **DB is hand-managed SQL files** run on both UAT + prod; `broadcast_events` exists only in code.
20. **Deploy:** auto on push to `main` (prod) + `staging` (UAT), kept byte-identical; likely Vercel (not in repo).

### Architecture at a glance
Next.js 16 App Router (mostly server components) on Supabase (Postgres + RLS + Storage + Auth). Route Handlers for privileged/side-effect ops; client Supabase for simple writes. LINE Messaging + Login, Anthropic (Haiku) for autofill/enrichment, Resend for admin email. Inline-styled UI over a `globals.css` token palette. Schema = loose SQL migrations.

### Marketplace at a glance
Providers list bilingual profiles + portfolio, earn a manual Verified badge, connect LINE. Buyers browse/search free and contact via LINE, **or** verified buyers broadcast an RFQ that pushes a LINE lead to matching **Premium** providers. Supply is being bootstrapped by seeding crawled profiles (unclaimed → claim → Premium).

### Monetization at a glance
Freemium: Free listing; **Premium** (nominally ฿990/mo, "free until Dec 2026") adds broadcast leads + ranking. **No billing exists** — Premium is a manual admin flag; Early Bird is a request-to-grant queue.

### Biggest 5 product risks (ranked)
1. **Cold-start liquidity** — ~0 real providers; the whole model hinges on seeding + converting supply.
2. **No monetization infrastructure** — can't charge even willing customers.
3. **Admin role escalation** (`user_metadata`) + no captcha/spam controls — security exposure.
4. **Search/matching won't scale and aren't discovery-optimized** — weak organic acquisition + poor buyer experience at volume.
5. **Trust is manual & shallow** (admin-flipped Verified, no reviews) — limits buyer confidence.

### Biggest 5 growth opportunities (ranked)
1. **Programmatic SEO** (service × province pages + schema.org) — cheapest scalable buyer demand.
2. **Surface provider analytics** (views/leads) → the Premium/claim conversion hook.
3. **Seed + convert supply** at scale via the import/enrich tooling (beachhead: digital agencies — Marketing/Web/CRM).
4. **Real payments + expiry** to turn manual Premium into recurring revenue.
5. **LINE-native lead loop** (response tracking, follow-ups) — leverage the strongest existing system for retention.
