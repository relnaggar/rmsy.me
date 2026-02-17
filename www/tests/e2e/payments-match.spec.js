import { expect, test } from '@playwright/test';
import { login } from './helpers/auth.js';
import { E2E_FIXTURES } from './helpers/fixtures.js';

test('matches an unmatched payment from the portal UI', async ({ page }) => {
  await login(page);

  await page.goto('/portal/payments');
  await expect(page.getByRole('heading', { name: 'Payments' })).toBeVisible();

  await page.getByRole('link', { name: E2E_FIXTURES.paymentId }).click();

  await expect(page.getByRole('heading', { name: 'Payment' })).toBeVisible();
  await expect(page.getByRole('row', { name: /Status/ })).toContainText('Unmatched');
  await expect(page.getByRole('button', { name: 'Confirm Matches' })).toBeVisible();

  await page.getByRole('button', { name: 'Confirm Matches' }).click();

  await expect(page.getByRole('alert')).toContainText(E2E_FIXTURES.matchSuccessMessage);
  await expect(page.getByRole('row', { name: /Status/ })).toContainText('Matched');
  await expect(page.getByRole('button', { name: 'Unmatch All' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Confirm Matches' })).toHaveCount(0);
});
