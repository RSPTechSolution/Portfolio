import { test, expect } from '@playwright/test';

test('home loads with no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'day');
  await expect(page.locator('html')).toHaveClass(/js/);
  expect(errors).toEqual([]);
});
