import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'pnpm --filter tourist-webapp dev',
      url: 'http://localhost:3003',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: 'pnpm --filter provider-app dev',
      url: 'http://localhost:3002',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: 'pnpm --filter agency-portal dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: 'pnpm --filter admin-portal dev',
      url: 'http://localhost:3001',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    }
  ],
  projects: [
    {
      name: 'Mobile Chrome (Tourist/Provider)',
      use: { ...devices['Pixel 5'] },
      testMatch: /.*(tourist|provider)\.spec\.ts/,
    },
    {
      name: 'Mobile Safari (Tourist/Provider)',
      use: { ...devices['iPhone 12'] },
      testMatch: /.*(tourist|provider)\.spec\.ts/,
    },
    {
      name: 'Desktop Chrome (Agency/Admin)',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*(agency|admin)\.spec\.ts/,
    },
  ],
});
