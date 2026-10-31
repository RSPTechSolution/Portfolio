import { test, expect } from '@playwright/test';

test('case study pages render', async ({ page }) => {
  for (const s of ['enterprise-b2b-platform', 'ads-delivery-system']) {
    await page.goto(`/work/${s}`);
    for (const h of ['Problem', 'My role', 'Architecture', 'Stack', 'Outcome']) await expect(page.getByRole('heading', { name: h, exact: true })).toBeVisible();
  }
});

test('pipeline is labelled', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('img', { name: /Assigned.*Clicked/ }).first()).toBeAttached();
});

test('workflow strip copy', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#ai')).toContainText('Prompt → Generate → Review → Test → Ship');
  await expect(page.locator('#ai')).toContainText('AI drafts, I engineer: every line is reviewed, tested and owned.');
});

test('experience title follows role', async ({ page }) => {
  await page.goto('/?role=drupal');
  await expect(page.locator('#experience [data-role-map]').first()).toHaveText('Drupal Developer');
});

test('featured cards link to case studies', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#work a[href="/work/enterprise-b2b-platform"]')).toBeAttached();
  await expect(page.locator('#work a[href="/work/ads-delivery-system"]')).toBeAttached();
});
