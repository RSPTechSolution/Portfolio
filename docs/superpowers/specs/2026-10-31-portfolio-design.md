# Subodh Kant Portfolio: Design Spec

**Date:** 2026-10-31
**Status:** Approved in brainstorming. Awaiting written-spec review.
**Reference mockup:** sample F "Day / Night". The throwaway sample code lives in the brainstorming session scratchpad and is reproduced in behaviour by this spec.

## 1. Purpose and success criteria

**Goal:** a personal portfolio that gets Subodh Kant (1) hired full-time and (2) freelance clients.

**Audiences**
- Recruiters and hiring managers: need role fit, experience, and a résumé in under a minute.
- Prospective clients: need services, proof of delivery, and an easy way to make contact.

**Success means**
- A visitor can tell within the first screen who Subodh is, what he does, and how to hire him.
- Sending a recruiter `https://<domain>/?role=drupal` shows a Drupal-tuned page and the Drupal résumé.
- The site feels hand-crafted, not like a generic AI-generated theme. No navy/purple gradients, glowing orbs or generic glass cards.
- Lighthouse on mobile: Performance ≥ 90, Accessibility = 100, Best Practices ≥ 95, SEO = 100.
- The hero headline is visible (LCP) in under 2.5 s on a mid-range phone over 4G. CLS is under 0.1.
- The site works fully with JavaScript disabled and with `prefers-reduced-motion: reduce`.

**Out of scope for v1:** blog, CMS or admin, i18n, analytics beyond the Vercel/Netlify defaults, server-side code. Content lives in typed files so a later move to headless Drupal stays possible.

## 2. Content source of truth

All facts come from Subodh's three résumés (PHP Developer, Drupal Developer, Full-Stack Backend Developer). Nothing is invented.

- **Identity:** Subodh Kant, Ludhiana, India. 5+ years. English and Hindi.
- **Contact:** RATANP256@gmail.com, linkedin.com/in/subodh-kant. Phone +91 97809 63528 is **not shown publicly** unless Subodh opts in via `profile.showPhone`.
- **Experience**
  - LN Webworks Pvt Ltd, Oct 2021 – present. The title varies by role (see §4).
  - HB Infotech Pvt Ltd, PHP Developer, Mar 2021 – Jul 2021.
- **Education:** BCA, Gulzar Group of Institutions, Khanna (2018 – Jan 2021).
- **Featured projects**
  - Enterprise B2B Directory Platform (Drupal 10, Search API, Solr/OpenSearch, Redis, AI integrations; won a special award).
  - Ads Delivery System (FastAPI, Redis, PostgreSQL, Docker, AWS; sub-millisecond decisions; lifecycle Assigned → Delivered → Rendered → Seen → Clicked).
- **More work:** Drupal 7 → 9/10 migrations, headless Drupal APIs, payment/CRM/AI integrations, Drupal Commerce.
- **Awards:** Rising Star 2022 and Glowing Star 2023 (LN Webworks). **Certifications:** Python Programming, AI Tools.
- **Learning:** CI/CD, DSA in Python, AI/ML, deep learning and GenAI, backend system design, AWS.

**Unconfirmed content rules**
- `ai-tools.ts` entries carry `verify: true` until Subodh confirms them. Initial list: Claude Code, Cursor, ChatGPT, GitHub Copilot.
- Personal projects other than "this portfolio" carry `draft: true`. Drafts render only in dev.
- A production build **fails** if any `verify: true` or `draft: true` entry would be rendered (see §9).

## 3. Visual system

Two modes share one layout. Mode is `data-theme="day" | "night"` on `<html>`.

| Token | Day (clay) | Night (hardware) |
|---|---|---|
| `--bg` | `#f0ebe3` | `#1b1916` |
| `--surface` | `#f5f0e9` | `#24211d` |
| `--text` | `#151411` | `#ede4d4` |
| `--muted` | `#6f665b` | `#9a9082` |
| `--accent` | `#ff4a1c` (vermilion) | `#ffb547` (amber) |
| `--line` | `#151411` | `#3a352d` |
| `--out` / `--in` shadows | warm clay (light highlight and soft drop) | neumorphic (dark lo `#100f0c`, hi `#2f2b25`) |

- **Fixed colours:** `--mint #6fe3a4` (status LEDs), butter `#f6c445`, sage `#a8c69f`, blush `#f4b6a6` (day card fills).
- **Type:** Bricolage Grotesque (display, `wdth` 75), Newsreader italic (accent words), Martian Mono (labels). Self-hosted WOFF2, subset, `font-display: swap`.
- **Default mode:** day on first visit, so visitors discover the switch. The choice persists in `localStorage`. The OS colour scheme does not auto-flip it.
- **All values live in `src/styles/tokens.css`.** No hard-coded colours in components.

## 4. Roles

`src/content/roles.ts` defines five roles. Each role sets:
- `title`: hero role line and the LN Webworks job title
- `resume`: PDF path and label
- `skillOrder`: ordered skill keys
- `highlight`: which section items stay full-strength; others dim to 35%

| Key | Title | Résumé |
|---|---|---|
| `all` (default) | Backend & Drupal Engineer · AI-assisted builder | menu offering all three PDFs |
| `drupal` | Drupal Developer · D7 → D11 | `Subodh_Kant_Drupal_developer.pdf` |
| `php` | PHP Developer | `Subodh_Kant_PHP_Developer.pdf` |
| `backend` | Full-Stack Backend Developer · Python / FastAPI | `Subodh_Kant_FullStack_Developer.pdf` |
| `ai` | AI-assisted Builder · Backend & Drupal | `Subodh_Kant_FullStack_Developer.pdf` |

**Behaviour**
- Selecting a role updates `?role=` with `history.replaceState`. On load, `?role=` is read, and invalid values fall back to `all`.
- The role is a `data-role` attribute on `<html>`. Server-rendered HTML shows `all`, and the script applies the URL role before first paint (inline script in `<head>`), so the page does not flash the wrong role.
- Skill reordering uses FLIP animation (650 ms) and is instant under reduced motion.
- Role controls are real `<button aria-pressed>` elements in a labelled group.

## 5. Page structure

Single page `/` plus `/work/enterprise-b2b-platform`, `/work/ads-delivery-system` and `/404`.

| # | Section | Content | Motion |
|---|---|---|---|
| 0 | Top bar (fixed) | Name; links to Work, Projects, Services and Contact; ☀/☾ power switch | Collapses to a clay menu button under 960 px |
| 1 | Hero | Giant name, role line, two-sentence pitch, role segmented control, "Hire me" and résumé buttons, 3D portrait, floating 3D objects | **Signature:** headline rise, portrait reveal, day/night circular reveal |
| 2 | Ticker | Drupal 11, PHP, FastAPI, Redis, PostgreSQL, Solr, Docker, AWS | Tilted marquee. Pauses on hover. Off for reduced motion. |
| 3 | About + numbers | Short story; stat pods (5+ yrs, D7→11, <1 ms, ×2 awards); live IST clock; languages | Count-up; level-meter bars in night mode |
| 4 | Two shifts | Day card (Drupal platforms) and night card (backend systems) | Clicking a card sets that mode |
| 5 | Stack | Grouped skill chips (Drupal, Languages, Backend, Data, DevOps, Tools) with level meters | FLIP reorder per role |
| 6 | AI Toolkit & Vibe Coding | Tool keycaps (name, "what I use it for"); workflow Prompt → Generate → Review → Test → Ship; line "AI drafts, I engineer: every line is reviewed, tested and owned." | Keycaps press down; workflow strip draws on scroll |
| 7 | Experience | LN Webworks, HB Infotech, BCA | Timeline line draws on scroll |
| 8 | Featured work | Enterprise B2B platform and Ads Delivery case-study cards linking to detail pages | **Signature:** live pipeline schematic on the Ads card (SVG; packets via `offset-path`) |
| 9 | Projects | Filter chips (All · Drupal · Backend · AI · Vibe-coded); cards with tags, "built with AI" badge, Live/GitHub links | Card tilt; FLIP on filter |
| 10 | More work | Hover-fill rows: migrations, headless APIs, integrations, Commerce | Fill wipe on hover/focus |
| 11 | Services | Four modules (Drupal platforms, APIs & microservices, Upgrades & migrations, Performance rescue) with expand switches; "How I work" Discover → Build → Ship → Support | `grid-template-rows` expand |
| 12 | Awards & certifications | Four clay badges | Tilt on hover |
| 13 | Currently learning | LCD "now playing" list | Typed line, blinking cursor |
| 14 | Contact | "Let's talk.", Formspree form (name, email, message, "I'm a recruiter / client" radio), email, LinkedIn, three résumé links, availability LED | Button press feedback |
| 15 | Footer | © 2026, location, awards line | none |

**Case-study pages** follow one template: problem, my role, architecture (diagram), stack, outcome, next/prev links.

**404 page:** a "signal lost" CRT screen with a link home.

## 6. Interactive systems

### 6.1 Day/night switch (`scripts/theme.ts`)
- A rocker button with `aria-pressed` and a label that states the target mode.
- It uses `document.startViewTransition` with a clip-path circle animated from the switch centre (900 ms).
- Fallback: an instant swap. Reduced motion also gets an instant swap.
- It emits a `themechange` CustomEvent. The portrait and clay modules listen and re-tint their materials (60-frame lerp).

### 6.2 3D portrait (`scripts/portrait3d.ts`)
- **Layered parallax only:** a flat subject cut-out plane (`z = 0.05`, scale 1.06) over a flat background plane (`z = -0.45`, scale 1.4) inside a group.
- **No vertex displacement of the face, ever.** That includes cursor bulges and depth maps (§10).
- **Pointer:** the group tilts at most ±0.105 rad (y) and ±0.07 rad (x). The subject drifts horizontally ≤ 0.026 and never lifts above the frame bottom. Lerp 0.06 per frame.
- **Day shader:** linear → sRGB conversion plus faint grain. The photo is pre-graded, so there is no extra grade.
- **Night shader:** amber monochrome with scanlines, slight chromatic offset, vignette, curve 0.05.
- **Intro:** a bottom-to-top scan reveal over 2.2 s.
- **Fit:** "cover" (overscan 0.9) inside a rounded frame with `overflow: hidden`.
- **Loading:** lazy-imported. Before it loads, a static `<img>` of the composited photo is shown (also the LCP and no-JS fallback).
- Rendering pauses off-screen and when the tab is hidden. Pixel ratio is ≤ 1.5 on touch devices.

### 6.3 Floating 3D objects (`scripts/clay3d.ts`)
- 6–7 objects: knob, keycap, torus, sphere, blob, LED.
- **Day:** matte clay (roughness 0.8, sheen). **Night:** glossy rubber (roughness 0.35, clearcoat 0.8, amber rim light).
- Mouse parallax and scroll drift. Pauses off-screen.
- Mobile: scale 0.7. Reduced motion: one static frame.

### 6.4 Cursor (`scripts/cursor.ts`)
- A colour-inverting dot. It grows to a 50 px circle on links and a 92 px "VIEW" disc on `[data-view]`.
- Enabled only for `(hover:hover) and (pointer:fine)` without reduced motion. Native cursors stay on everywhere else.

### 6.5 Other scripts
- `reveal.ts`: GSAP ScrollTrigger reveals and count-ups. Initial hidden states are set only under the `.js` class.
- `pipeline.ts`: draws the schematic wires on scroll.
- `projects.ts`: filter chips with FLIP.
- `contact.ts`: form submit via `fetch`, with inline success/error status (`aria-live="polite"`) and `mailto:` fallback.

## 7. Architecture

- **Stack:** Astro 5 + TypeScript (strict), vanilla Three.js and GSAP (+ ScrollTrigger) installed from npm and version-pinned.
- **Hosting:** static output on Vercel (Netlify-compatible). Contact via Formspree.

```
src/
  content/
    profile.ts roles.ts skills.ts experience.ts services.ts
    awards.ts learning.ts ai-tools.ts
    projects/*.md        # frontmatter: title, summary, tags[], vibeCoded, links{live,github}, draft
    case-studies/*.md    # frontmatter + body sections
    config.ts            # zod schemas for every collection/file
  components/
    sections/*.astro     # one per §5 row
    ui/*.astro           # PowerSwitch, RoleControl, ClayCard, Chip, Keycap, Switch, Led, Meter, Button
  layouts/Base.astro     # head, fonts, inline theme/role boot script, top bar, cursor root
  pages/index.astro  work/[slug].astro  404.astro
  scripts/*.ts           # §6, imported only by the components that need them
  styles/tokens.css global.css
public/
  img/portrait-subject.avif|webp|png  portrait-bg.avif|webp  portrait-composite.avif|webp|jpg
  resumes/*.pdf
tools/
  enhance_photo.py       # rebuilds portrait layers from a source photo (OpenCV)
tests/
  unit/*.test.ts         # Vitest
  e2e/*.spec.ts          # Playwright
```

**Unit boundaries**
- Sections render content only.
- Scripts own behaviour and talk through `data-*` attributes and `themechange`/`rolechange` events.
- Content modules have no knowledge of markup.

## 8. Accessibility and performance

- Semantic landmarks, one `h1`, logical heading order. Split-text headings keep `aria-label`.
- Decorative canvases use `aria-hidden`.
- All controls are keyboard-reachable with a visible `:focus-visible` ring.
- Hover reveals also trigger on `:focus-within`.
- Contrast is AA in both modes, including the accent on surface. It is verified with axe in e2e.
- Marquee and other loops longer than 5 s stop for reduced motion, and the marquee pauses on hover/focus.
- `prefers-reduced-transparency` and `prefers-contrast: more` switch to solid surfaces.
- Three.js and the portrait/clay scripts are lazy-loaded after first paint. GSAP is loaded with the first section that needs it.
- Images are served as AVIF/WebP with explicit dimensions. The hero image uses `fetchpriority="high"`.

## 9. Error handling and checks

- **Contact form:** client-side validation (required fields, email format). On network or Formspree failure it shows an inline error with a `mailto:` link, and the user's input is kept.
- **WebGL unavailable or context lost:** keep the static portrait image and hide the canvases. No console errors.
- **`startViewTransition` missing:** instant theme swap.
- **Content check:** `npm run check:content` fails the production build if a `verify: true` AI tool or a `draft: true` project would render. It is run in `prebuild`.
- **Schema validation:** zod in `content/config.ts` fails the build on missing fields.

## 10. Portrait rules (non-negotiable)

- Never alter Subodh's face or face shape.
- **Allowed:** crop/align, uniform scaling, tone/colour grading, sharpening, background-only blur/cut-out.
- **Forbidden:** generative regeneration, retouching, warping or displacement of the face.
- `tools/enhance_photo.py` crops the source to 4:5, with the eyes on the upper third and look-room on the right. It then:
  - upscales 2× (Lanczos)
  - applies CLAHE, vibrance and a warm grade
  - creates a GrabCut subject mask
  - blurs only the background
  - adds a vignette
  - exports `subject` (RGBA), `bg` (in-painted) and `composite` layers

## 11. Testing

- **Vitest:** role parsing/fallback, skill ordering per role, theme persistence, project filtering, content-check script.
- **Playwright** (Chromium, desktop 1440 × 900 and mobile 375 × 812):
  - page loads with no console errors
  - power switch toggles `data-theme` and `aria-pressed`
  - `?role=drupal` sets the title, résumé link and skill order
  - reduced-motion emulation leaves no running loops and shows everything
  - JavaScript disabled: all content and links are present
  - axe finds no violations in either mode
  - contact form success and error paths are tested with Formspree mocked
- **Lighthouse CI** on the preview build against the §1 targets.

## 12. Open items for Subodh (not blocking the build)

1. Confirm or edit the AI tools list and each tool's "what I use it for" line.
2. Supply real personal projects to replace the drafts.
3. Choose a domain name.
4. Set up the Formspree form ID.
5. Decide whether to show the phone number.
6. Optionally provide testimonials. The section is omitted until some exist.
7. Copy the three résumé PDFs into the repo (they will live in `public/resumes/`).
