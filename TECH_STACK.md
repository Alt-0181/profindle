# Profindle — Tech Stack Explained (for non-developers)

**What Profindle is:** a Thai B2B marketplace that connects businesses looking to hire with verified service providers. Buyers post a request ("broadcast"), and matching providers get notified — including a ping straight to their LINE app.

This document explains, in plain English, how the website runs, what each piece of technology does, and how to talk about it with a developer. Everything here was verified against the actual code in this repository.

---

## 1. How the whole website works (in one paragraph)

When a visitor opens **profindle.com**, their browser talks to our app, which is built with a tool called **Next.js** and lives on a hosting service called **Vercel**. Vercel serves up the pages (the visual parts are built with **React**) and also runs our "backend" — the behind-the-scenes logic that saves data, checks who's logged in, and talks to outside services. All of our real data (company profiles, user accounts, uploaded logos, broadcast requests) is stored in **Supabase**, which gives us a database, a login/account system, and file storage in one package. When someone signs up, Supabase sends them a verification code by email (delivered through **Resend**). Providers can link their **LINE** account, and when a buyer posts a request, our backend instantly pushes a nicely formatted card to every matching provider's LINE chat. There's also a time-saving feature where a provider pastes their company website URL and our app asks **Anthropic's Claude AI** to read the site and auto-fill their profile fields. In short: browser → our app on Vercel → Supabase for data/login/files → plus Resend (email), LINE (messaging/login), and Claude (AI) for specific jobs.

---

## 2. Architecture at a glance

```
                          ┌─────────────────────────────┐
                          │        Visitor's Browser     │
                          │   (the website they see)     │
                          └───────────────┬──────────────┘
                                          │  request
                                          ▼
                   ┌──────────────────────────────────────────┐
                   │   Next.js app  —  hosted on VERCEL        │
                   │   • Pages / screens (built with React)    │
                   │   • Backend logic ("API routes")          │
                   └───┬───────────────┬──────────────┬────────┘
                       │               │              │
             data/login/files     email         AI autofill
                       │               │              │
                       ▼               ▼              ▼
        ┌───────────────────────┐  ┌─────────┐  ┌──────────────────┐
        │       SUPABASE        │  │ RESEND  │  │  ANTHROPIC CLAUDE │
        │ • Postgres database   │  │ (email  │  │  (Haiku model —   │
        │ • Auth (user accounts)│  │  & OTP  │  │   reads a website │
        │ • Storage (logos,     │  │  codes) │  │   & fills profile)│
        │   portfolio images)   │  └─────────┘  └──────────────────┘
        │ • RLS (data guard)    │
        └───────────────────────┘
                       ▲
                       │  push notifications / login
                       ▼
        ┌───────────────────────────────────────────┐
        │                   LINE                      │
        │ • LINE Login (link your LINE identity)      │
        │ • Messaging API (push request cards to      │
        │   providers' LINE chats)                    │
        └───────────────────────────────────────────┘
```

---

## 3. Every technology, in plain English

| Technology | What it does (everyday analogy) | Why we use it |
|---|---|---|
| **Next.js** (version **16.2.6**) | The overall framework that builds and runs the website. Think of it as the *construction system and factory* for the whole app — it produces both the pages people see and the back-office logic. | Industry-standard way to build fast, modern web apps; handles both the front (visible) and back (logic) in one project. |
| **React** (version **19.2.4**) | The tool that draws the actual screens and buttons and updates them instantly as you click. Like the *interior designer* that arranges and refreshes what's on screen. | Makes the interface interactive and smooth without reloading the whole page. |
| **TypeScript** (version 5) | A stricter version of the programming language that catches mistakes before they ship — like *spell-check and grammar-check for code*. | Fewer bugs, safer changes as the app grows. |
| **Vercel** | The hosting company that runs our website on the internet 24/7. Think of it as the *landlord and power company* for the app — it keeps the site online and auto-publishes new versions. | Made by the same team as Next.js, so deployment is push-button and reliable. Auto-deploys whenever we update the code. |
| **Supabase — Postgres Database** | The filing cabinet where all structured data lives: companies, users, broadcast requests, matches. | A powerful, well-trusted database, hosted for us so we don't manage servers. |
| **Supabase — Auth** | The account system: sign-up, login, passwords, email verification codes. Like the *front-desk security* that checks who you are. | Ready-made, secure login so we don't build sensitive account handling from scratch. |
| **Supabase — Storage** | Where uploaded files live — company logos, banners, portfolio images. Like a *shared drive* for images. | Simple, hosted file storage tied to the same system as our database and login. |
| **Supabase — RLS (Row-Level Security)** | Rules baked into the database that decide *who is allowed to see or change which rows of data*. Like a *rule that says "you can only edit your own company's page."* | Protects data at the deepest level — even a bug in the app can't let someone edit someone else's profile. |
| **Resend** | The service that actually delivers our emails, including the 6-digit verification codes. Like the *post office* for our outgoing mail. | Reliable email delivery; used both for account verification and for admin notification emails. |
| **LINE Login** | Lets a provider connect their LINE identity to their Profindle account. Like *"Sign in with LINE."* | LINE is the dominant messaging app in Thailand — connecting it is natural for our users. |
| **LINE Messaging API** | Lets our app send messages into a provider's LINE chat — e.g. a card announcing a new matching request. Like an *automated LINE assistant* that texts providers. | Instant, high-open-rate notifications where Thai users already are. |
| **Anthropic Claude (Haiku model)** | The AI that powers "auto-fill from website." A provider pastes their site URL; Claude reads the page and fills in name, description, services, province, team size, etc. Like a *smart assistant that reads a website and fills out the form for you*. | Saves providers from typing their whole profile; "Haiku" is Anthropic's fast, low-cost model — a good fit for this quick task. The exact model used is `claude-haiku-4-5`. |
| **Git / GitHub** | The system that tracks every change to the code and stores it safely online. Like *Google Docs version history* for the whole codebase. | Lets developers collaborate, review changes, and roll back mistakes. Vercel watches GitHub and publishes automatically. |

*(Also used under the hood: Tailwind CSS for styling, next-intl for Thai/English language switching, and a handful of standard helper libraries. These are supporting tools, not something you'll usually need to explain.)*

---

## 4. The two environments (Production vs. Staging/UAT)

We run **two separate copies** of the website so we can test changes safely before real users see them.

| | Production (live) | UAT / Staging (testing) |
|---|---|---|
| **Website address** | **profindle.com** | **uat.profindle.com** |
| **Code branch it comes from** | `main` branch | `staging` branch |
| **Who uses it** | Real customers | The team, for testing |
| **Its own Supabase database?** | **Yes — separate** | **Yes — separate** |

**Why this matters:** each environment has its **own separate Supabase database**. Test data on UAT never mixes with real customer data on Production. When a developer pushes new code to the `staging` branch, Vercel publishes it to uat.profindle.com automatically; once it's checked and approved, that code moves to the `main` branch and Vercel publishes it to the live profindle.com.

---

## 5. Where the data lives & how login works

**Where the data lives:** Everything lives in **Supabase** (which itself runs on cloud infrastructure). Specifically:
- **Company profiles, users, broadcast requests, and matches** → the Supabase **Postgres database**.
- **Logos, banners, and portfolio images** → Supabase **Storage** (in buckets named `company-assets` and `portfolio-images`).
- Production and UAT each have their **own** Supabase project, so their data is completely separate.

**How login works:**
- Accounts are managed by **Supabase Auth**.
- **Sign-up:** a person enters their email and a password, then receives a **6-digit code by email** to confirm the address. That confirmation email is delivered through **Resend**.
- **Login:** email + password.
- **Forgot password:** a reset link is emailed (also via the Supabase/Resend email pipeline).
- **Data protection:** **Row-Level Security (RLS)** rules in the database ensure people can only edit their *own* company. Sensitive actions (like an admin looking up all users, or the system sending broadcasts) use a special protected "service" key that only runs on our server — never in the visitor's browser.

---

## 6. Ongoing costs to be aware of

These are the recurring services that carry a cost as Profindle grows. Most have a free tier that's generous at the start; costs rise with usage.

| Service | What you pay for | Free tier? | Notes |
|---|---|---|---|
| **Vercel** (hosting) | Keeping the site online; scales with traffic | **Yes** (Hobby free; Pro ~US$20/user/month) | You'll likely move to Pro for a commercial product and custom domains at scale. |
| **Supabase** (database, auth, storage) | Database size, storage, and usage | **Yes** (free tier; Pro ~US$25/month) | Remember you're running **two** projects (Production + UAT) — budget accordingly. |
| **Resend** (email) | Number of emails sent | **Yes** (a few thousand emails/month free) | Paid plans kick in as email volume grows. |
| **Anthropic Claude API** (AI autofill) | **Pay-as-you-go** per use — you're billed by how much text the AI reads/writes | No monthly free tier (usage-based) | Uses the low-cost **Haiku** model, and only runs when a provider clicks "auto-fill," so cost is small and tied directly to feature usage. |
| **LINE** (Login + Messaging API) | Sending push messages to providers | **Yes** (free monthly message quota) | The official LINE Messaging API is free up to a monthly message limit; heavy messaging volume may require a paid plan. |
| **Domain name** (profindle.com) | Annual domain registration | No | Small fixed yearly cost. |

**Rule of thumb:** at low volume, most of these sit in free tiers. The two you'll watch first as you grow are **Supabase** (two databases) and **LINE messaging volume**; **Claude** cost tracks directly with how often people use the autofill feature.

---

## 7. "If a developer asks X, say Y" cheat-sheet

| If a developer asks… | You can say… |
|---|---|
| **"What's your stack / framework?"** | "Next.js 16 with React 19 and TypeScript." |
| **"What's your backend?"** | "Next.js API routes for our own logic, and Supabase for the database, auth, and storage." |
| **"Where's it hosted?"** | "Vercel. Production is profindle.com off the `main` branch; staging is uat.profindle.com off the `staging` branch." |
| **"What database do you use?"** | "Postgres, via Supabase — with a separate database for production and staging." |
| **"How do you handle login / auth?"** | "Supabase Auth — email and password, with a 6-digit email verification code on sign-up." |
| **"How do you send email?"** | "Through Resend — both the verification codes and our admin notifications." |
| **"How do the LINE notifications work?"** | "LINE Login to connect accounts, and the LINE Messaging API to push request cards to matching providers." |
| **"What's the AI feature?"** | "Anthropic's Claude — the Haiku model — reads a provider's website and auto-fills their profile." |
| **"Is it secure?"** | "Yes — Supabase Auth handles accounts, Row-Level Security in the database means people can only touch their own data, admin/server actions use a protected service key that never reaches the browser, and LINE webhooks are signature-verified." |
| **"How do you deploy?"** | "Git/GitHub plus Vercel — pushing to a branch auto-publishes the matching environment." |
| **"What about scaling / infrastructure?"** | "It's fully managed — Vercel and Supabase handle servers and scaling, so there's no infrastructure for us to run ourselves." |

---

*Last verified against the codebase on 2026-07-20. Version numbers (Next.js 16.2.6, React 19.2.4, Claude Haiku `claude-haiku-4-5`) come directly from the project's `package.json` and source files.*
