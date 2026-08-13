const { chromium } = require('playwright');
const fs = require('fs');

const TARGET_URL = 'http://localhost:3003';
const SCRATCH = 'C:\\Users\\Lenovo\\AppData\\Local\\Temp\\claude\\c--Users-Lenovo-Documents-Projects-TA\\7d2f3bee-7d27-4668-9ced-e95ba523bbfc\\scratchpad';

const cookies = JSON.parse(fs.readFileSync(`${SCRATCH}\\pw-cookies.json`, 'utf8'));

(async () => {
  const browser = await chromium.launch({ headless: false, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addCookies(cookies);
  const page = await context.newPage();

  page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));

  await page.goto(`${TARGET_URL}/ai-chat`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.locator('[aria-label="Plan my trip"]').click();
  await page.waitForTimeout(600);

  const input = page.locator('input[aria-label="Message your AI Travel Coordinator"]');
  await input.fill('I am interested in nature and adventure activities, my budget is 250000 UZS.');
  console.log('Sending message with NO date mentioned...');
  await page.click('button[aria-label="Send"]');

  console.log('Waiting for cards (up to 45s)...');
  await page.waitForSelector('text=Book in 1-Click', { timeout: 45000 });
  await page.waitForTimeout(500);

  console.log('Clicking "Book in 1-Click" (expecting inline date form, not an immediate booking)...');
  await page.locator('text=Book in 1-Click').first().click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${SCRATCH}\\05-nodate-confirm-form.png`, fullPage: true });

  const dateInputVisible = await page.locator('input[aria-label="Travel date"]').first().isVisible().catch(() => false);
  console.log('Inline date input visible (expected true):', dateInputVisible);

  const confirmBtn = page.locator('text=Confirm').first();
  const confirmDisabled = await confirmBtn.isDisabled().catch(() => null);
  console.log('Confirm button disabled with empty date (expected true):', confirmDisabled);

  if (dateInputVisible) {
    await page.locator('input[aria-label="Travel date"]').first().fill('2026-10-01');
    await page.waitForTimeout(200);
    console.log('Filled date, clicking Confirm...');
    await page.locator('text=Confirm').first().click();
    await page.waitForTimeout(4000);
    await page.screenshot({ path: `${SCRATCH}\\06-nodate-then-confirmed.png`, fullPage: true });
    const sentToHost = await page.locator('text=Sent to host').count();
    console.log('Cards showing "Sent to host" after manual confirm:', sentToHost);
  }

  await browser.close();
  console.log('DONE');
})();
