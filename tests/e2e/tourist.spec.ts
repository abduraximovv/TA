import { test, expect } from '@playwright/test';

test.describe('Tourist WebApp User Journey', () => {
  const APP_URL = 'http://localhost:3003';

  test('tourist can navigate landing page and login', async ({ page }) => {
    // Log browser console to stdout
    page.on('console', msg => console.log(`BROWSER CONSOLE: ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', error => console.log(`BROWSER ERROR: ${error.message}`));

    // 1. Check landing page loads
    await page.goto(APP_URL);
    await expect(page.locator('text=Uzbekistan Digital Tourism Ecosystem')).toBeVisible();

    // 2. Click "Sign In" to go to login
    await page.click('text=Sign In');
    await expect(page).toHaveURL(/.*\/auth\/login/);
    await expect(page.getByText('Sign In').first()).toBeVisible();

    // 3. Fill in credentials
    await page.fill('input[type="email"]', 'tourist@uzb.test');
    await page.fill('input[type="password"]', 'Abdurohman2007@');
    
    // Wait for React hydration (since Playwright is too fast and clicks before onSubmit is attached)
    await page.waitForTimeout(1000);
    
    // 4. Click login submit - target exactly the primary button
    await page.click('button:has-text("Sign In"):not(:has-text("Google"))');

    // 5. Expect redirection to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
    
    // 6. Verify dashboard
    await expect(page.locator('text=Survival Map')).toBeVisible();
    await expect(page.locator('text=Translator')).toBeVisible();
    await expect(page.locator('text=Samarkand')).toBeVisible();
  });
});
