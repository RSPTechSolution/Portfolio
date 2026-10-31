import { test, expect } from '@playwright/test';

test('switch toggles theme and persists', async ({ page }) => {
  await page.goto('/');
  await page.locator('#power').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
  await expect(page.locator('#power')).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
});

test('rapid clicks end consistent', async ({ page }) => {
  await page.goto('/');
  for (let i = 0; i < 5; i++) await page.locator('#power').click({ delay: 0 });
  await page.waitForTimeout(1500);
  const theme = await page.locator('html').getAttribute('data-theme');
  await expect(page.locator('#power')).toHaveAttribute('aria-pressed', String(theme === 'night'));
  expect(theme).toBe('night');
  expect(await page.evaluate(() => localStorage.getItem('sk-theme'))).toBe('night');
});

test('dark OS does not auto-flip', async ({ browser }) => {
  const p = await (await browser.newContext({ colorScheme: 'dark' })).newPage();
  await p.goto('http://localhost:4321/');
  await expect(p.locator('html')).toHaveAttribute('data-theme', 'day');
});

test('blocked storage still toggles', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new Error('denied'); } }));
  const errs: string[] = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto('/');
  await page.locator('#power').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
  expect(errs).toEqual([]);
});
