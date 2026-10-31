import { test, expect } from '@playwright/test';

const widths = [320, 375, 414, 768, 1024, 1280, 1440, 1920];

for (const w of widths) {
  test(`no horizontal overflow at ${w}px (home and case study)`, async ({ page, isMobile }) => {
    test.skip(isMobile, 'viewport set explicitly; run once on desktop project');
    await page.setViewportSize({ width: w, height: 900 });
    for (const path of ['/', '/work/ads-delivery-system']) {
      await page.goto(path);
      await page.waitForTimeout(300);
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${path} @ ${w}`).toBeLessThanOrEqual(w);
    }
  });
}

test('role switcher fits on one line at 375px', async ({ page, isMobile }) => {
  test.skip(isMobile, 'viewport set explicitly');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const tops = await page.locator('.hero [data-role-btn]').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
  expect(new Set(tops).size).toBe(1);
});

test('availability chip stays on one line at 375px', async ({ page, isMobile }) => {
  test.skip(isMobile, 'viewport set explicitly');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const h = await page.locator('.hero .chip').evaluate((e) => e.getBoundingClientRect().height);
  expect(h).toBeLessThan(44);
});

test('pipeline diagram stays readable on phones', async ({ page, isMobile }) => {
  test.skip(isMobile, 'viewport set explicitly');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await expect(page.locator('#work .viz')).toBeHidden();
  await page.goto('/work/ads-delivery-system');
  const w = await page.locator('.viz svg').evaluate((e) => e.getBoundingClientRect().width);
  expect(w).toBeGreaterThanOrEqual(720);
  await expect(page.locator('.viz')).toHaveAttribute('tabindex', '0');
});
