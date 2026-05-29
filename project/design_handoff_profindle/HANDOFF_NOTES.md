# Profindle — Engineering Handoff

This document captures everything the HTML prototype simulates that the production backend must implement. **Read this end-to-end before scaffolding the real app.** Skip it and you'll re-derive these decisions the slow way.

---

## 0. What this repo is

- **Prototype**, not production code. Pure HTML + vanilla JS + a shared CSS design system.
- All "data" lives in inline JS arrays and `localStorage`. Nothing persists across users.
- API calls, auth, payments, LINE OAuth — all faked. Buttons trigger UI transitions but never hit a network.
- The prototype's **design + content + interaction model is canonical**. The data model and flow described below are what real engineering should build to.

---

## 0a. Demo user & seed data

When wiring the real backend, know what each piece of "data" in this prototype actually is. There are three buckets:

### 1. `DEMO_USER` — the one hardcoded user (single source of truth)

`dashboard-shell.js` exposes `window.profindleDemoUser`. Every page that renders user/company chrome reads from this object — there is no other hardcoded user anywhere in the codebase.

```js
window.profindleDemoUser = {
  initial:   'S',
  fullName:  'Somchai J.',
  firstName: 'Somchai',
  plan:      'free',              // 'free' | 'premium'
  email:     'somchai@jaidee.co.th',
  company: {
    name:    'Jaidee Solutions Co., Ltd.',
    name_th: 'บริษัท ใจดี โซลูชั่นส์ จำกัด',
  },
};
```

**Where it's read:**
- `dashboard-shell.js` — sidebar avatar + plan label + topbar avatar
- `Dashboard Home.html` — welcome banner (`{name}`), Getting Started email line (`{email}`), company name line (`{company}`); see the `hydrateUser()` IIFE
- `My Company.html` — Basic Info form prefills company name (EN + TH), email, LINE contact-person via a `hydrateCompanyForm()` IIFE

**Replace with:** the authenticated user from your session, before `dashboard-shell.js` runs. The fallback pattern (`window.profindleDemoUser = window.profindleDemoUser || {…}`) means you can set `window.profindleDemoUser` first and the hardcoded default never overrides it.

### 2. `industries-data.js` — real seed data (ship this to production)

The 39-industry, ~400-service catalog in `industries-data.js` is the **only piece of "data" in this prototype meant for production**. It's the canonical seed for the `industries` and `services_catalog` tables (§4). Service labels stay English on purpose — see §12.

**Replace with:** an `/api/industries` endpoint backed by those two tables. Keep the same shape (`id`, `name`, `th`, `services[]`) so the consumers (`Admin Panel.html`, `Broadcast Request.html`, `My Company.html`) don't change. Color assignment is deterministic-by-index and can be moved server-side or kept client-side.

### 3. Everything else — empty state placeholders

All other "lists" in the prototype are deliberately empty arrays with a no-data state rendered, including:

| Surface | List | Empty-state copy |
|---|---|---|
| `Admin Panel.html` → Companies table | `[]` | "No companies registered yet." |
| `Admin Panel.html` → Verification Queue | `[]` | "No companies awaiting verification." |
| `Admin Panel.html` → Activity Log | `[]` | "No activity yet." |
| `My Company.html` → Profile Views | `VIEWERS = []` | "No views in this period yet." |
| `Dashboard Home.html` → Recent Activity | `[]` (already populated by demo user hydration only) | "No activity yet." |
| `Portfolio.html` → Projects grid | `[]` | "No portfolio projects yet." |
| `Broadcast History.html` | `[]` | "No broadcasts yet." |
| `Search Providers.html` → results | `[]` until query | "No providers match." |
| `LIFF Broadcast Detail.html` → broadcast fields | `—` placeholders | (renders the chrome with em-dashes so engineering can see the layout) |

There are some `display:none` HTML rows kept in `Admin Panel.html` as commented examples of row markup (`<tr data-vq-row="jaidee" style="display:none;">`) — those are reference structure, not seeded data. The real `<tbody>` already shows the empty state.

### Rule of thumb when adding content

- If it's the signed-in user → extend `DEMO_USER` and read from it.
- If it's a system catalog (industries, services, currencies, provinces…) → add to a `*-data.js` seed file.
- If it's user-generated (companies, projects, broadcasts, viewers, messages…) → leave the array empty and add an empty-state copy.

Do **not** hardcode realistic-looking brand names, person names, or transaction data into the markup or scripts. The whole point of this round of cleanup was to remove them.

---

## 1. Tech-stack assumptions for the real app

We assume a typical stack but the doc is framework-agnostic:

- **Frontend:** Next.js 14+ (App Router) or Remix. Tailwind on top of the existing token set in `colors_and_type.css`. The `data-i18n-*` pattern can keep working in raw HTML, or you can migrate to `next-intl` / `react-i18next` with identical translation keys.
- **Backend:** Node + PostgreSQL is the path of least resistance. The data model below maps cleanly to relational tables; nothing here needs a graph DB or document store.
- **Auth:** Email OTP (already mocked in `Login.html`) + LINE OAuth (see §7).
- **Search:** Postgres `pg_trgm` for the client-name autocomplete and provider search. Move to Elasticsearch / Meilisearch when you cross ~50k providers.
- **LINE:** Messaging API + LIFF for in-chat web views.
- **Files:** S3 / Cloudflare R2 for portfolio images. Resize at upload, store originals + 3 derivatives (4:3, 16:9, 1:1).

## 2. Page index

| File | Role | Notes |
|---|---|---|
| `Landing Page.html` | Marketing home | Public. EN/TH. |
| `Login.html` / `Signup.html` / `Forgot Password.html` | Auth | Email OTP mocked; `000000` is the failure code. |
| `Dashboard Home.html` | Provider's main dashboard | Premium banner (top), Getting Started accordion, Quick Actions, Recent Activity, Help. |
| `My Company.html` | Company profile editor | Bilingual name + description fields. **Saving this is the gate** — see §3. |
| `Provider Overview.html` | Provider-facing service management overview | Gated on company profile. |
| `Portfolio.html` | Provider's portfolio editor | Image upload with focal-point picker, bilingual project description/results, 150-brand client autocomplete. |
| `Package.html` | Premium plan picker | No real checkout. |
| `Find Providers.html` | Buyer's search + single-page broadcast form | Legacy single-form broadcast still exists here. |
| `Broadcast Request.html` | **Buyer's multi-step broadcast flow** | New, canonical broadcast UX. |
| `Search Providers.html` | Public provider directory + profile drawer | The drawer renders TH content with EN fallback badge. |
| `Settings.html` | Account settings, LINE Connect | LINE OAuth mocked. |
| `Admin Panel.html` | Super-admin tools | Companies, Verification queue, Industries, LINE Templates, Activity Log, Premium Grant. |
| `LINE Rich Menus.html` | Design spec for the LINE OA rich menus | Three menus: main + buyer sub + provider sub. |
| `Privacy.html` / `Terms.html` | Legal | |

Shared:
- `ds.css` — design system primitives + components
- `colors_and_type.css` — color tokens, typography scale
- `dashboard-shell.js` — sidebar + topbar + EN/TH toggle injection + dev-only lock toggle
- `i18n.js` / `i18n.css` — language toggle + `data-i18n-*` attribute renderer

---

## 3. Two separate gates — DO NOT conflate them

There are **two independent flags** on every company account. They control different things and must be tracked separately.

### Flag A: `has_company_profile` (boolean)
- **Set by** the user when they save Basic Info on `My Company.html` (company name, industry, province, address, contact).
- **Controls** access to **For Providers** features (Manage Services, Portfolio, Package, LINE Connect) and **For Buyers** features (Find Providers, Broadcast).
- **UI behavior:** when `false`, sidebar items in those two sections show a 🔒 icon and route to `My Company.html`. Dashboard quick-action cards show a "Locked" pill.
- **Rationale:** you cannot add portfolio, manage services, or broadcast a request without a company to attach them to. **Logical prerequisite, not a trust check.**

### Flag B: `verification_status` (enum: `not_submitted` | `pending` | `verified` | `rejected`)
- **Set by an admin** in `Admin Panel.html → Companies → Verification Queue` after reviewing the uploaded DBD certificate.
- **Controls** the public-facing **Verified badge** on the profile. That's it.
- **Does NOT gate any features.** A user with `has_company_profile = true` and `verification_status = pending` must have full provider/buyer access.

> 🚨 An earlier prototype iteration gated provider/buyer features on `verification_status`. **It was wrong.** Verification is admin-controlled and slow; we cannot block users from using the product they signed up for while waiting on us.

---

## 4. Data model (minimum)

### `users`
```
id, email, hashed_password (or null if OTP-only),
display_name_th, display_name_en, locale ('th' | 'en'),
created_at, last_login_at
```

### `companies`
```
id, owner_user_id (→ users.id),
name_en, name_th,                       -- both, see §6 bilingual fields
description_en, description_th,
industry_id (→ industries.id),
province, address, phone, email_public, website,
line_oa_user_id (LINE userId, format ^U[a-f0-9]{32}$),
has_company_profile (computed: NOT NULL on name_en + industry_id + province),
verification_status enum,
verification_doc_url, verification_submitted_at,
verified_by_admin_id, verified_at, rejection_reason,
premium_until timestamp (nullable — see §8),
created_at, updated_at
```

### `services_catalog` (system-managed)
```
id, industry_id, label_en  -- labels stay EN-only by product decision
```

### `company_services` (join)
```
company_id, service_id
```

### `portfolio_projects`
```
id, company_id, title (single-language by product decision),
description_en, description_th,
results_en, results_th,                 -- newline-separated bullets
client_id (→ clients.id, nullable),     -- linked client, see §9
client_name_freetext (if client_id is null and user typed something new)
category_id, budget_band, duration_months, year, is_confidential boolean,
created_at, updated_at
```

### `portfolio_images`
```
id, project_id, url_original, position (0 = cover),
focal_x decimal(5,2),  -- 0–100 percent, default 50
focal_y decimal(5,2),  -- 0–100 percent, default 50
                       -- see §10 focal-point picker
```

### `clients` (the DBD-derived directory)
```
id, name_canonical, name_aliases (text[]), industry, is_verified_brand boolean,
created_by_user_id (nullable — null for seeded, set for user-added),
merged_into_client_id (nullable — for dedupe by admin),
created_at
```

### `broadcasts`
```
id, buyer_user_id, buyer_company_id,
category_id, description_en, description_th, title (optional),
budget_band enum, timeline enum, location_pref,
created_at, status enum ('active' | 'closed' | 'expired'),
expires_at (default created_at + 14d)
```

### `broadcast_matches`
```
id, broadcast_id, provider_company_id,
matched_at, notified_at (when LINE push fired),
provider_response enum ('no_reply' | 'interested' | 'declined'),
responded_at
```

### `premium_grants` (audit log — required, see §8)
```
id, company_id, granted_by_admin_id,
granted_at, duration_days (int) OR custom_until_date,
reason enum ('Early Bird Program' | 'Compensation' | 'Beta Participant' | 'Other'),
note (optional text),
new_premium_until (snapshot of company.premium_until AFTER the grant)
```

### `activity_logs`
```
id, actor_user_id, actor_role, action_type, target_type, target_id,
metadata jsonb, ip, created_at
```

---

## 5. Auth — email OTP (mocked in prototype)

Prototype: any 6 digits log you in; `000000` shows error.

Production:
- 6-digit code, 10-minute expiry
- Max 5 attempts per code
- Resend rate-limited to once per 30s (UI already enforces this)
- Code delivery: transactional email via SES / SendGrid / Postmark with DKIM
- Session: HTTP-only cookie or signed JWT, 30-day rolling expiry
- Forgot password page already exists; finish the token-in-URL reset flow.

---

## 6. Bilingual content (EN / TH)

### UI strings — `data-i18n-*` attribute pattern

The prototype uses raw HTML attributes:
```html
<h2 data-i18n-en="Welcome back" data-i18n-th="ยินดีต้อนรับกลับมา">Welcome back</h2>
<input data-i18n-en-ph="Search…" data-i18n-th-ph="ค้นหา…">
<a data-i18n-en-html="Hello <b>{name}</b>" data-i18n-th-html="สวัสดี <b>{name}</b>"></a>
```

Variants: `data-i18n-{lang}` (textContent), `-html`, `-ph` (placeholder), `-aria`, `-title`.

`i18n.js` exposes:
- `profindleI18n.getLang()` → `'th'` | `'en'`
- `profindleI18n.setLang(lang)` → persists to localStorage, fires `profindle:lang-change` event
- `profindleI18n.t(en, th)` → returns the right string for the active language
- `profindleI18n.withFallback(en, th)` → returns TH if non-empty, else EN with an inline `<span class="i18n-fallback-badge">EN</span>` so users see *why* it's English

**Default language is TH.** If you migrate to `next-intl`, the keys are still the EN strings — translate the JSON dictionary from those.

### Content fields — bilingual columns

Already in §4 schema: `name_en / name_th`, `description_en / description_th`, `results_en / results_th`. UI uses a paired-textarea pattern (`.bilingual-field` in `i18n.css`). Display rules:

- **TH user, both filled** → show TH only
- **TH user, only EN filled** → show EN with "EN" fallback badge
- **EN user, both filled** → show EN only
- **EN user, only TH filled** → show TH with "TH" fallback badge

Project titles and client names are intentionally single-language by product decision (project titles are brand-name-heavy; client names are normalized via the autocomplete).

---

## 7. LINE integration

### Rich Menus (see `LINE Rich Menus.html` for visual spec)

Three menus, all 2500px wide:
- `rm-main` — 2500 × 843 (compact). 3 cells: Find a Provider · For Providers · Talk to Admin.
- `rm-search` — 2500 × 1686 (large). 6 cells: Search · Broadcast · My Requests · Messages · Saved · Back.
- `rm-provider` — 2500 × 1686 (large). 6 cells: New Leads · My Company · Portfolio · Messages · Upgrade · Back.

Setup:
1. `POST /v2/bot/richmenu` × 3, store each `richMenuId`.
2. Upload PNG per menu via `POST /v2/bot/richmenu/{id}/content`.
3. Each cell carries a `bounds` (x, y, w, h in pixels) and an `action`.
4. Inter-menu navigation uses `action.type = 'richmenuswitch'` — no postback bubble, feels native.
5. Default for all followers: `POST /v2/bot/user/all/richmenu/{rm-main}`.
6. When a user completes provider registration, swap them: `POST /v2/bot/user/{userId}/richmenu/{rm-provider}` server-side.

### LINE Login (OAuth)

In Settings → Connect LINE:
1. Click → redirect `https://access.line.me/oauth2/v2.1/authorize?...` with state + nonce
2. Callback → exchange auth code for `access_token` + `id_token`
3. Decode `id_token` → get `sub` (= LINE userId, format `^U[a-f0-9]{32}$`)
4. Store on `companies.line_oa_user_id`

### Manual UID fallback (also in the prototype)

For users where OAuth fails or who aren't logged into LINE in the device browser:
1. Friend the OA `@profindle`
2. DM the bot `สถานะ` or `status`
3. Bot replies with their userId (from `message` event `source.userId`)
4. User pastes into the manual UID field, regex-validate `^U[a-f0-9]{32}$`

### Webhook (`/line/webhook`)

Handle these event types:
- `follow` — if a session token was passed in the deep-link, link automatically
- `unfollow` — clear `line_oa_user_id` from the company (or soft-flag, your call)
- `message` matching `/^(สถานะ|status)$/i` — reply with `source.userId`
- `postback` events from rich-menu buttons that use `action.type = 'postback'`

### Broadcast notifications

When a buyer submits a broadcast (§11):
1. Server queries matching providers (category + budget + timeline + location)
2. For each match → push a LINE message via `POST /v2/bot/message/push` with a Flex Message template (see `Admin Panel.html → LINE Templates` for the canonical templates)
3. Store `notified_at` in `broadcast_matches`
4. Free providers: 1 broadcast notif / day. Premium: unlimited. Throttle per-provider to avoid spam.

---

## 8. Premium grants (Admin → Companies → Premium)

The prototype mocks this entire flow. Schema is `premium_grants` (§4).

Business rules:
- **Duration choices:** 180 days · 365 days · custom date
- **Always ends at 23:59 local time** on the expiry date (no need for the admin to pick a time)
- **Stacking:** If `companies.premium_until` is in the future, the new grant **extends from that date** (e.g. 14 days left + 180 days = 194 days). If already expired or null, starts from today.
- **Reason is required.** Choices: Early Bird Program · Compensation · Beta Participant · Other. Free-text note optional.
- **Audit log:** every grant writes a row to `premium_grants` AND a generic row to `activity_logs`.
- **Notifications to the company:** email + LINE push with `"Premium granted until {date}"` template.

Dashboard banner behavior (`Dashboard Home.html`):
- `premium_until` null/past → no banner
- `premium_until` ≥ 30 days away → amber banner "✦ Premium plan active · Until {date}"
- `premium_until` < 30 days away → urgent variant + countdown pill "{N} days left"

Premium features that unlock:
1. ✦ Pro badge on profile
2. Unlimited portfolio projects (free is capped at 3)
3. Higher placement in search ranking
4. Advanced analytics (profile views, search ranking position)

---

## 9. Client autocomplete (Portfolio → Add Project → Client Name)

Prototype seeds 150 well-known Thai brands inline (`KNOWN_CLIENTS` array in `Portfolio.html`). Production replaces this with a server endpoint backed by a clients directory.

### Recommended production architecture

```
GET /api/clients/search?q=cent
→ [{ id, name_canonical, industry, is_verified_brand }, …]   max 8 results
```

- Index `clients.name_canonical` + `clients.name_aliases` with `pg_trgm` (Postgres trigram).
- Seed with ~150 manually-curated brands (use the prototype's list as the starter).
- **Recommended:** nightly import of DBD active companies → `clients` table (only `is_verified_brand = false` rows). DBD has 800k+ entries — that's too many for the client-side prototype but trivial for a server.

### Behavior
1. User types → debounced fetch (300ms)
2. Server returns top 8 matches → rendered as suggest list
3. Each suggestion shows: name, industry, ★ Verified badge if `is_verified_brand`
4. **"Add 'XYZ' as a new client"** option at the bottom of the dropdown when there's no exact match
   - On select: POST `/api/clients` with `{ name }`, store `created_by_user_id`, `is_verified_brand = false`
   - Link the new client_id to the portfolio_project
5. Keyboard nav: ↑↓ Enter Esc

### Admin dedupe queue
User-created clients accumulate dupes (`Central Retail` / `Central retail` / `Central Group ltd`). Build an admin tool that surfaces near-matches and lets admins merge them — set `merged_into_client_id` on the loser; existing projects auto-resolve via that pointer.

---

## 10. Image upload + focal-point picker

In `Portfolio.html` Add Project modal, every uploaded image has a draggable orange dot. The user positions it to mark the "important focal point" of the image. We use that point as `object-position` everywhere the image renders at a different aspect ratio.

### Data shape per image
```
{ url_original, position (0=cover), focal_x: 0-100, focal_y: 0-100 }
```
Defaults: `focal_x = 50, focal_y = 50` (center).

### Responsive display ratios
Same source image renders at these ratios across the product:

| Surface | Desktop | Mobile |
|---|---|---|
| Portfolio.html grid card | 4:3 | 4:5 |
| Provider profile drawer thumbnail | 1:1 | 1:1 |
| Project detail cover hero | 16:9 | 4:3 |
| Generated OG / LINE share card | 1.91:1 | 1.91:1 |
| Avatar / logo | 1:1 | 1:1 |

The CSS uses two custom properties `--focal-x` and `--focal-y` that flow into both `object-position` (real `<img>`) and `background-position` (placeholders). Backend should pre-render 4 derivatives per image at upload time (4:3, 4:5, 1:1, 16:9) cropped around the focal point — saves CDN/bandwidth.

### Upload recommendation shown to users
> "Upload landscape, at least 1600×1200. We'll crop automatically for grids and mobile."

---

## 11. Broadcast flow (canonical: `Broadcast Request.html`)

Multi-step flow, 4 steps + success:

1. **Service category** — pick one of 9 cards
2. **Project details** — EN description (required) + TH description (recommended) + optional title
3. **Budget, timeline, location** — chip selectors (budget required, timeline required, location optional)
4. **Review & confirm** — every field with inline edit links + estimated match count
5. **Success screen** — match count + next-steps explainer

### Rules
- 300-character limit on each description (UI enforces, server should too)
- **Free plan:** 4 broadcasts / month. **Premium:** unlimited. Show plan banner at top.
- **Buyer identity:** show company name + buyer's first name to providers. Do NOT show buyer's email/phone — providers must reply through Profindle (in-app inbox or LINE if buyer connected).
- **Validity:** 14 days, then auto-close.
- **Matching algorithm v1:**
  ```
  WHERE category_id = broadcast.category_id
  AND verification_status IN ('verified', 'pending')
  AND budget_overlap(provider.budget_range, broadcast.budget_band)
  AND (broadcast.location_pref = 'l1' OR provider.province IN broadcast.location_pref)
  AND provider.has_line_connected = true
  ORDER BY provider.premium_until DESC NULLS LAST,    -- premium first
           provider.profile_completeness DESC
  LIMIT 50
  ```

### Notification fan-out
On submit:
1. Insert `broadcasts` row
2. Compute matches → insert N `broadcast_matches` rows
3. Async queue: push LINE message per matched provider (Flex Message template "New Broadcast Request")
4. Throttle: max 5 broadcast notifs per provider per day (Free) / 20 (Premium)

---

## 12. Service categories — system-managed, EN-only labels

Product decision: the canonical service list (Digital Marketing, Web Development, SEO, etc.) stays English. Reasons:
1. Industry terms are often used in English in Thailand even by Thai-only speakers
2. Avoids "translation drift" when categories are renamed
3. Admin Panel surfaces them as a flat list; making them bilingual adds complexity for no UX win

There are ~40 services across ~30 industries — full list in `Admin Panel.html → Industries & Services` tab (`INDUSTRIES_DATA` JS array).

---

## 13. What's stubbed vs. what to build

| Feature | Prototype state | Production needs |
|---|---|---|
| Auth | OTP UI works, no backend | Email transport + sessions |
| LINE OAuth | Button + spinner | Real OAuth flow + webhook |
| LINE broadcast push | Mock toast | LINE Messaging API integration |
| Payments / Premium upgrade | Plan picker UI, no checkout | Omise / Stripe / 2C2P checkout flow |
| Email transactional | Mocked | SES / SendGrid templates |
| File uploads | DataURL → memory only | S3 + image-resize worker |
| DBD client directory | 150 hardcoded brands | Real nightly DBD import + trigram search |
| Premium expiry | Set via Admin grant, no enforcement | Cron job that downgrades on expiry |
| Search ranking | Hardcoded order | Real ranking by Premium tier + profile completeness |
| Activity logs | UI exists in Admin Panel | Write-through from every mutating endpoint |
| Verification approve/reject | Admin clicks → DOM update | Email + LINE push to user, DB write |
| Broadcast matching | Hardcoded count | Real query (§11) |
| In-app messaging | Not built | Threads + WebSocket / SSE |
| Notifications center | Not built | Bell + dropdown + persistent feed |
| Buyer-side dashboard | Provider-shaped only | Separate role-based dashboard view |

---

## 14. Things you do NOT have to build (already done)

- ✅ Full design system: `ds.css` + `colors_and_type.css` — tokens, components, gradients, shadows
- ✅ Sidebar nav + topbar with role-aware lock icons (`dashboard-shell.js`)
- ✅ EN/TH toggle wired across all dashboard pages (`i18n.js`)
- ✅ Premium grant admin modal + audit log structure (`Admin Panel.html`)
- ✅ Premium banner + countdown logic on Dashboard Home
- ✅ Client autocomplete UI + 150-brand seed list
- ✅ Bilingual field UI pattern (paired EN/TH textareas with helper text)
- ✅ Focal-point picker on upload + 4-ratio live preview strip
- ✅ Provider Profile drawer with service-filter for portfolio
- ✅ Multi-step Broadcast Request flow
- ✅ LINE Rich Menu visual spec (3 menus)

---

## 15. Open product questions for engineering kickoff

Things the design doesn't lock in — engineering and product should resolve together:

1. **Messaging:** do we build in-app threads, or push everything to LINE? My take: in-app inbox is necessary because not all buyers will be on LINE; LINE is the alert channel, the inbox is the system of record.
2. **Provider plan auto-downgrade UX:** when `premium_until` passes, do we delete extra portfolio projects beyond 3, or hide them with an "Upgrade to restore" CTA? My take: hide, don't delete.
3. **Buyer / Provider role separation:** can one account be both? Currently the UI assumes yes (everyone sees provider + buyer sections, gated by `has_company_profile`). Confirm.
4. **Verification SLA:** what's the admin commitment? Drives a "verifying within 2 business days" message in the verification queue.
5. **Multi-user companies:** can a company have multiple admin users? Schema in §4 has one `owner_user_id` — extend to a `company_members` join if needed.

---

*Generated by the design prototype. Last update reflects: EN/TH i18n, Premium grant, client autocomplete (150), focal-point picker, responsive ratio system, multi-step broadcast flow, LINE Rich Menus.*
