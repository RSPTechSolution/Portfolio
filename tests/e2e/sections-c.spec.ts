import { test, expect } from '@playwright/test';

test('service module expands via keyboard', async ({ page }) => {
  await page.goto('/');
  const sw = page.locator('[data-module] .switch').first();
  await sw.focus();
  await page.keyboard.press('Enter');
  await expect(sw).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('[data-module]').first()).toHaveClass(/open/);
});

test('vibe-coded filter shows portfolio and hides drupal-only', async ({ page }) => {
  await page.goto('/');
  await page.locator('#projects').getByRole('button', { name: 'Vibe-coded' }).click();
  await expect(page.locator('#projects [data-tags*="vibe-coded"]').first()).toBeVisible();
  await expect(page.locator('#projects').getByRole('button', { name: 'Vibe-coded' })).toHaveAttribute('aria-pressed', 'true');
});

test('how I work, awards and learning render', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#services')).toContainText('Discover');
  await expect(page.locator('#services')).toContainText('Support');
  for (const a of ['Rising Star', 'Glowing Star', 'Python Programming', 'AI Tools']) await expect(page.locator('#awards')).toContainText(a);
  await expect(page.locator('#learning')).toContainText('Deep learning & generative AI');
  await expect(page.locator('#more-work')).toContainText('Drupal Commerce');
});
