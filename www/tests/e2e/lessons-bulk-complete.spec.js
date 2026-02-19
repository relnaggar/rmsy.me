import { expect, test } from '@playwright/test';
import { login } from './helpers/auth.js';

test.describe.serial('lessons bulk complete UI', () => {
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

  test('Mark as Complete button is disabled when no lessons are selected', async () => {
    await expect(page.getByRole('button', { name: 'Mark as Complete' })).toBeDisabled();
  });

  test('Mark as Complete button enables when a lesson checkbox is checked', async () => {
    await page.locator('input[name="lesson_ids[]"]').first().check();

    await expect(page.getByRole('button', { name: 'Mark as Complete' })).toBeEnabled();
  });

  test('Mark as Complete button disables when lesson checkbox is unchecked', async () => {
    const checkbox = page.locator('input[name="lesson_ids[]"]').first();

    await checkbox.check();
    await expect(page.getByRole('button', { name: 'Mark as Complete' })).toBeEnabled();

    await checkbox.uncheck();
    await expect(page.getByRole('button', { name: 'Mark as Complete' })).toBeDisabled();
  });

  test('select-all checks all lesson checkboxes and enables the button', async () => {
    const selectAll = page.locator('[data-select-all]');
    const lessonCheckboxes = page.locator('input[name="lesson_ids[]"]');

    await selectAll.check();

    const count = await lessonCheckboxes.count();
    for (let i = 0; i < count; i++) {
      await expect(lessonCheckboxes.nth(i)).toBeChecked();
    }
    await expect(page.getByRole('button', { name: 'Mark as Complete' })).toBeEnabled();
  });

  test('unchecking select-all unchecks all lesson checkboxes and disables the button', async () => {
    const selectAll = page.locator('[data-select-all]');
    const lessonCheckboxes = page.locator('input[name="lesson_ids[]"]');

    await selectAll.check();
    await selectAll.uncheck();

    const count = await lessonCheckboxes.count();
    for (let i = 0; i < count; i++) {
      await expect(lessonCheckboxes.nth(i)).not.toBeChecked();
    }
    await expect(page.getByRole('button', { name: 'Mark as Complete' })).toBeDisabled();
  });

  test('select-all becomes indeterminate when only some lessons are checked', async () => {
    const selectAll = page.locator('[data-select-all]');
    const lessonCheckboxes = page.locator('input[name="lesson_ids[]"]');

    const count = await lessonCheckboxes.count();
    expect(count).toBeGreaterThanOrEqual(2);

    await lessonCheckboxes.first().check();

    await expect(selectAll).not.toBeChecked();
    await expect(selectAll).toHaveJSProperty('indeterminate', true);
  });

  test('select-all becomes checked when all lessons are checked individually', async () => {
    const selectAll = page.locator('[data-select-all]');
    const lessonCheckboxes = page.locator('input[name="lesson_ids[]"]');

    const count = await lessonCheckboxes.count();
    for (let i = 0; i < count; i++) {
      await lessonCheckboxes.nth(i).check();
    }

    await expect(selectAll).toBeChecked();
    await expect(selectAll).toHaveJSProperty('indeterminate', false);
  });

  test('Showing dropdown auto-submits and filters to incomplete lessons', async () => {
    await page.locator('#complete_filter').selectOption('incomplete');

    await page.waitForURL(/[?&]complete=incomplete/);
    await expect(page).toHaveURL(/[?&]complete=incomplete/);
    await expect(page.locator('#complete_filter')).toHaveValue('incomplete');
  });

  test('Showing dropdown auto-submits and filters to complete lessons', async () => {
    await page.locator('#complete_filter').selectOption('complete');

    await page.waitForURL(/[?&]complete=complete/);
    await expect(page).toHaveURL(/[?&]complete=complete/);
    await expect(page.locator('#complete_filter')).toHaveValue('complete');
  });

  test('filtering to complete shows complete fixture lesson and hides incomplete ones', async () => {
    await page.goto('/portal/lessons?complete=complete');

    await expect(page.getByText('2099-12-29')).toBeVisible();
    await expect(page.getByText('2099-12-31')).not.toBeVisible();
    await expect(page.getByText('2099-12-30')).not.toBeVisible();
  });

  test('filtering to incomplete shows incomplete fixture lessons and hides complete one', async () => {
    await page.goto('/portal/lessons?complete=incomplete');

    await expect(page.getByText('2099-12-31')).toBeVisible();
    await expect(page.getByText('2099-12-30')).toBeVisible();
    await expect(page.getByText('2099-12-29')).not.toBeVisible();
  });
});
