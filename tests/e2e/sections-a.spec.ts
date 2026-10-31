import { test, expect } from '@playwright/test';

test('stat pods show final values with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('#about [data-count]').first()).toHaveText('5+');
  await expect(page.locator('#about').getByText('D7→11')).toBeVisible();
});

test('night card flips theme', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-shift="night"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
});

test('content visible without JS', async ({ browser }) => {
  const p = await (await browser.newContext({ javaScriptEnabled: false })).newPage();
  await p.goto('http://localhost:4321/');
  for (const t of ['Enterprise Drupal platforms', 'Real-time backends']) await expect(p.getByRole('heading', { name: t })).toBeVisible();
  await expect(p.locator('#stack [data-skill]')).toHaveCount(12);
});

test('stack groups render with meters', async ({ page }) => {
  await page.goto('/');
  for (const g of ['Drupal', 'Languages', 'Backend', 'Data', 'DevOps', 'Tools']) await expect(page.locator('#stack').getByText(g, { exact: true }).first()).toBeAttached();
});
