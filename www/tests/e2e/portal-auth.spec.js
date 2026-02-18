import { expect, test } from '@playwright/test';
import { login } from './helpers/auth.js';

test('portal route redirects unauthenticated users to login', async ({ page }) => {
  await page.goto('/portal');

  await expect(page).toHaveURL(/\/login(?:\?.*)?$/);
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
});

test('portal logout ends the session', async ({ page }) => {
  await login(page);

  await page.getByRole('button', { name: 'Logout' }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();

  await page.goto('/portal');
  await expect(page).toHaveURL(/\/login(?:\?.*)?$/);
});
