# Profindle — Expo Pitch & Tech Reference

A pocket reference for the Bangkok expo. Two sections:

1. **Storytelling & sales pitches** — what to say, organized by length and audience.
2. **Tech explanations** — short and long versions for when someone asks "how does it work?"

---

# 1. Storytelling — how to talk about Profindle

## 1.1 The core narrative (memorize this paragraph)

> Finding a trusted service provider in Thailand today means asking in Facebook groups, pinging your network on LINE, or scrolling through ten directories that aren't built for our market. We built **Profindle** because Thai businesses deserve a better way to find each other. A buyer posts what they need once — a designer, a lawyer, an accountant — and our system instantly notifies every matching provider through **LINE**, where Thai business actually happens. Providers get warm, intent-driven leads. Buyers get verified, qualified responses within hours. Everything works in **both Thai and English**, because Thailand does business in both. We're built for Thailand, on the channels Thais already use.

This is your **anchor**. Every pitch below is just compressing or expanding it.

---

## 1.2 Pitches by length

### ⏱ 15 seconds — elevator (when someone says "what do you do?")

> "Profindle is a B2B marketplace that connects Thai businesses with verified service providers — agencies, lawyers, accountants, designers. The twist: instead of searching, buyers broadcast their need and matching providers get notified instantly through LINE."

### ⏱ 30 seconds — when they lean in

> "Imagine you need a marketing agency for your e-commerce store. Today you'd ask in Facebook groups and hope someone replies. On Profindle, you describe what you need in 2 minutes, and every matching provider in our network gets a LINE notification within seconds. They reach out to you. Verified businesses only — we check DBD certificates. Free for buyers, freemium for providers. We work in both Thai and English."

### ⏱ 2 minutes — full booth pitch

**The problem (15s):**
> "Thai B2B procurement is broken. If you need a service provider — say a tax accountant or a web developer — you have three bad options: scroll through outdated directories, post in Facebook groups, or beg your network on LINE. There's no signal of quality, no verification, and zero matching. We've all wasted weeks on this."

**The insight (15s):**
> "We noticed something. Thai business gets done on **LINE**. Not email. Not in-app inboxes. LINE. So instead of building another directory and hoping people use it, we built a marketplace **native to LINE**."

**The solution (45s):**
> "On Profindle, a buyer describes their project once — what service, budget, timeline, location — in 4 short steps. Two minutes. Submit, and our system instantly matches it against every verified provider in our database. Each match gets a real LINE message with the brief. Providers tap to view, decide if it's a fit, and respond. Buyers get 5–10 qualified responses within hours instead of weeks. Providers get inbound leads that actually convert."

**Why us, why now (30s):**
> "Every provider is verified against their DBD business registration — no fake accounts. Everything is bilingual; Thai-first, English-ready. Buyers pay nothing. Providers list free, with a Premium tier for unlimited broadcasts, unlimited portfolio, and priority placement. We're launching now because LINE's LIFF and Messaging API matured to the point where we can deliver this experience without users leaving their chat."

**The ask (15s):**
> "If you're a service provider — designer, agency, consultant — list your business free, and you'll start getting LINE notifications when buyers in your category broadcast. If you're a buyer, your first broadcast is free, takes 2 minutes, and goes out to dozens of vetted providers. Scan our QR — let's talk."

---

## 1.3 Audience adaptations

### To a service provider (agency owner, freelancer)

> "How much do you spend on lead generation? On Profindle, you list free and we send you warm leads on LINE — buyers who've already described their project and budget. You only reach out if it's a fit. No bidding wars."

### To a buyer (SME owner, procurement)

> "Next time you need to hire a vendor in Thailand, try this: describe your project on Profindle, submit, and within hours you'll have qualified providers reaching out to you. No more Facebook posts. No more 'do you know anyone'."

### To a potential partner / investor

> "We're building Thailand's category-defining B2B services marketplace. Our wedge is LINE-native distribution — every other player optimizes for web, we optimize for the chat app where 50 million Thais already conduct business. Two-sided network with verified supply, intent-driven demand, monetization via the provider Premium tier."

### To LINE or a platform partner

> "We're building on top of LINE Messaging API and LIFF — rich menus, Flex Messages, manual UID linking, OAuth. We're showing what's possible when a B2B marketplace is designed for chat first, web second."

---

## 1.4 Three lines to drop into any conversation

1. **"On Profindle, the buyer broadcasts and providers come to them — not the other way around."**
   Captures the reverse-marketplace twist. Use it constantly.

2. **"Verified through DBD."**
   Trust is the entire game in Thai B2B. Lead with verification.

3. **"It lives in LINE, where business actually happens."**
   Distinguishes you from every English-first marketplace.

---

# 2. Tech explanations — what your system actually is

## 2.1 Short version (30 seconds, for casual conversation)

> "Profindle is a web app and a LINE bot working together. The web app is where businesses set up their profile, browse providers, and submit broadcast requests. The LINE bot is how we deliver notifications and how providers handle leads — most of the action happens inside LINE chat. Under the hood it's a fairly standard modern stack: a website backed by a database, with the LINE Messaging API as a third surface. Built bilingually from day one."

If they want more, the long version follows.

---

## 2.2 Long version (3–5 minutes, non-developer friendly)

Think of Profindle as **three surfaces** sharing one backend.

### Surface 1: The Web App

This is the dashboard — buyers and providers log in, set up their company profile, manage their portfolio, search the directory, submit broadcast requests, etc. A normal website. Modern web tooling — the recommendation is **Next.js** (a popular framework for building web apps), styled with our design system, and bilingual via translation files that swap Thai and English on every screen.

### Surface 2: The LINE Bot ("Profindle Official")

This is the magic. We have an official LINE account (`@profindle`) that anyone can add as a friend. The bot does three jobs:

- **Notifies providers** when a buyer broadcasts a matching request (sends a "Flex Message" — a rich, formatted card with the brief inside their chat).
- **Links accounts** so we know which LINE user is which Profindle user (via LINE Login OAuth, or as a fallback the user types `สถานะ` to the bot and gets their LINE ID back to paste in our settings page).
- **Hosts the rich menus** — those tab-bar-like buttons at the bottom of the LINE chat that let users navigate ("Find a Provider", "My Broadcasts", "Messages", etc.). We have three rich menus: a main one for everyone, a buyer one, and a provider one — and we swap which one a user sees based on their role.

### Surface 3: The LIFF View ("LINE In-app Browser")

When a provider taps a broadcast notification, it opens a small web view **inside** the LINE app — never kicking them out to a browser. That's LIFF. Same web app technology as Surface 1 but rendered in a phone-shaped frame inside chat. We use it for the broadcast detail view, where providers can read the brief and reveal the buyer's contact info (free providers get 12 reveals per month, Premium is unlimited — a key monetization lever).

### The Backend (what's behind all three surfaces)

- A **database** (PostgreSQL recommended) that stores users, companies, broadcasts, portfolio projects, the verified-client directory, premium grants, etc.
- An **API server** (Node.js recommended) that all three surfaces talk to. Same code, same business rules, no matter whether the request comes from the web, the bot, or LIFF.
- **Image storage** (Amazon S3 or Cloudflare R2) for logos and portfolio photos. We pre-crop each upload into 4 aspect ratios using a "focal point" the user picks — so the same image looks right on a grid card, a mobile feed, a hero banner, and a profile thumbnail.
- **Email sending** (SendGrid or similar) for the OTP login flow — we send a 6-digit code instead of using passwords (faster, no "forgot password" headaches).

### Two things that are non-obvious but important

**1. The verification system is two separate flags.**
A company can be "set up" (has filled out the basic profile) without being "verified" (has had their DBD certificate reviewed by our team). We let them use the product immediately on signup — you don't have to wait for verification to send a broadcast or list services. Verification only controls the public "Verified" badge on the profile.

**2. The matching engine is a database query, not AI.**
When a broadcast comes in, we run a SQL query: "Find providers whose service category matches, whose budget range overlaps the buyer's budget, whose location matches, and who are connected to LINE." Sort by Premium status, then by profile completeness, return the top 50. We send LINE notifications to those 50. Simple, fast, explainable. We can layer ML on top later, but the v1 is a database query and that's a feature, not a limitation.

### What we built vs. what's left to build (honest answer)

> "The product is **designed end-to-end** — every screen, every interaction, every empty state, both languages. The backend implementation is what we're standing up now. We've documented the data model, the matching logic, the LINE webhook contracts, and the verification flow as a precise spec, so the engineering team isn't designing from scratch — they're translating a design into code."

---

## 2.3 The tech stack — at a glance (for when a developer asks)

If someone technical asks "what's the stack?", read this off. Honest, defensible, no buzzwords.

```
FRONTEND
  Web app ............ Next.js (React) + TypeScript
  Styling ............ Tailwind CSS + our own design system
  i18n ............... Thai / English via JSON locale files
  LIFF view .......... Same Next.js app, rendered inside LINE

BACKEND
  API ................ Node.js (Next.js API routes / a thin server)
  Language ........... TypeScript end-to-end
  Database ........... PostgreSQL
  ORM ................ Prisma (type-safe queries)
  Auth ............... Email OTP (6-digit code) + LINE Login OAuth

LINE PLATFORM
  Messaging API ...... Push notifications, Flex Messages
  LIFF ............... In-chat web views (broadcast detail, reveals)
  Rich Menus ......... 3 menus (default / buyer / provider), swapped by role
  Webhooks ........... Handle follow / unfollow / message events

STORAGE & SERVICES
  Image storage ...... S3 or Cloudflare R2
  Image pipeline ..... 4 aspect ratios per upload, focal-point cropping
  Email .............. SendGrid (OTP delivery)
  Hosting ............ Vercel (web + LIFF), managed Postgres (Neon / Supabase / RDS)

MATCHING
  Engine ............. SQL query — category + budget overlap + location + LINE-linked
  Ranking ............ Premium first, then profile completeness
  Top N .............. 50 providers per broadcast
```

**One-line version (EN):** *"Next.js + TypeScript on Vercel, Postgres via Prisma, LINE Messaging API + LIFF for the chat surface, S3 for images, SendGrid for OTP."*

**แบบประโยคเดียว (TH):** *"ใช้ Next.js กับ TypeScript รันบน Vercel ครับ ฐานข้อมูลเป็น Postgres ต่อผ่าน Prisma ฝั่ง LINE ใช้ Messaging API กับ LIFF เก็บรูปบน S3 ส่ง OTP ผ่าน SendGrid"*

**เวอร์ชันสั้นกว่านั้น (ถ้าเขาแค่ถามผ่านๆ):** *"เว็บเป็น Next.js + TypeScript, ฐานข้อมูล Postgres, ต่อ LINE ผ่าน Messaging API กับ LIFF ครับ"*

### "ทำไมเลือก stack นี้?" / "Why this stack?"

| | EN | TH |
|---|---|---|
| **Next.js** | Same codebase serves the web dashboard and the LIFF view; fast iteration. | ใช้โค้ดชุดเดียวกันได้ทั้งหน้าเว็บและ LIFF ที่อยู่ในแชท LINE พัฒนาเร็ว |
| **Postgres + Prisma** | Matching logic is relational (joins on category, budget, location) — a relational DB earns its keep. Prisma gives type-safe queries shared with the frontend. | การ match buyer กับ provider เป็นงาน relational (join category, budget, location) ใช้ SQL ตรงๆ ดีกว่า NoSQL และ Prisma ทำให้ type ตรงกันทั้งระบบ |
| **TypeScript** | One set of types for API, DB, and UI; bilingual fields modeled once. | ใช้ type ชุดเดียวกันตั้งแต่ database ถึง UI รองรับสองภาษา (ไทย/อังกฤษ) ตั้งแต่ data layer |
| **LINE-native** | Messaging API + LIFF aren't a wrapper — they're a first-class surface alongside the web app. | Messaging API กับ LIFF ไม่ได้เป็นแค่ "ส่งลิงก์เข้า LINE" แต่เป็น surface หลักของระบบ ทำงานเทียบเท่าเว็บ |
| **No AI in v1** | Matching is a SQL query. Fast, explainable, easy to debug. ML is a layer to add when we have signal. | ระบบ matching เป็น SQL query ตรงๆ เร็ว อธิบายได้ debug ง่าย ค่อยใส่ ML ทีหลังตอนมี data พอ |

### "What's not built yet?" / "ตอนนี้ทำเสร็จถึงไหนแล้ว?"

**EN:** *"Frontend and design system are complete across every screen, both languages. Backend is being stood up against a fully-specified data model and matching contract — we're translating a finished design into code, not designing in code."*

**TH:** *"Frontend กับ design system เสร็จหมดแล้วครับ ทุกหน้า ทั้งสองภาษา ตอนนี้กำลัง implement backend ตาม spec ที่ออกแบบไว้ — ไม่ได้เริ่มจากศูนย์ แต่แปล design ที่เสร็จแล้วเป็นโค้ด"*

---

## 2.4 Phrases that make you sound technical (without lying)

| Phrase | Why it's defensible |
|---|---|
| "We're **LINE-native** — Messaging API, LIFF, rich menus, Flex Messages." | All four are real LINE platform features we use. |
| "Verified suppliers via **DBD certificate** review." | Our admin queue exists for exactly this. |
| "**Bilingual at the data layer**, not just the UI — every content field has Thai and English columns." | True; see the data model. |
| "**Email OTP** auth plus **LINE Login OAuth**." | Both flows are designed. |
| "**Freemium** for providers, free for buyers, two-sided network." | True. |
| "**Reverse-marketplace** mechanic — buyers broadcast, providers respond." | The defining behavior. |

## 2.5 Phrases to AVOID (they sound nice but you can't defend them)

| Phrase | Why to skip |
|---|---|
| "AI-powered matching" | We don't have AI. We have a database query. Don't promise it. |
| "Blockchain-verified" | No. |
| "Real-time" | LINE has small latency. "Within seconds" is honest; "real-time" invites pedantic questions. |
| "Disruption" | Boring word, instant eye-roll. |

---

# 3. Booth cheat card (print this big)

```
PROFINDLE — 30-SECOND PITCH

PROBLEM:  Finding B2B service providers in Thailand is broken.
          Facebook groups, cold LINE messages, outdated directories.

SOLUTION: Buyers broadcast what they need. Matching providers
          get notified instantly on LINE. Bilingual (Thai/English).
          Verified via DBD certificate.

WEDGE:    LINE-native. Where Thai business actually happens.

MODEL:    Free for buyers. Free + Premium for providers.

ASK:      "Scan this QR — list your business free in 2 minutes,
           and start getting leads on LINE."
```

---

# 4. Quick objection responses

**"How is this different from [Fastwork / Seekster / a Facebook group]?"**
> "Those are search directories — buyers scroll, providers wait. Profindle is a **broadcast network** — the buyer's brief gets pushed to every matching provider on LINE. Plus we verify every business through DBD, and we're bilingual Thai-first."

**"What if no providers reply to my broadcast?"**
> "We'll show you the match count up-front — you'll know how many providers will receive it before you submit. If fewer than 5 match, we widen the criteria automatically and tell you what we changed."

**"How do you make sure providers are real?"**
> "Every company uploads their DBD business registration certificate. Our team reviews it manually within 1–2 business days. Verified businesses get a badge on their profile. We're transparent about which businesses are still pending."

**"Why LINE? I don't use LINE for business."**
> "Fair — and the web app works on its own if you prefer email. But ~80% of Thai SMEs use LINE daily, and providers respond ~10× faster to LINE pings than to email. We meet people where they already are."

**"What's the pricing?"**
> "Buyers: completely free. Providers: free to list, with a Premium tier for unlimited broadcasts, unlimited portfolio projects, and priority search placement. Premium pricing TBD at launch."

**"Are you funded?"**
> [Your honest answer. If pre-revenue / bootstrapped, that's a strength at this stage — say so.]

---

# 5. Things to bring to the booth

- QR code → landing page (printed large)
- QR code → add `@profindle` on LINE (printed large)
- Business cards with both QRs on the back
- iPad or laptop showing the live web app
- Phone showing the LIFF view inside LINE (this is your "wow" moment)
- Two-up printout of the cheat card above
- A "Sign up here" tablet with the signup form open
- A clicker to swap to the broadcast flow demo on the iPad

---

*Print double-sided, fold, keep in your pocket. Practice the 30-second version out loud until it's automatic.*
