import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const theme of ['day', 'night'] as const) {
  test(`axe clean in ${theme}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript((t) => localStorage.setItem('sk-theme', t), theme);
    await page.goto('/');
    await page.waitForTimeout(500);
    const r = await new AxeBuilder({ page }).analyze();
    expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([]);
  });
}

test('case study page is axe clean', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/work/ads-delivery-system');
  const r = await new AxeBuilder({ page }).analyze();
  expect(r.violations.map((v) => v.id)).toEqual([]);
});

test('keyboard reaches power switch', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard test on desktop');
  await page.goto('/');
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    if (await page.evaluate(() => document.activeElement?.id === 'power')) return;
  }
  throw new Error('power switch not reachable');
});
