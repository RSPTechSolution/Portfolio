import { test, expect } from '@playwright/test';

test('reduced motion: no running infinite animations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForTimeout(800);
  const running = await page.evaluate(() => document.getAnimations()
    .filter((a) => a.playState === 'running' && (a.effect?.getTiming().iterations ?? 1) === Infinity).length);
  expect(running).toBe(0);
});

test('375px has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});

test('content visible without JS (all sections)', async ({ browser }) => {
  const p = await (await browser.newContext({ javaScriptEnabled: false })).newPage();
  await p.goto('http://localhost:4321/');
  for (const id of ['about', 'shifts', 'stack', 'ai', 'experience', 'work', 'projects', 'more-work', 'services', 'awards', 'learning', 'contact']) {
    await expect(p.locator(`#${id}`)).toBeVisible();
  }
  await expect(p.locator('#services .body').first()).toBeVisible();
});
