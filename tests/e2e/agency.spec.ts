import { test, expect } from '@playwright/test';

test.describe('Travel Agency Portal User Journey', () => {
  const APP_URL = 'http://localhost:3000'; // Assuming agency-portal runs on 3000

  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
  });

  test('agency can navigate sidebar', async ({ page }) => {
    await expect(page.getByText(/Welcome to agency-portal/i)).toBeVisible();

    await page.click('text=Get Started');
    await expect(page).toHaveURL(/.*\/login/);

    await page.goto(APP_URL);
    await page.click('text=Dashboard');
    await expect(page).toHaveURL(/.*\/login/);

    // Navigate to inventory directly (should redirect to login)
    await page.goto(`${APP_URL}/inventory`);
    await expect(page).toHaveURL(/.*\/login/);
  });
});
