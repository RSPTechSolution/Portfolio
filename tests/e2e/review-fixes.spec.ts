import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const theme of ['day', 'night'] as const) {
  test(`dimmed role items keep AA contrast (${theme}, ?role=drupal)`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript((t) => localStorage.setItem('sk-theme', t), theme);
    await page.goto('/?role=drupal');
    await page.waitForTimeout(400);
    const r = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
    expect(r.violations.flatMap((v) => v.nodes.map((n) => n.target.join(' ')))).toEqual([]);
  });
}

test('no-JS mobile visitors can see the navigation links', async ({ browser }) => {
  const p = await (await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } })).newPage();
  await p.goto('http://localhost:4321/');
  await expect(p.locator('#primary-links a[href="#work"]')).toBeVisible();
});

test('shift cards keep heading and list accessible, with a separate switch button', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Real-time backends' })).toBeVisible();
  await expect(page.locator('#shifts').getByRole('listitem').filter({ hasText: 'FastAPI microservices' })).toBeVisible();
  await expect(page.locator('#shifts button :is(h3, ul, li)')).toHaveCount(0);
  await page.getByRole('button', { name: 'Switch to night mode', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
});
