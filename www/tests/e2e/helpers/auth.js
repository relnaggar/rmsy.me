import { expect } from '@playwright/test';
import { E2E_FIXTURES } from './fixtures.js';

export async function visitLogin(page) {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
}

export async function submitLogin(
  page,
  credentials = E2E_FIXTURES.user,
) {
  await page.getByLabel('Email').fill(credentials.email);
  await page.getByLabel('Password').fill(credentials.password);
  await page.getByRole('button', { name: 'Login' }).click();
}

export async function login(page, credentials = E2E_FIXTURES.user) {
  await visitLogin(page);
  await submitLogin(page, credentials);

  await expect(page).toHaveURL(/\/portal$/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
}

export async function saveAuthenticatedStorageState(
  page,
  storageStatePath,
) {
  await login(page);
  await page.context().storageState({ path: storageStatePath });
}
