import { expect, test } from '@playwright/test';
import { login } from './helpers/auth.js';
import { E2E_FIXTURES } from './helpers/fixtures.js';

async function openFixturePayment(page) {
  await page.goto('/portal/payments');
  await expect(page.getByRole('heading', { name: 'Payments' })).toBeVisible();

  await page.getByRole('link', { name: E2E_FIXTURES.paymentId }).click();
  await expect(page.getByRole('heading', { name: 'Payment' })).toBeVisible();
}

async function ensureFixtureIsUnmatched(page) {
  const unmatchAllButton = page.getByRole('button', { name: 'Unmatch All' });
  if (await unmatchAllButton.isVisible()) {
    page.once('dialog', (dialog) => dialog.accept());
    await unmatchAllButton.click();
    await expect(page.getByRole('alert')).toContainText('Payment unmatched successfully.');
  }

  const removePendingButton = page.getByRole('button', { name: 'Remove Lesson(s) Pending' });
  if (await removePendingButton.isVisible()) {
    await removePendingButton.click();
    await expect(page.getByRole('alert')).toContainText('Payment no longer lesson(s) pending.');
  }

  await expect(page.getByRole('row', { name: /Status/ })).toContainText('Unmatched');
}

test.describe.serial('payment matching workflow', () => {
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

  test('matches an unmatched payment from the portal UI', async () => {
    await openFixturePayment(page);
    await ensureFixtureIsUnmatched(page);

    await expect(page.getByRole('row', { name: /Status/ })).toContainText('Unmatched');
    await expect(page.getByRole('button', { name: 'Confirm Matches' })).toBeVisible();

    await page.getByRole('button', { name: 'Confirm Matches' }).click();

    await expect(page.getByRole('alert')).toContainText(E2E_FIXTURES.matchSuccessMessage);
    await expect(page.getByRole('row', { name: /Status/ })).toContainText('Matched');
    await expect(page.getByRole('button', { name: 'Unmatch All' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Confirm Matches' })).toHaveCount(0);
  });

  test('toggles lesson pending status from payment actions', async () => {
    await openFixturePayment(page);
    await ensureFixtureIsUnmatched(page);

    await page.getByRole('button', { name: 'Mark Lesson(s) Pending' }).click();

    await expect(page.getByRole('row', { name: /Status/ })).toContainText('Lesson(s) Pending');
    await expect(page.getByRole('button', { name: 'Remove Lesson(s) Pending' })).toBeVisible();

    await page.getByRole('button', { name: 'Remove Lesson(s) Pending' }).click();

    await expect(page.getByRole('row', { name: /Status/ })).toContainText('Unmatched');
    await expect(page.getByRole('button', { name: 'Mark Lesson(s) Pending' })).toBeVisible();
  });

  test('cancels destructive payment delete when confirm dialog is dismissed', async () => {
    await openFixturePayment(page);
    await ensureFixtureIsUnmatched(page);

    let sawConfirmDialog = false;
    page.once('dialog', async (dialog) => {
      sawConfirmDialog = true;
      await dialog.dismiss();
    });

    await page.getByRole('button', { name: 'Delete Payment' }).click();
    await expect.poll(() => sawConfirmDialog).toBe(true);

    await expect(page.getByRole('heading', { name: 'Payment' })).toBeVisible();

    await page.goto('/portal/payments');
    await expect(page.getByRole('link', { name: E2E_FIXTURES.paymentId })).toBeVisible();
  });
});
