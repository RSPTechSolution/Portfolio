import { test, expect } from '@playwright/test';

async function fill(page: import('@playwright/test').Page) {
  await page.goto('/#contact');
  await page.getByLabel('Name').fill('Asha');
  await page.getByLabel('Email').fill('asha@example.com');
  await page.getByLabel('Message').fill('Hello!');
  await page.getByLabel("I'm a client").check();
}

test('success path', async ({ page }) => {
  await page.route('**/formspree.io/**', (r) => r.fulfill({ status: 200, body: '{"ok":true}', contentType: 'application/json' }));
  await fill(page);
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText('Thanks, your message is on its way.')).toBeVisible();
});

test('error path keeps input', async ({ page }) => {
  await page.route('**/formspree.io/**', (r) => r.abort());
  await fill(page);
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.locator('#contact [data-status] a[href^="mailto:"]')).toBeVisible();
  await expect(page.getByLabel('Message')).toHaveValue('Hello!');
});

test('phone hidden', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('97809')).toHaveCount(0);
});

test('404 page', async ({ page }) => {
  await page.goto('/nope');
  await expect(page.getByText('SIGNAL LOST')).toBeVisible();
  await expect(page.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
});
