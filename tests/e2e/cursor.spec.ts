import { test, expect } from '@playwright/test';

test('touch devices keep native cursor', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile project only');
  await page.goto('/');
  await page.waitForTimeout(300);
  await expect(page.locator('html')).not.toHaveClass(/has-cursor/);
});

test('desktop pointer gets the custom cursor', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop project only');
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/has-cursor/);
});

test('hero renders the clay canvas when WebGL is available', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#clay')).toHaveCount(1);
});
