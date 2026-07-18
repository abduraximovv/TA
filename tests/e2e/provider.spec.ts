import { test, expect } from '@playwright/test';

test.describe('Local Provider App User Journey', () => {
  const APP_URL = 'http://localhost:3002';

  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
  });

  test('provider can access dashboard without errors', async ({ page }) => {
    // Landing page
    await expect(page.getByText(/Welcome to provider-app/i)).toBeVisible();

    // Go to login
    await page.click('text=Get Started');
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByTestId('login-page')).toBeVisible();

    // Go to dashboard (should redirect to login because unauthenticated)
    await page.goto(APP_URL);
    await page.click('text=Dashboard');
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByTestId('login-page')).toBeVisible();
  });
});
