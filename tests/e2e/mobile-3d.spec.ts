import { test, expect } from '@playwright/test';

test('touch devices get the 3D portrait and clay scene after load', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile project only');
  await page.goto('/');
  await expect(page.locator('[data-portrait] canvas')).toHaveCount(1, { timeout: 15_000 });
  await expect(page.locator('html')).toHaveClass(/has-3d/);
  await expect(page.locator('[data-portrait] img')).toBeVisible();
});

test('reduced motion on touch still shows the photo and no errors', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile project only');
  const errs: string[] = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForTimeout(1500);
  await expect(page.locator('[data-portrait] img')).toBeVisible();
  expect(errs).toEqual([]);
});
