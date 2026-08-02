# Profindle — Provider Pitching Playbook

> Goal: recruit the **first cohort of providers** by hand. A marketplace with 0
> providers is worthless to buyers, so we pitch **providers first**, in **one
> service category**, and make signup near-zero-effort with the website autofill.

---

## 1. The product in one line

**Profindle** is a Thai B2B marketplace where businesses find and contact
verified service providers — buyers browse free and reach out via **LINE**.

## 2. Who we pitch first

- **Providers, not buyers.** Buyers won't come to an empty marketplace; providers
  will join for the promise of free leads.
- **Beachhead ONE category.** Pick a single service vertical (e.g. *Digital
  Marketing*, *CRM Setup*, *Accounting*) and get it dense before widening. A buyer
  searching that category should find several real providers, not one.
- **Target profile:** small/mid Thai agencies & service firms that already have a
  website and take work via LINE.

## 3. Why a provider says yes (the value prop)

Lead with these — in this order:

1. **Free qualified leads via LINE** — buyers contact you directly, no middleman.
2. **No commission** — you keep 100% of every deal.
3. **Free "Verified" badge** — upload your DBD certificate, stand out as legit.
4. **Zero-effort listing** — give us your website URL, we build your profile in
   ~2 minutes (AI autofill).

## 4. Provider pitch script

**English (short):**
> "We're launching Profindle — a marketplace where Thai businesses find providers
> like you and message you on LINE. It's free to list, we take no commission, and
> you get a free Verified badge with your DBD cert. Setup takes 2 minutes — just
> send me your website link and I'll build your listing for you. Want me to set it
> up so you can see it?"

**Thai (สั้น):**
> "เรากำลังเปิดตัว Profindle — แพลตฟอร์มที่ธุรกิจไทยใช้ค้นหาผู้ให้บริการอย่างคุณ
> และติดต่อผ่าน LINE ได้เลย ลงประกาศฟรี ไม่มีค่าคอมมิชชั่น และได้ตรา 'ยืนยันแล้ว'
> ฟรีเมื่อแนบใบ DBD ตั้งค่าแค่ 2 นาที — ส่งลิงก์เว็บไซต์มา เดี๋ยวเราสร้างโปรไฟล์ให้
> อยากให้ลองตั้งให้ดูไหมครับ/คะ?"

## 5. Objection handling

| Objection | Response |
|---|---|
| "Is it free?" | Yes — free to list, no commission, ever. You only pay if you later want Premium/Pro visibility. |
| "I'm too busy to set it up." | You don't. Send your website URL and I'll build the whole profile in ~2 minutes. |
| "Will I actually get leads?" | Buyers contact you directly on LINE — no gatekeeping. Early providers get the most visibility while the category is small. |
| "How is this different from Facebook/Google?" | Buyers here are *actively looking to hire a provider*, filtered by service and location — not scrolling a feed. |
| "What's the catch?" | None on listing. We make money later from optional Premium placement, not commissions. |

## 6. Onboarding flow (do it for them, live)

1. Ask for their **website URL**.
2. Run **autofill** (`/api/company/autofill`) → name, description, services
   pre-filled. (`claude-haiku-4-5`.)
3. Fill **both** Thai + English description and pick the right **catalog services**
   — search is a literal keyword match, so bilingual + correct service tags = found
   in both languages.
4. Add a **portfolio project or two** (cover image, client, the services it
   involved) — this is what makes the profile credible.
5. Upload the **DBD certificate** → Verified badge.
6. Add **LINE** contact so buyers can reach them.
7. Paste a **Google Maps link** so buyers see the location.

## 7. Pre-launch checklist (before pitching anyone)

Do one full **end-to-end test signup on production** and confirm each step:

- [ ] Sign up → land on dashboard
- [ ] My Company: autofill from URL → edit → **save with DBD cert** (no error)
- [ ] Add a portfolio project **with images** → saves, images show
- [ ] Tag the project with **services** → appears on public profile filter
- [ ] Add LINE + Google Maps link
- [ ] Provider **appears in search** for its category + shows the Verified badge
- [ ] Public profile looks right (map, portfolio carousel, contact)

## 8. What to watch (early metrics)

- # providers live in the beachhead category (target: enough that a search feels
  "full" — aim for 8–12 before inviting buyers).
- # profiles completed **with DBD verification**.
- # LINE contacts initiated by buyers (the real success signal).

---

### Known gaps to set expectations around
- **Search is literal keyword matching** — no synonyms, no cross-language. Providers
  MUST fill both EN + TH and pick correct catalog services to be findable. Coach
  them on this during onboarding.
- Marketplace is **cold-start**: early providers should understand buyer volume
  builds after the category is seeded.
