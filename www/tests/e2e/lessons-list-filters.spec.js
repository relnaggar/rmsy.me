import { expect, test } from '@playwright/test';
import { login } from './helpers/auth.js';

test.describe.serial('lessons list filters UI', () => {
  let context;
  let page;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    await login(page);
  });

  test.afterAll(async () => {
    await context.close();
  });

  test.beforeEach(async () => {
    await page.goto('/portal/lessons');
    await expect(page.getByRole('heading', { name: 'Lessons' })).toBeVisible();
  });

  test('buyer filter auto-submits and filters lessons', async () => {
    await page.locator('#list_buyer_id').selectOption({ label: 'E2E Acme' });

    await page.waitForURL(/[?&]buyer_id=e2e-acme/);
    await expect(page).toHaveURL(/[?&]buyer_id=e2e-acme/);
    await expect(page.locator('#list_buyer_id')).toHaveValue('e2e-acme');
  });

  test('student filter auto-submits and filters lessons', async () => {
    await page.locator('#list_student_id').selectOption({ label: 'E2E Student Fixture' });

    await page.waitForURL(/[?&]student_id=/);
    await expect(page).toHaveURL(/[?&]student_id=/);
    await expect(page.getByText('2099-12-31')).toBeVisible();
    await expect(page.getByText('2099-12-30')).not.toBeVisible();
  });

  test('start date filter auto-submits and filters lessons', async () => {
    await page.locator('#list_start_date').fill('2099-12-31');
    await page.locator('#list_start_date').dispatchEvent('change');

    await page.waitForURL(/[?&]start_date=2099-12-31/);
    await expect(page).toHaveURL(/[?&]start_date=2099-12-31/);
    await expect(page.getByText('2099-12-31')).toBeVisible();
    await expect(page.getByText('2099-12-30')).not.toBeVisible();
    await expect(page.getByText('2099-12-29')).not.toBeVisible();
  });

  test('end date filter auto-submits and filters lessons', async () => {
    await page.locator('#list_end_date').fill('2099-12-29');
    await page.locator('#list_end_date').dispatchEvent('change');

    await page.waitForURL(/[?&]end_date=2099-12-29/);
    await expect(page).toHaveURL(/[?&]end_date=2099-12-29/);
    await expect(page.getByText('2099-12-29')).toBeVisible();
    await expect(page.getByText('2099-12-30')).not.toBeVisible();
    await expect(page.getByText('2099-12-31')).not.toBeVisible();
  });

  test('copy button copies start date to end date and auto-submits', async () => {
    await page.locator('#list_start_date').fill('2099-12-31');
    await page.locator('#list_start_date').dispatchEvent('change');
    await page.waitForURL(/[?&]start_date=2099-12-31/);

    await page.getByTitle('Copy From date to To date').nth(1).click();

    await page.waitForURL(/[?&]end_date=2099-12-31/);
    await expect(page).toHaveURL(/[?&]end_date=2099-12-31/);
  });

});
