import { expect, test } from '@playwright/test';
import { E2E_FIXTURES } from './helpers/fixtures.js';
import { login, submitLogin, visitLogin } from './helpers/auth.js';

test('portal login redirects to dashboard', async ({ page }) => {
  await login(page);
});

test('login fails with invalid credentials', async ({ page }) => {
  await visitLogin(page);
  await submitLogin(page, {
    email: E2E_FIXTURES.user.email,
    password: 'incorrect-password',
  });

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('alert')).toContainText(E2E_FIXTURES.invalidLoginMessage);
});
