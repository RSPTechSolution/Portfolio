import { test, expect } from '@playwright/test';

test('no page mentions the former client brand', async ({ page, request }) => {
  for (const path of ['/', '/work/enterprise-b2b-platform', '/work/ads-delivery-system']) {
    const res = await request.get(path);
    expect(res.status(), path).toBe(200);
    expect((await res.text()).toLowerCase(), path).not.toContain('potato');
  }
  expect((await request.get('/work/potatopro')).status()).toBe(404);
  await page.goto('/');
  await expect(page.locator('#work a[href="/work/enterprise-b2b-platform"]')).toBeAttached();
});
