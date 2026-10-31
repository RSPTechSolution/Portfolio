import { test, expect } from '@playwright/test';

test('?role=drupal tunes the page', async ({ page }) => {
  await page.goto('/?role=drupal');
  await expect(page.locator('html')).toHaveAttribute('data-role', 'drupal');
  await expect(page.locator('[data-role-title]').first()).toHaveText('Drupal Developer · D7 → D11');
  await expect(page.locator('[data-role-resume] a').first()).toHaveAttribute('href', '/resumes/Subodh_Kant_Drupal_developer.pdf');
  await expect(page.locator('[data-role-list] [data-skill]').first()).toHaveAttribute('data-skill', 'drupal');
});

test('clicking Backend updates URL', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Backend', exact: true }).first().click();
  await expect(page).toHaveURL(/role=backend/);
  await expect(page.locator('[data-role-list] [data-skill]').first()).toHaveAttribute('data-skill', 'python');
});

test('hostile role value is not rendered', async ({ page }) => {
  await page.goto('/?role=%3Cimg%20src%3Dx%3E');
  await expect(page.locator('html')).toHaveAttribute('data-role', 'all');
  await expect(page.locator('img[src="x"]')).toHaveCount(0);
});
