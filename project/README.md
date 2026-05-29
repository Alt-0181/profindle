# Profindle Design System — "Midnight Teal"

## Overview

Profindle is a professional platform with a premium, trust-forward brand identity. The design language — called **Midnight Teal** — pairs a deep teal primary with a warm amber accent, creating a confident, authoritative aesthetic suited for B2B/B2C professional contexts. The palette evokes expertise, ambition, and selective quality.

**Sources provided:** Brand design system specification (text, no Figma or codebase links provided).

---

## Products

- **Profindle Web App** — The primary user-facing interface. UI kit located at `ui_kits/app/index.html`.

---

## CONTENT FUNDAMENTALS

### Voice & Tone
- **Professional but approachable.** Copy feels confident, clear, and direct — never stuffy or overly formal.
- **You-focused.** Speaks directly to the user ("your profile," "your opportunities"). First-person brand voice is minimal.
- **Action-oriented.** CTAs and labels use imperative verbs: "Explore," "Connect," "Get Started," "Upgrade."
- **Concise.** Short headlines, tight body copy. No filler. Clarity wins over cleverness.
- **Premium framing.** Premium features are highlighted with language like "Unlock," "Pro," "Exclusive access."

### Casing
- Headlines: **Title Case**
- CTAs/Buttons: **Title Case** (e.g. "Get Started", "View Profile")
- Body copy: Sentence case
- Navigation labels: Title Case
- Badge labels: ALL CAPS or Title Case depending on context

### Emoji & Special Characters
- Emoji are **not part of the brand.** Avoid in UI copy.
- Unicode characters (→, ·, ×) may be used sparingly for decorative separators.

### Numbers & Stats
- Key stats use the Teal→Amber gradient treatment to convey energy and value.
- Numbers are spelled out below ten; numerals for 10+.

---

## VISUAL FOUNDATIONS

### Color System
| Token | Hex | Usage |
|---|---|---|
| Primary Teal | `#0F6F73` | Buttons, links, headers, primary actions |
| Secondary Amber | `#F77F00` | Premium features, CTAs, highlights |
| Accent Coral | `#FF5A5F` | Special highlights, featured items |
| Dark Charcoal | `#171A21` | Text, dark backgrounds |
| White | `#FFFFFF` | Backgrounds, light surfaces |
| Teal Light | `#1A9DA3` | Hover states, gradient endpoints |
| Amber Deep | `#E06B00` | Pressed amber states |

### Typography
- **Font Family:** Inter (Google Fonts) — clean, neutral, highly legible
- **Scale:** 12px → 14px → 16px → 18px → 20px → 24px → 32px → 40px
- **Weights:** 400 Normal, 500 Medium, 600 Semi-bold, 700 Bold
- **Display text** uses 700 weight, tight letter-spacing (`-0.02em`)
- **Body text** uses 400–500 weight, comfortable line-height (1.5–1.6)
- **Labels/Captions** use 500–600 weight, slightly tracked (`0.01em`)

### Gradients
| Name | Definition |
|---|---|
| Hero | `linear-gradient(135deg, #171A21 0%, #0F6F73 100%)` |
| Premium Badge | `linear-gradient(135deg, #F77F00 0%, #E06B00 100%)` |
| Primary Button | `linear-gradient(135deg, #0F6F73 0%, #1A9DA3 100%)` |
| Text/Stats | `linear-gradient(90deg, #0F6F73 0%, #F77F00 100%)` |

### Backgrounds
- Light surfaces: `#FFFFFF` or very light teal-tinted gray (`#F4F8F8`)
- Dark surfaces: `#171A21` (charcoal)
- Hero sections use the dark-to-teal gradient, often with subtle noise or blur overlay
- No heavy full-bleed photography or hand-drawn illustrations; design is geometric and clean

### Spacing
Based on a **4px grid**: 4, 8, 12, 16, 24, 32, 48, 64px
- Component internal padding: 12–24px
- Section vertical rhythm: 48–64px
- Card gap: 16–24px

### Border Radius
| Element | Radius |
|---|---|
| Buttons | 12px |
| Interactive Cards | 20px |
| Informational Cards | 12px |
| Inputs | 12px |
| Badges/Pills | 999px (full pill) |

### Cards
- **Informational:** 12px radius, no shadow, static — subtle border (`1px solid rgba(15,111,115,0.12)`)
- **Interactive:** 20px radius, `box-shadow: 0 4px 24px rgba(15,111,115,0.12)`, hover lifts with `transform: translateY(-2px) scale(1.01)` + deeper shadow
- **Gradient Accent:** 3px gradient top border (`border-top: 3px solid; border-image: linear-gradient(90deg, #0F6F73, #F77F00) 1`)

### Shadows / Elevation
| Level | Value |
|---|---|
| Low | `0 1px 4px rgba(23,26,33,0.08)` |
| Medium | `0 4px 16px rgba(23,26,33,0.12)` |
| High | `0 8px 32px rgba(23,26,33,0.16)` |
| Teal glow | `0 4px 24px rgba(15,111,115,0.18)` |

### Animation
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` (material standard ease)
- **Duration:** 150ms for micro (hover), 250ms for medium (card lift), 400ms for entrances
- **Hover states:** Cards lift + shadow deepens; buttons darken slightly + subtle shadow
- **Press states:** Buttons scale down `scale(0.97)`, color shifts darker
- **No bouncy springs.** Transitions are smooth and professional.

### Hover & Press States
- Primary button hover: gradient shifts brighter; slight teal glow shadow
- Secondary button hover: teal background at low opacity (`rgba(15,111,115,0.06)`)
- Card hover: `translateY(-2px)`, shadow deepens
- Link hover: underline appears, color shifts to `#1A9DA3`

### Transparency & Blur
- Used sparingly. Modals/overlays use `backdrop-filter: blur(8px)` with a dark semi-transparent overlay
- Glass-card variant: `background: rgba(255,255,255,0.08); backdrop-filter: blur(12px)` for dark-bg sections

### Corner & Layout Rules
- No hairline borders without teal tint
- Max content width: 1200px, centered
- Fixed header on scroll (with blur backdrop)
- Cards in grids: 16–24px gap

---

## ICONOGRAPHY

No icon font or SVG sprite was provided with this design system specification. Based on the brand aesthetic, Profindle should use a **stroke-based icon system** consistent with Lucide Icons (available via CDN), which provides clean, minimal 2px-stroke icons that suit the professional tone.

- **Style:** Stroke icons, 2px weight, rounded line caps
- **Library:** Lucide Icons (`https://unpkg.com/lucide@latest`)
- **Size system:** 16px (inline), 20px (standard), 24px (UI), 32px (feature icons)
- **Color:** Inherits text color or uses `#0F6F73` for featured icons
- **No emoji used as icons**
- **No PNG icons** — all iconography is SVG/icon-font based
- Logo assets are in `assets/`

⚠️ *No logo files were provided. A constructed SVG wordmark is used as a placeholder in `assets/logo.svg`. Please provide the real logo files.*

---

## File Index

```
README.md                     ← This file
SKILL.md                      ← Agent skill definition
colors_and_type.css           ← CSS custom properties for all tokens
assets/
  logo.svg                    ← Profindle wordmark (placeholder)
preview/
  colors-brand.html           ← Brand color swatches
  colors-semantic.html        ← Semantic color roles
  colors-gradients.html       ← Gradient swatches
  type-scale.html             ← Typography scale specimen
  type-weights.html           ← Weight + style specimen
  spacing-tokens.html         ← Spacing scale tokens
  spacing-radii.html          ← Border radius tokens
  shadows.html                ← Shadow / elevation system
  btn-primary.html            ← Primary & secondary buttons
  btn-variants.html           ← All button variants
  cards-informational.html    ← Informational card styles
  cards-interactive.html      ← Interactive card styles
  inputs.html                 ← Form inputs & states
  badges.html                 ← Badge & pill components
ui_kits/
  app/
    README.md                 ← App UI kit notes
    index.html                ← Full app prototype
    Header.jsx                ← Navigation header
    HeroSection.jsx           ← Hero / banner component
    ProfileCard.jsx           ← Professional profile card
    SearchBar.jsx             ← Search component
    PremiumBadge.jsx          ← Premium tier badge
```
