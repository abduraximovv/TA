import { test, expect } from '@playwright/test';

test.describe('Admin Portal User Journey', () => {
  const APP_URL = 'http://localhost:3001'; // Assuming admin-portal runs on 3001

  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
  });

  test('admin can access verification and analytics', async ({ page }) => {
    await expect(page.getByText(/Welcome to admin-portal/i)).toBeVisible();

    await page.click('text=Get Started');
    await expect(page).toHaveURL(/.*\/login/);

    await page.goto(APP_URL);
    await page.click('text=Dashboard');
    await expect(page).toHaveURL(/.*\/login/);

    await page.goto(`${APP_URL}/verification-hub`);
    await expect(page).toHaveURL(/.*\/login/);

    await page.goto(`${APP_URL}/analytics`);
    await expect(page).toHaveURL(/.*\/login/);
  });
});
