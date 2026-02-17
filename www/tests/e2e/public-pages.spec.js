import { expect, test } from '@playwright/test';

test('public pages render expected headings', async ({ page }) => {
  const cases = [
    ['/', 'Ramsey El-Naggar'],
    ['/about', 'About'],
    ['/projects', 'All Projects'],
    ['/contact', 'Contact'],
  ];

  for (const [path, heading] of cases) {
    await page.goto(path);
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  }
});
