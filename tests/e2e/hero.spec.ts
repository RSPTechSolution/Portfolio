import { test, expect } from '@playwright/test';

test('hero portrait image is the LCP candidate and visible', async ({ page }) => {
  await page.goto('/');
  const img = page.locator('[data-portrait] img');
  await expect(img).toBeVisible();
  await expect(img).toHaveAttribute('fetchpriority', 'high');
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Subodh Kant');
});

test('no WebGL keeps image and clean console', async ({ page }) => {
  await page.addInitScript(() => {
    const orig = HTMLCanvasElement.prototype.getContext;
    // @ts-expect-error test override
    HTMLCanvasElement.prototype.getContext = function (type: string, ...rest: unknown[]) {
      return /webgl/.test(type) ? null : orig.call(this, type, ...rest);
    };
  });
  const errs: string[] = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await page.goto('/');
  await page.waitForTimeout(1200);
  await expect(page.locator('[data-portrait] img')).toBeVisible();
  await expect(page.locator('[data-portrait] canvas')).toHaveCount(0);
  expect(errs).toEqual([]);
});
