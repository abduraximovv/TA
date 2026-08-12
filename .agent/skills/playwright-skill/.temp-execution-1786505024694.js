const { chromium } = require('playwright');
const fs = require('fs');

const TARGET_URL = 'http://localhost:3003';
const cookies = JSON.parse(fs.readFileSync('C:\\Users\\Lenovo\\AppData\\Local\\Temp\\claude\\c--Users-Lenovo-Documents-Projects-TA\\7d2f3bee-7d27-4668-9ced-e95ba523bbfc\\scratchpad\\playwright-cookies.json', 'utf8'));

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addCookies(cookies.map((c) => ({ ...c, sameSite: 'Lax' })));
  const page = await context.newPage();

  const consoleMessages = [];
  page.on('console', (msg) => consoleMessages.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => consoleMessages.push(`[pageerror] ${err.message}`));
  page.on('requestfailed', (req) => consoleMessages.push(`[requestfailed] ${req.url()} ${req.failure()?.errorText}`));

  try {
    await page.goto(`${TARGET_URL}/ai-chat`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.click('button[aria-label="Scan a menu"]');
    await page.waitForTimeout(800);

    const scannerPanelVisible = await page.locator('text=Taste & Trust').count();
    console.log('RESULT scannerPanelVisible=', scannerPanelVisible);

    const tapTarget = page.locator('text=Scan a menu').first();
    const tapTargetCount = await tapTarget.count();
    console.log('RESULT tapTargetCount=', tapTargetCount);

    // Inspect the actual DOM: is the file input present, and does the button's click handler exist?
    const inputInfo = await page.evaluate(() => {
      const input = document.querySelector('input[type="file"]');
      return input ? { exists: true, hidden: input.className.includes('hidden'), accept: input.accept, capture: input.getAttribute('capture') } : { exists: false };
    });
    console.log('RESULT fileInputInfo=', JSON.stringify(inputInfo));

    const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 5000 }).catch(() => null);
    await tapTarget.click({ timeout: 5000 }).catch((e) => console.log('RESULT clickError=', e.message));
    const fileChooser = await fileChooserPromise;
    console.log('RESULT fileChooserFired=', !!fileChooser);

    await page.screenshot({ path: 'C:\\Users\\Lenovo\\AppData\\Local\\Temp\\claude\\c--Users-Lenovo-Documents-Projects-TA\\7d2f3bee-7d27-4668-9ced-e95ba523bbfc\\scratchpad\\scanner-auth-state.png' });
  } catch (err) {
    console.error('SCRIPT_ERROR', err.stack || err.message);
  } finally {
    console.log('RESULT consoleMessages=', JSON.stringify(consoleMessages.slice(0, 20)));
    await browser.close();
  }
})();
