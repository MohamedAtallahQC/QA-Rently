import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://dev.rently.sa/en');
  await expect(page.locator('section').filter({ hasText: 'Your Rent on Your TermsWe' }).locator('div').nth(1)).toBeVisible();
});

