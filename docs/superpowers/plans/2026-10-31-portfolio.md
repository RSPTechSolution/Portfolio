# Subodh Kant Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the static, animated "Day / Night" portfolio described in the spec, deployable to Vercel.

**Architecture:**
- Astro renders every section to plain HTML from typed content files.
- Small TypeScript modules add behaviour afterwards: theme, roles, 3D portrait, clay objects, cursor, reveals, filters and the contact form.
- The modules communicate only through `data-*` attributes on `<html>` and two CustomEvents (`themechange`, `rolechange`).
- Three.js modules are lazy-loaded and degrade to static images.

**Tech Stack:** Astro 5, TypeScript (strict), Three.js 0.169, GSAP 3.12 (+ScrollTrigger), zod, Vitest + happy-dom, Playwright + @axe-core/playwright, Lighthouse CI, Python 3 + OpenCV (photo tool only).

**Spec:** `docs/superpowers/specs/2026-10-31-portfolio-design.md` (read it with this plan; § numbers below refer to it).

**Reference implementation (behaviour to port, not code to copy blindly):** Task 1 copies the approved sample F into `docs/reference/sample-f/`:
- `f-day-night.html`
- `portrait3d.js`
- `clay3d.js`
- `roles.js`
- `enhance_photo.py`
- the generated `photo-subject.png` and `photo-bg.png`

## Global Constraints

- **Node ≥ 20, pinned versions:** `astro@^5`, `three@0.169.0`, `gsap@3.12.5`, `zod@^3`. No other runtime dependencies without a reason in the commit message.
- **Colours:** tokens from spec §3 verbatim, defined only in `src/styles/tokens.css`. Components never hard-code colours.
- **Default theme:** `day` on first visit. The choice is stored in `localStorage` key `sk-theme`. The OS colour scheme never auto-flips it.
- **Role keys:** exactly `all | drupal | php | backend | ai`. The URL param is `role`. Any other value means `all`.
- **Portrait (§10):** never displace or warp face pixels. The portrait is two flat planes, tilt ≤ ±0.105 rad (y) and ±0.07 rad (x).
- **Motion:** animate only `transform`, `opacity`, `clip-path` and `filter`. Every loop pauses off-screen and on hidden tabs.
- **Reduced motion:** `prefers-reduced-motion: reduce` means no movement. Show final states and render a single 3D frame.
- **Fallbacks:** every section is readable with JS disabled. Initial "hidden" animation states apply only under `html.js`.
- **Pointer devices:** cursor and tilt effects only under `(hover:hover) and (pointer:fine)`.
- **Phone number:** never rendered unless `profile.showPhone === true`.
- **Commit messages** end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Hostile or odd `?role=` values** (`DRUPAL`, `drupal ` with a space, `<script>`, a repeated param) → treat case-insensitively and trimmed. Unknown values become `all` and are never injected into the DOM. Test in Task 3.
2. **`localStorage` throws** (Safari private mode, blocked storage) → the theme still toggles and no exception reaches the console. Test in Task 4.
3. **Rapid repeated power-switch clicks during a view transition** → the final `data-theme` matches `aria-pressed` and the stored value. Test in Task 4.
4. **WebGL unavailable or context lost** → the static portrait `<img>` stays visible, the canvases hide, and the console stays clean. Test in Task 5.
5. **Contact submit fails** (network error or non-2xx response), or the user double-clicks submit → the input is kept, an error and `mailto:` link appear, and only one request is sent. Test in Task 10.

---

### Task 1: Scaffold, tokens, base layout

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json` (extends `astro/tsconfigs/strict`), `vitest.config.ts` (environment `happy-dom`), `playwright.config.ts` (projects `desktop` 1440×900 and `mobile` 375×812; `webServer: npm run preview`), `.gitignore` (node_modules, dist, .astro, test-results, `/photo.png`)
- Create: `src/styles/tokens.css`, `src/styles/global.css`, `src/layouts/Base.astro`, `src/pages/index.astro` (placeholder `<h1>`)
- Create: `public/fonts/` with WOFF2 subsets of Bricolage Grotesque (variable opsz/wdth/wght), Newsreader italic 400/500 and Martian Mono 300/400/600
- Create: `docs/reference/sample-f/*`, copied from `C:\Users\Lenovo\AppData\Local\Temp\claude\d--Subodh-PortFolio\a8fa645c-98b3-4c89-8df5-4a20e6c0f7db\scratchpad\theme-samples\` (`f-day-night.html`, `portrait3d.js`, `clay3d.js`, `roles.js`, `photo-subject.png`, `photo-bg.png`) and `...\scratchpad\enhance_photo.py`
- Test: `tests/e2e/smoke.spec.ts`

**Interfaces:**
- Produces: `Base.astro` props `{ title: string; description: string }`. It renders `<html lang="en" data-theme="day" data-role="all">` and an inline `<script is:inline>` in `<head>` that:
  - adds class `js`
  - applies the stored theme and URL role before paint (this logic is later replaced by imports from Tasks 3–4; for now it only adds `js`)
  - provides a `<slot name="topbar">`, the main `<slot>`, and `<div id="cursor" aria-hidden="true">`
- Produces: npm scripts `dev`, `build` (with `prebuild` hook added in Task 2), `preview`, `test` (vitest run), `e2e` (playwright test), `check` (astro check)
- Produces: CSS custom properties from spec §3 under `[data-theme="day"]` and `[data-theme="night"]`, plus `--disp`, `--serif`, `--mono`, `--ease: cubic-bezier(.2,.7,.1,1)`, and the global reduced-motion block (spec skill guardrail)

- [ ] **Step 1:** Run `npm create astro@latest . -- --template minimal --typescript strict --no-git --install`, then `npm i three@0.169.0 gsap@3.12.5 zod` and `npm i -D vitest happy-dom @playwright/test @axe-core/playwright @types/three`. Then run `npx playwright install chromium`.
- [ ] **Step 2: Write `tests/e2e/smoke.spec.ts`**

```ts
test('home loads with no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', m => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'day');
  await expect(page.locator('html')).toHaveClass(/js/);
  expect(errors).toEqual([]);
});
```

- [ ] **Step 3:** Run `npm run build && npx playwright test smoke`. Expected: FAIL until `Base.astro` sets the attributes.
- [ ] **Step 4:** Implement `tokens.css`, `global.css` (font-faces, base type, `:focus-visible` ring using `--accent`, the `.mono` label style) and `Base.astro`.
- [ ] **Step 5:** Run `npm run build && npx playwright test smoke`. Expected: PASS on both projects.
- [ ] **Step 6:** Commit with `chore: scaffold Astro project, tokens and base layout`.

### Task 2: Content layer and unconfirmed-content guard

**Files:**
- Create: `src/content/schemas.ts`
- Create: `src/content/data/{profile,roles,skills,experience,services,awards,learning,ai-tools,more-work}.ts`
- Create: `src/content.config.ts` (Astro 5 location; it replaces the spec's `content/config.ts`)
- Create: `src/content/projects/{portfolio,draft-1,draft-2,draft-3}.md`
- Create: `src/content/case-studies/{enterprise-b2b-platform,ads-delivery-system}.md`
- Create: `scripts/check-content.ts`
- Test: `tests/unit/content.test.ts`, `tests/unit/check-content.test.ts`

**Interfaces:**
- Produces (in `schemas.ts`, each with a zod schema of the same name + `Schema`):

  ```ts
  type RoleKey = 'all' | 'drupal' | 'php' | 'backend' | 'ai';
  type SkillKey = 'drupal' | 'php' | 'python' | 'redis' | 'postgres' | 'mysql' | 'docker' | 'aws' | 'search' | 'js' | 'ai';
  interface Profile { name; location; email; linkedin; phone; showPhone: boolean; years: number; languages: string[]; availability: string }
  interface Role { key: RoleKey; label: string; title: string; resumes: { href: string; label: string }[]; skillOrder: SkillKey[] }
  interface Skill { key: SkillKey; name: string; group: 'Drupal'|'Languages'|'Backend'|'Data'|'DevOps'|'Tools'; level: number /*0-100*/; spec: string; roles: RoleKey[] }
  interface AiTool { name: string; use: string; verify: boolean }
  interface Experience { org; title: string | Partial<Record<RoleKey,string>>; start: string; end: string | null; points: string[] }
  interface Service { key; title; summary; details; roles: RoleKey[] }
  interface Award { name; issuer; year?: number; kind: 'award'|'cert' }
  ```

- Produces: content collections `projects` (frontmatter `{ title, summary, tags: ('drupal'|'backend'|'ai'|'vibe-coded')[], vibeCoded: boolean, links: { live?: url; github?: url }, roles: RoleKey[], draft: boolean, order: number }`) and `caseStudies` (`{ title, slug, summary, stack: string[], roles: RoleKey[], order: number }`, plus body sections `## Problem`, `## My role`, `## Architecture`, `## Stack`, `## Outcome`)
- Produces: `findUnconfirmed(input: { aiTools: AiTool[]; projects: { id: string; draft: boolean }[] }): { blocking: string[]; info: string[] }`.
  - `blocking` lists `verify: true` tools, which would render, e.g. `ai-tools: "Cursor" is unverified`.
  - `info` lists drafts, which never render in production because Projects excludes them when `import.meta.env.PROD`.
  - The CLI `npx tsx scripts/check-content.ts` exits 1 when `NODE_ENV=production` and `blocking` is non-empty. Otherwise it prints both lists and exits 0.
- **Data values:**
  - All content comes from spec §2. Roles and resumes follow spec §4, with PDFs at `/resumes/<original filename>`. The `all` role lists all three résumés.
  - AI tools: Claude Code, Cursor, ChatGPT, GitHub Copilot, all `verify: true`.
  - `portfolio.md` has `draft: false` and `vibeCoded: true`. Drafts have `draft: true`.
  - Experience titles: LN Webworks gets the per-role title from spec §4. HB Infotech is "PHP Developer".

- [ ] **Step 1: Write the failing tests**

```ts
// content.test.ts
test('every data file parses', () => { expect(() => ProfileSchema.parse(profile)).not.toThrow(); /* same for each */ });
test('roles cover exactly the five keys', () => expect(roles.map(r => r.key).sort()).toEqual(['ai','all','backend','drupal','php']));
test('each role skillOrder is a permutation of all skill keys', () => roles.forEach(r => expect([...r.skillOrder].sort()).toEqual(skills.map(s => s.key).sort())));
test('phone hidden by default', () => expect(profile.showPhone).toBe(false));
// check-content.test.ts
test('verify blocks, draft is info', () => { const r = findUnconfirmed({ aiTools: [{ name: 'Cursor', use: 'x', verify: true }], projects: [{ id: 'd1', draft: true }] }); expect(r.blocking).toHaveLength(1); expect(r.info).toHaveLength(1); });
test('clean content passes', () => expect(findUnconfirmed({ aiTools: [{ name: 'X', use: 'y', verify: false }], projects: [] }).blocking).toEqual([]));
```

- [ ] **Step 2:** Run `npm test`. Expected: FAIL (modules missing).
- [ ] **Step 3:** Implement `schemas.ts`, the data files, the collections and `check-content.ts`. Add `"prebuild": "tsx scripts/check-content.ts"` to `package.json` (`npm i -D tsx`).
- [ ] **Step 4:** Run `npm test`. Expected: PASS. Run `NODE_ENV=production npx tsx scripts/check-content.ts`. Expected: exit code 1, with the 4 AI tools blocking and the 3 drafts as info. (This is intentional until Subodh confirms; `npm run build` uses the warn mode, and `npm run build:prod` sets `NODE_ENV=production`.)
- [ ] **Step 5:** Commit with `feat: typed content layer and unconfirmed-content guard`.

### Task 3: Roles

**Files:**
- Create: `src/scripts/roles.ts`, `src/components/ui/RoleControl.astro`
- Modify: `src/layouts/Base.astro` (inline boot sets `data-role` from the URL)
- Test: `tests/unit/roles.test.ts`, `tests/e2e/roles.spec.ts`

**Interfaces:**
- Consumes: `Role`, `RoleKey` and `roles` from Task 2.
- Produces:
  - `parseRole(search: string): RoleKey`
  - `orderByRole<T extends { key: string }>(items: T[], order: string[]): T[]`
  - `applyRole(role: RoleKey, opts?: { push?: boolean }): void`

  `applyRole` sets `html[data-role]` and `aria-pressed` on every `[data-role-btn]`. It sets the text of `[data-role-title]` to `role.title`. It rebuilds `[data-role-resume]` links. It toggles `.is-dim` on `[data-roles]` elements whose space-separated list lacks the role (never when the role is `all`). It FLIP-reorders the children of `[data-role-list]` by `data-skill` (650 ms, instant under reduced motion). It calls `history.replaceState` (removing the param for `all`). It dispatches `rolechange` on `document` with `detail: { role }`.
- Produces: `RoleControl.astro` renders a `role="group" aria-label="View portfolio as"` element containing five `<button data-role-btn>` elements and a sliding `.pill` (sample F `.seg`).

- [ ] **Step 1: Write the failing tests**

```ts
test.each([['?role=drupal','drupal'],['?role=DRUPAL','drupal'],['?role=%20php%20','php'],['?role=<script>','all'],['?role=ai&role=php','ai'],['','all']])('parseRole(%s)', (q, r) => expect(parseRole(q)).toBe(r));
test('orderByRole keeps unknown keys at end in original order', () => expect(orderByRole([{key:'x'},{key:'b'},{key:'a'}], ['a','b']).map(i=>i.key)).toEqual(['a','b','x']));
```

```ts
// e2e
test('?role=drupal tunes the page', async ({ page }) => {
  await page.goto('/?role=drupal');
  await expect(page.locator('html')).toHaveAttribute('data-role', 'drupal');
  await expect(page.locator('[data-role-title]').first()).toHaveText('Drupal Developer · D7 → D11');
  await expect(page.locator('[data-role-resume]').first()).toHaveAttribute('href', '/resumes/Subodh_Kant_Drupal_developer.pdf');
  await expect(page.locator('[data-role-list] [data-skill]').first()).toHaveAttribute('data-skill', 'drupal');
});
test('clicking Backend updates URL', async ({ page }) => { await page.goto('/'); await page.getByRole('button', { name: 'Backend' }).click(); await expect(page).toHaveURL(/role=backend/); });
test('hostile role value is not rendered', async ({ page }) => { await page.goto('/?role=%3Cimg%20src%3Dx%3E'); await expect(page.locator('html')).toHaveAttribute('data-role', 'all'); await expect(page.locator('img[src="x"]')).toHaveCount(0); });
```

- [ ] **Step 2:** Run `npm test -- roles`. Expected: FAIL.
- [ ] **Step 3:** Implement `roles.ts` (the parse lowercases and trims the first `role` param, then checks it against the key list) and `RoleControl.astro`. Base's inline boot calls the same parsing logic and inlines the five keys. Put a temporary `RoleControl`, a role title, a résumé link and a `[data-role-list]` on `index.astro` so the e2e test can run (Task 7 replaces them).
- [ ] **Step 4:** Run `npm test -- roles && npm run build && npx playwright test roles`. Expected: PASS.
- [ ] **Step 5:** Commit with `feat: role switcher with ?role= deep links`.

### Task 4: Day/night theme

**Files:**
- Create: `src/scripts/theme.ts`, `src/components/ui/PowerSwitch.astro`, `src/components/TopBar.astro`
- Modify: `src/layouts/Base.astro` (inline boot applies the stored theme)
- Test: `tests/unit/theme.test.ts`, `tests/e2e/theme.spec.ts`

**Interfaces:**
- Produces:
  - `type Theme = 'day' | 'night'`
  - `readTheme(storage: Pick<Storage,'getItem'> | null): Theme` (default `day`; any throw → `day`)
  - `writeTheme(t: Theme, storage: Pick<Storage,'setItem'> | null): void` (swallows throws)
  - `setTheme(t: Theme, from?: { x: number; y: number }): Promise<void>`

  `setTheme` serialises calls with a promise queue, so only the last requested theme wins. It uses `document.startViewTransition` with a clip-path circle animated from `from` over 900 ms (`cubic-bezier(.7,0,.2,1)`). With no API or under reduced motion it swaps instantly. It updates `html[data-theme]`, the switch's `aria-pressed` and `aria-label` ("Switch to night shift" / "Switch to day shift"), and the label text ("Day shift" / "Night shift"). It writes storage and dispatches `themechange` with `detail: { theme }`.
- Produces: `TopBar.astro` (name, links Work/Projects/Services/Contact, `PowerSwitch`, and a clay menu button below 960 px toggling `aria-expanded`). `PowerSwitch.astro` is `<button id="power" class="rocker" aria-pressed="false">` (styling per sample F `.rocker`).

- [ ] **Step 1: Write the failing tests**

```ts
test('readTheme defaults to day and survives throwing storage', () => {
  expect(readTheme(null)).toBe('day');
  expect(readTheme({ getItem: () => { throw new Error('denied'); } })).toBe('day');
  expect(readTheme({ getItem: () => 'night' })).toBe('night');
  expect(readTheme({ getItem: () => 'purple' })).toBe('day');
});
test('writeTheme swallows storage errors', () => expect(() => writeTheme('night', { setItem: () => { throw new Error(); } })).not.toThrow());
```

```ts
// e2e
test('switch toggles theme and persists', async ({ page }) => {
  await page.goto('/'); await page.locator('#power').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
  await expect(page.locator('#power')).toHaveAttribute('aria-pressed', 'true');
  await page.reload(); await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
});
test('rapid clicks end consistent', async ({ page }) => {
  await page.goto('/'); for (let i = 0; i < 5; i++) await page.locator('#power').click({ delay: 0 });
  await page.waitForTimeout(1200);
  const theme = await page.locator('html').getAttribute('data-theme');
  await expect(page.locator('#power')).toHaveAttribute('aria-pressed', String(theme === 'night'));
  expect(theme).toBe('night');
});
test('dark OS does not auto-flip', async ({ browser }) => { const p = await (await browser.newContext({ colorScheme: 'dark' })).newPage(); await p.goto('/'); await expect(p.locator('html')).toHaveAttribute('data-theme', 'day'); });
test('blocked storage still toggles', async ({ page }) => { await page.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new Error('denied'); } })); const errs: string[] = []; page.on('pageerror', e => errs.push(e.message)); await page.goto('/'); await page.locator('#power').click(); await expect(page.locator('html')).toHaveAttribute('data-theme', 'night'); expect(errs).toEqual([]); });
```

- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement `theme.ts`, `PowerSwitch.astro` and `TopBar.astro`. Mount `TopBar` in Base's `topbar` slot from `index.astro`.
- [ ] **Step 4:** Run `npm test -- theme && npm run build && npx playwright test theme`. Expected: PASS.
- [ ] **Step 5:** Commit with `feat: day/night power switch with circular view transition`.

### Task 5: Hero, portrait pipeline and layered 3D portrait

**Files:**
- Create: `tools/enhance_photo.py` (from the reference; CLI `python tools/enhance_photo.py <src> <outdir>` writes `portrait-subject.png`, `portrait-bg.png`, `portrait-composite.jpg` and `compare.png`), `tools/requirements.txt` (`opencv-python-headless`, `numpy`)
- Create: `public/img/portrait-*.{avif,webp,png,jpg}` (generated from `D:\Subodh-PortFolio\photo.png`; AVIF/WebP via Astro `<Picture>` from `src/assets/portrait-composite.jpg`)
- Create: `src/scripts/portrait3d.ts`, `src/components/sections/Hero.astro`
- Test: `tests/unit/portrait3d.test.ts`, `tests/e2e/hero.spec.ts`

**Interfaces:**
- Consumes: `Theme` and `themechange` (Task 4), `rolechange` and `RoleControl` (Task 3), `profile` (Task 2).
- Produces:
  - `clampPose(nx: number, ny: number): { ry: number; rx: number; fx: number; fy: number }` (pure). Input is pointer position normalised 0..1 over the frame. Output limits: `|ry| ≤ 0.105`, `|rx| ≤ 0.07`, `|fx| ≤ 0.0263`, `fy ≤ 0`.
  - `hasWebGL(): boolean`
  - `mountPortrait(frame: HTMLElement, src: { subject: string; bg: string }): Promise<{ setTheme(t: Theme): void; destroy(): void } | null>`

  `mountPortrait` returns `null`, leaving the `<img>`, when WebGL is unavailable. It shaders and tunes the planes per spec §6.2 (port `portrait3d.js` layered branch with modes `natural`/`crt`; drop halftone and duotone). On `webglcontextlost` it removes the canvas and un-hides the `<img>`.
- Produces: `Hero.astro` contains:
  - the giant name `h1` (aria-label "Subodh Kant")
  - `[data-role-title]` and the pitch from spec §5 row 1
  - `RoleControl`
  - "Hire me" → `#contact` and the résumé button `[data-role-resume]`
  - `<figure class="frame" data-portrait>` holding `<Picture fetchpriority="high">` of the composite (width/height set) and a `<canvas aria-hidden>` added by script
  - the "5+ yrs" tag

  The script lazy-imports `portrait3d.ts` after `requestIdleCallback` (fallback `setTimeout` 200).

- [ ] **Step 1: Write the failing tests**

```ts
test.each([[0,0],[1,1],[0.5,0.5],[1,0]])('clampPose(%d,%d) stays in bounds', (x, y) => {
  const p = clampPose(x, y);
  expect(Math.abs(p.ry)).toBeLessThanOrEqual(0.105); expect(Math.abs(p.rx)).toBeLessThanOrEqual(0.07);
  expect(Math.abs(p.fx)).toBeLessThanOrEqual(0.0263); expect(p.fy).toBeLessThanOrEqual(0);
});
test('centre is neutral', () => expect(clampPose(0.5, 0.5)).toEqual({ ry: 0, rx: 0, fx: 0, fy: 0 }));
```

```ts
// e2e
test('hero portrait image is the LCP candidate and visible', async ({ page }) => { await page.goto('/'); await expect(page.locator('[data-portrait] img')).toBeVisible(); await expect(page.locator('[data-portrait] img')).toHaveAttribute('fetchpriority', 'high'); });
test('no WebGL keeps image and clean console', async ({ page }) => {
  await page.addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null; });
  const errs: string[] = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await page.goto('/'); await page.waitForTimeout(800);
  await expect(page.locator('[data-portrait] img')).toBeVisible(); expect(errs).toEqual([]);
});
```

- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Run `pip install -r tools/requirements.txt && python tools/enhance_photo.py photo.png src/assets/` and visually compare `compare.png` with the reference. The face must be unchanged and the crop must have the eyes on the upper third.
- [ ] **Step 4:** Implement `portrait3d.ts` and `Hero.astro` (layout and styles from sample F `.hero`, `.frame`, `.tag`; the night `.hud` overlay "● NIGHT CAM / CH-02"). Wire `themechange` → `setTheme`.
- [ ] **Step 5:** Run `npm test -- portrait3d && npm run build && npx playwright test hero`. Expected: PASS. Manually hover the portrait in `npm run dev`. The face must never deform, and no edges show at the corners.
- [ ] **Step 6:** Commit with `feat: hero with layered parallax 3D portrait and photo pipeline`.

### Task 6: Floating clay objects and cursor

**Files:**
- Create: `src/scripts/clay3d.ts`, `src/scripts/cursor.ts`
- Modify: `src/components/sections/Hero.astro` (adds `<canvas id="clay" aria-hidden="true">`)
- Test: `tests/unit/cursor.test.ts`, `tests/e2e/cursor.spec.ts`

**Interfaces:**
- Consumes: `Theme` and `themechange`, `hasWebGL` (Task 5).
- Produces:
  - `mountClay(canvas: HTMLCanvasElement, layout: ClayItem[]): { setTheme(t: Theme): void; destroy(): void } | null`, where `type ClayItem = [kind: 'torus'|'sphere'|'blob'|'knob'|'key'|'led', paletteIndex: number, x: number, y: number, z: number, scale?: number]`
    - Day palette: `['#ff4a1c','#f6c445','#a8c69f','#f4b6a6','#151411']`, matte.
    - Night palette: `['#ffb547','#ff5a36','#3a362f','#2a2722','#ede4d4']`, rubber.
    - Hero layout: copy from sample F.
  - `cursorMode(target: Element | null): 'view' | 'link' | 'dot'` (pure)
  - `initCursor(): void`: no-op unless `(hover:hover) and (pointer:fine)` and no reduced motion. When active it adds `html.has-cursor`, which hides the native cursor only under that class.

- [ ] **Step 1: Write the failing tests**

```ts
test('cursorMode', () => {
  document.body.innerHTML = '<a data-view id=v><span id=vs></span></a><button id=b></button><p id=p></p>';
  expect(cursorMode(document.getElementById('vs'))).toBe('view');
  expect(cursorMode(document.getElementById('b'))).toBe('link');
  expect(cursorMode(document.getElementById('p'))).toBe('dot');
});
```

```ts
// e2e (mobile project)
test('touch devices keep native cursor', async ({ page }) => { await page.goto('/'); await expect(page.locator('html')).not.toHaveClass(/has-cursor/); });
```

- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Port `clay3d.js` → `clay3d.ts`, taking geometry builders, the lerped material switch and the elastic intro from the reference. Render on resize. Pause via IntersectionObserver and `visibilitychange`. Implement `cursor.ts` with GSAP `quickTo`.
- [ ] **Step 4:** Run `npm test -- cursor && npm run build && npx playwright test cursor`. Expected: PASS.
- [ ] **Step 5:** Commit with `feat: floating clay/rubber objects and custom cursor`.

### Task 7: Ticker, About, Two shifts, Stack and reveal system

**Files:**
- Create: `src/scripts/reveal.ts`, `src/scripts/clock.ts`
- Create: `src/components/sections/{Ticker,About,TwoShifts,Stack}.astro`, `src/components/ui/{ClayCard,Chip,Meter,Led}.astro`
- Modify: `src/pages/index.astro` (replace the Task 3 temporaries with real sections in spec §5 order)
- Test: `tests/unit/clock.test.ts`, `tests/e2e/sections-a.spec.ts`

**Interfaces:**
- Consumes: `profile`, `skills`, `roles` (Task 2); `setTheme` (Task 4); the `[data-role-list]` contract (Task 3).
- Produces:
  - `formatIST(d: Date): string` → `HH:MM:SS IST` in `Asia/Kolkata`
  - `initReveal(root: ParentNode = document): void`: GSAP + ScrollTrigger. `[data-reveal]` animates `opacity`/`y` from 40 px. `[data-count]` counts up using `data-suffix`. `.vu` meters animate while visible. Under reduced motion it sets final states.
- **Copy:** Two shifts card titles are "Enterprise Drupal platforms" and "Real-time backends", with the lists from sample F. Clicking a card calls `setTheme('day'|'night')`.
- **Stack** renders `<ul data-role-list>` with `<li data-skill>` grouped by `group`, one Meter per skill.

- [ ] **Step 1: Write the failing tests**

```ts
test('formatIST', () => expect(formatIST(new Date('2026-10-31T08:15:30Z'))).toBe('13:45:30 IST'));
```

```ts
// e2e
test('stat pods show final values with reduced motion', async ({ page }) => { await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/'); await expect(page.getByText('5+', { exact: true }).first()).toBeVisible(); });
test('night card flips theme', async ({ page }) => { await page.goto('/'); await page.locator('.card.night').click(); await expect(page.locator('html')).toHaveAttribute('data-theme', 'night'); });
test('content visible without JS', async ({ browser }) => { const p = await (await browser.newContext({ javaScriptEnabled: false })).newPage(); await p.goto('/'); for (const t of ['Enterprise Drupal platforms', 'Real-time backends']) await expect(p.getByText(t)).toBeVisible(); });
```

- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement the sections, porting styles from sample F (`.shifts`, `.card.day/.night`, `.vu`) and samples D/B (marquee, pods). Use the tokens only.
- [ ] **Step 4:** Run `npm test && npm run build && npx playwright test sections-a roles`. Expected: PASS.
- [ ] **Step 5:** Commit with `feat: ticker, about, two shifts and stack sections`.

### Task 8: AI Toolkit, Experience, Featured work, case-study pages

**Files:**
- Create: `src/components/sections/{AiToolkit,Experience,FeaturedWork}.astro`, `src/components/ui/Keycap.astro`, `src/components/PipelineSchematic.astro`, `src/scripts/pipeline.ts`
- Create: `src/pages/work/[slug].astro`, `src/layouts/CaseStudy.astro`
- Test: `tests/e2e/sections-b.spec.ts`

**Interfaces:**
- Consumes: `aiTools`, `experience` (Task 2); the `caseStudies` collection; `RoleKey`.
- Produces:
  - `AiToolkit` renders a small "verify" badge on `verify: true` tools. The Task 2 guard stops a production build while any remain.
  - The workflow strip text is exactly: `Prompt → Generate → Review → Test → Ship`.
  - The tagline is exactly: "AI drafts, I engineer: every line is reviewed, tested and owned."
- Produces: `PipelineSchematic.astro` is an inline SVG with an accessible `role="img"` and `aria-label`. Its nodes are ASSIGNED, DELIVERED, RENDERED, SEEN, CLICKED, REDIS QUEUE and POSTGRESQL (from sample A), and its strokes use `currentColor` and `--accent`. `initPipeline(svg: SVGSVGElement): void` draws wires on scroll and runs packets via CSS `offset-path`, hidden under reduced motion.
- Produces: `/work/enterprise-b2b-platform` and `/work/ads-delivery-system` from the collection via `getStaticPaths`. Each page has Problem / My role / Architecture / Stack / Outcome sections and next/prev links. Ads Delivery embeds `PipelineSchematic`.
- **Experience:** the LN Webworks title uses `<span data-role-title>`. HB Infotech and BCA come from the data.

- [ ] **Step 1: Write the failing tests**

```ts
test('case study pages render', async ({ page }) => {
  for (const s of ['enterprise-b2b-platform', 'ads-delivery-system']) { await page.goto(`/work/${s}`); for (const h of ['Problem','My role','Architecture','Stack','Outcome']) await expect(page.getByRole('heading', { name: h })).toBeVisible(); }
});
test('pipeline is labelled', async ({ page }) => { await page.goto('/'); await expect(page.getByRole('img', { name: /Assigned.*Clicked/ })).toBeVisible(); });
test('workflow strip copy', async ({ page }) => { await page.goto('/'); await expect(page.getByText('Prompt → Generate → Review → Test → Ship')).toBeVisible(); });
```

- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement. Write the case-study bodies from spec §2 facts only (no invented metrics).
- [ ] **Step 4:** Run `npm run build && npx playwright test sections-b`. Expected: PASS.
- [ ] **Step 5:** Commit with `feat: AI toolkit, experience, featured work and case studies`.

### Task 9: Projects, More work, Services, Awards, Learning

**Files:**
- Create: `src/scripts/projects.ts`, `src/scripts/toggles.ts`
- Create: `src/components/sections/{Projects,MoreWork,Services,Awards,Learning}.astro`, `src/components/ui/Switch.astro`
- Test: `tests/unit/projects.test.ts`, `tests/e2e/sections-c.spec.ts`

**Interfaces:**
- Consumes: the `projects` collection, `services`, `awards`, `learning`, `more-work` (Task 2).
- Produces:
  - `filterProjects<T extends { tags: string[] }>(items: T[], filter: 'all'|'drupal'|'backend'|'ai'|'vibe-coded'): T[]`
  - `initProjectFilter(root: HTMLElement): void`: chips are `<button aria-pressed>` and FLIP the cards.
  - Projects render with `draft: true` excluded in production. Cards carry `data-tags` and `data-view`, plus a "Built with AI" badge when `vibeCoded`.
- Produces: `initToggles(root: ParentNode = document): void`: every `.switch[aria-expanded]` toggles `.open` on its closest `[data-module]` (Services).
- **Copy:** "How I work" is exactly `Discover → Build → Ship → Support`. Awards are four badges from spec §2. Learning is an LCD list from spec §2.

- [ ] **Step 1: Write the failing tests**

```ts
const items = [{ tags: ['drupal'] }, { tags: ['backend', 'ai'] }, { tags: ['vibe-coded', 'ai'] }];
test('filterProjects', () => { expect(filterProjects(items, 'all')).toHaveLength(3); expect(filterProjects(items, 'ai')).toHaveLength(2); expect(filterProjects(items, 'drupal')).toHaveLength(1); });
```

```ts
test('service module expands via keyboard', async ({ page }) => { await page.goto('/'); const sw = page.locator('[data-module] .switch').first(); await sw.focus(); await page.keyboard.press('Enter'); await expect(sw).toHaveAttribute('aria-expanded', 'true'); });
test('vibe-coded filter shows portfolio', async ({ page }) => { await page.goto('/'); await page.getByRole('button', { name: 'Vibe-coded' }).click(); await expect(page.locator('#projects [data-tags*="vibe-coded"]').first()).toBeVisible(); });
```

- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement, porting styles from sample D `.mod`/`.switch` and sample F `.rows`.
- [ ] **Step 4:** Run `npm test && npm run build && npx playwright test sections-c`. Expected: PASS.
- [ ] **Step 5:** Commit with `feat: projects, more work, services, awards and learning`.

### Task 10: Contact, footer, 404

**Files:**
- Create: `src/scripts/contact.ts`, `src/components/sections/{Contact,Footer}.astro`, `src/pages/404.astro`
- Test: `tests/unit/contact.test.ts`, `tests/e2e/contact.spec.ts`

**Interfaces:**
- Consumes: `profile`, `roles` (résumé links).
- Produces:
  - `validateContact(d: { name: string; email: string; message: string; kind: 'recruiter'|'client' | '' }): { ok: boolean; errors: Partial<Record<'name'|'email'|'message'|'kind', string>> }`
  - `submitContact(form: HTMLFormElement, fetchImpl: typeof fetch = fetch): Promise<'ok'|'error'|'invalid'>`

  `submitContact` disables the submit button while in flight, so a second call returns early with `'invalid'` without fetching. It POSTs `FormData` to `form.action` (`https://formspree.io/f/${import.meta.env.PUBLIC_FORMSPREE_ID}`) with `Accept: application/json`. On `'ok'` it resets the form and shows "Thanks, I'll reply within a day." On `'error'` it keeps the fields and shows "Couldn't send. Email me at RATANP256@gmail.com" with a `mailto:` link. Status goes in `aria-live="polite"`.
- **Phone:** rendered only if `profile.showPhone`.
- **404:** a CRT "SIGNAL LOST" screen with a link home.

- [ ] **Step 1: Write the failing tests**

```ts
test('validateContact', () => {
  expect(validateContact({ name: '', email: 'bad', message: '', kind: '' }).errors).toMatchObject({ name: expect.any(String), email: expect.any(String), message: expect.any(String), kind: expect.any(String) });
  expect(validateContact({ name: 'A', email: 'a@b.co', message: 'Hi', kind: 'client' }).ok).toBe(true);
});
test('failed submit keeps input and single request', async () => {
  document.body.innerHTML = `<form action="/x"><input name=name value=A><input name=email value=a@b.co><textarea name=message>Hi</textarea><input type=radio name=kind value=client checked><button type=submit>Send</button><p aria-live=polite></p></form>`;
  const f = document.querySelector('form')!; const fetchImpl = vi.fn().mockRejectedValue(new Error('offline'));
  const [r1, r2] = await Promise.all([submitContact(f, fetchImpl), submitContact(f, fetchImpl)]);
  expect(fetchImpl).toHaveBeenCalledTimes(1); expect([r1, r2]).toContain('error');
  expect((f.elements.namedItem('message') as HTMLTextAreaElement).value).toBe('Hi');
  expect(f.querySelector('a[href^="mailto:"]')).not.toBeNull();
});
```

```ts
// e2e
test('success path', async ({ page }) => { await page.route('**/formspree.io/**', r => r.fulfill({ status: 200, body: '{"ok":true}' })); await page.goto('/#contact'); /* fill + submit */ await expect(page.getByText("Thanks, I'll reply within a day.")).toBeVisible(); });
test('phone hidden', async ({ page }) => { await page.goto('/'); await expect(page.getByText('97809')).toHaveCount(0); });
test('404 page', async ({ page }) => { await page.goto('/nope'); await expect(page.getByText('SIGNAL LOST')).toBeVisible(); });
```

- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement. Add `.env.example` with `PUBLIC_FORMSPREE_ID=`.
- [ ] **Step 4:** Run `npm test && npm run build && npx playwright test contact`. Expected: PASS.
- [ ] **Step 5:** Commit with `feat: contact form, footer and 404`.

### Task 11: Accessibility, performance, mobile and deploy hardening

**Files:**
- Create: `tests/e2e/a11y.spec.ts`, `tests/e2e/motion.spec.ts`, `lighthouserc.json`, `vercel.json` (security headers, long cache for `/fonts`, `/img` and `/_astro`)
- Modify: `src/styles/global.css` (`prefers-reduced-transparency`, `prefers-contrast: more` → solid surfaces), plus any component that fails checks
- Test: the files above

**Interfaces:**
- Consumes: everything.
- Produces: `npm run lhci` (`lhci autorun`). Assertions: performance ≥ 0.9, accessibility = 1, best-practices ≥ 0.95, seo = 1, LCP ≤ 2500 ms, CLS ≤ 0.1 (mobile preset).

- [ ] **Step 1: Write the tests**

```ts
for (const theme of ['day', 'night'] as const) test(`axe clean in ${theme}`, async ({ page }) => {
  await page.addInitScript(t => localStorage.setItem('sk-theme', t), theme); await page.goto('/');
  const r = await new AxeBuilder({ page }).analyze(); expect(r.violations).toEqual([]);
});
test('reduced motion: no running CSS animations', async ({ page }) => { await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/'); await page.waitForTimeout(500); expect(await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running' && (a.effect?.getTiming().iterations ?? 1) === Infinity).length)).toBe(0); });
test('375px has no horizontal overflow', async ({ page }) => { await page.setViewportSize({ width: 375, height: 812 }); await page.goto('/'); expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375); });
test('keyboard reaches power switch and role buttons', async ({ page }) => { await page.goto('/'); for (let i = 0; i < 40; i++) { await page.keyboard.press('Tab'); if (await page.evaluate(() => document.activeElement?.id === 'power')) return; } throw new Error('power switch not reachable'); });
```

- [ ] **Step 2:** Run `npm run build && npx playwright test a11y motion`. Fix every violation in the owning component until all pass.
- [ ] **Step 3:** Run `npm run lhci`. Expected: all assertions pass. Typical fixes: lazy-load GSAP below the hero, check font preload, check image sizes.
- [ ] **Step 4:** Run the full suite `npm test && npx playwright test`. Expected: all PASS.
- [ ] **Step 5:** Commit with `chore: a11y, motion, mobile and performance hardening`.
- [ ] **Step 6:** Deploy a preview with `npx vercel` (asking Subodh first; this publishes externally). Record the URL in the README.
