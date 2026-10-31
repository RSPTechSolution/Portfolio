import { test, expect, type Page } from '@playwright/test';

const SITE = 'https://subodh-cv.vidyanexa.com';

async function jsonLd(page: Page) {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  return blocks.map((b) => JSON.parse(b)).flatMap((b) => (b['@graph'] ? b['@graph'] : [b]));
}
const meta = (page: Page, sel: string) => page.locator(sel).first().getAttribute('content');

test('home: title, description, canonical, social and schema', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Subodh Kant/);
  const desc = await meta(page, 'meta[name="description"]');
  expect(desc!.length).toBeGreaterThanOrEqual(120);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}/`);
  expect(await meta(page, 'meta[name="robots"]')).toContain('index');
  expect(await meta(page, 'meta[property="og:type"]')).toBe('profile');
  expect(await meta(page, 'meta[property="og:url"]')).toBe(`${SITE}/`);
  expect(await meta(page, 'meta[property="og:image"]')).toBe(`${SITE}/og/home.png`);
  expect(await meta(page, 'meta[name="twitter:card"]')).toBe('summary_large_image');
  expect(await meta(page, 'meta[name="geo.placename"]')).toBe('Ludhiana');
  const types = (await jsonLd(page)).map((n) => n['@type']);
  expect(types).toEqual(expect.arrayContaining(['Person', 'WebSite', 'ProfilePage', 'ProfessionalService']));
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/site.webmanifest');
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/apple-touch-icon.png');
});

test('case study: article schema, breadcrumbs, own canonical and image', async ({ page }) => {
  await page.goto('/work/ads-delivery-system');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}/work/ads-delivery-system`);
  expect(await meta(page, 'meta[property="og:type"]')).toBe('article');
  expect(await meta(page, 'meta[property="og:image"]')).toBe(`${SITE}/og/ads-delivery-system.png`);
  const types = (await jsonLd(page)).map((n) => n['@type']);
  expect(types).toEqual(expect.arrayContaining(['TechArticle', 'BreadcrumbList', 'Person']));
});

test('every page has a unique title and description', async ({ page }) => {
  const seen = new Set<string>();
  for (const p of ['/', '/work/enterprise-b2b-platform', '/work/ads-delivery-system']) {
    await page.goto(p);
    const key = `${await page.title()}|${await meta(page, 'meta[name="description"]')}`;
    expect(seen.has(key), p).toBe(false);
    seen.add(key);
  }
});

test('404 is not indexed', async ({ page }) => {
  await page.goto('/nope');
  expect(await meta(page, 'meta[name="robots"]')).toContain('noindex');
});

test('robots.txt, sitemap and manifest', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Allow: /');
  expect(robots).toContain(`Sitemap: ${SITE}/sitemap-index.xml`);
  expect((await request.get('/sitemap-index.xml')).status()).toBe(200);
  const sm = await (await request.get('/sitemap-0.xml')).text();
  for (const p of ['/', '/work/enterprise-b2b-platform', '/work/ads-delivery-system']) expect(sm).toContain(`<loc>${SITE}${p}</loc>`);
  expect(sm).not.toContain('404');
  const manifest = await (await request.get('/site.webmanifest')).json();
  expect(manifest.name).toContain('Subodh Kant');
});

test('social preview images are 1200x630 PNGs', async ({ request }) => {
  for (const slug of ['home', 'enterprise-b2b-platform', 'ads-delivery-system']) {
    const res = await request.get(`/og/${slug}.png`);
    expect(res.status(), slug).toBe(200);
    const buf = await res.body();
    expect(buf.readUInt32BE(16)).toBe(1200);
    expect(buf.readUInt32BE(20)).toBe(630);
  }
});
