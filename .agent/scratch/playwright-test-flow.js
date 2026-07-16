const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:3000';

(async () => {
  const browser = await chromium.launch({ headless: true, slowMo: 100 });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  try {
    console.log('0. Login...');
    await page.goto(`${TARGET_URL}/en/login`, { timeout: 60000 });
    
    // Fill login form
    console.log('Filling login form...');
    await page.fill('input[type="email"]', 'oboyceo@smartops.uz'); // use Oboy CEO
    await page.fill('input[type="password"]', 'Demo1234!'); // correct password
    await page.click('button[type="submit"]');

    console.log('Waiting for login redirect...');
    await page.waitForURL('**/finance', { timeout: 30000 }).catch(() => {});
    
    console.log('1. Go to POS...');
    await page.goto(`${TARGET_URL}/en/pos`, { timeout: 60000 });
    
    // Wait for EITHER the product OR the error block
    console.log('Waiting for POS to load...');
    const result = await Promise.race([
      page.waitForSelector('[id^="product-btn-"]', { timeout: 30000 }).then(() => 'success'),
      page.waitForSelector('text=Terminal Blocked', { timeout: 30000 }).then(() => 'blocked')
    ]);

    if (result === 'blocked') {
      const errorText = await page.locator('.text-dim.max-w-md').innerText();
      throw new Error(`POS Blocked with error: ${errorText}`);
    }

    console.log('Adding product to cart...');
    await page.locator('[id^="product-btn-"]').first().click();
    
    // Select client
    console.log('Selecting client...');
    await page.waitForSelector('#pos-customer-select', { timeout: 10000 });
    // Select the second option (first real client)
    const clientSelect = page.locator('#pos-customer-select');
    const options = await clientSelect.locator('option').allInnerTexts();
    if (options.length > 1) {
      await clientSelect.selectOption({ index: 1 });
    }
    
    // Select NASIYA
    console.log('Selecting NASIYA payment method...');
    await page.locator('button').filter({ hasText: /nasiya/i }).click();

    // Checkout
    console.log('Clicking Charge...');
    await page.locator('#pos-checkout-btn').click();
    
    // Wait for success
    console.log('Waiting for success modal...');
    await page.waitForSelector('#pos-new-sale-btn', { timeout: 10000 });
    await page.locator('#pos-new-sale-btn').click();
    console.log('Sale completed!');

    // 2. Go to Warehouse
    console.log('2. Go to Warehouse...');
    await page.goto(`${TARGET_URL}/en/warehouse`, { timeout: 60000 });

    // Click Pending Dispatch
    console.log('Switching to Pending Dispatch tab...');
    await page.locator('button').filter({ hasText: /pending dispatch/i }).first().click();

    await page.waitForTimeout(2000);

    console.log('Looking for Process Dispatch button...');
    const processButtons = page.locator('button').filter({ hasText: /process dispatch/i });
    if (await processButtons.count() > 0) {
      await processButtons.first().click();
      
      console.log('Confirming dispatch...');
      const confirmBtn = page.locator('button').filter({ hasText: /dispatch all items/i });
      await confirmBtn.waitFor({ state: 'visible', timeout: 5000 });
      await confirmBtn.click();
      
      await page.waitForTimeout(3000); // Wait for the mutation
      console.log('Dispatch processed!');
    } else {
      console.log('No pending dispatches found. Skipping...');
    }

    // 3. Go to Finance Receivables
    console.log('3. Go to Finance Receivables...');
    await page.goto(`${TARGET_URL}/en/finance/receivables`, { timeout: 60000 });

    console.log('Clicking Process Outbox (Dev)...');
    const outboxBtn = page.locator('button').filter({ hasText: /process outbox/i });
    await outboxBtn.waitFor({ state: 'visible', timeout: 10000 });
    
    page.once('dialog', async dialog => {
      console.log(`Alert appeared: ${dialog.message()}`);
      await dialog.accept();
    });
    
    await outboxBtn.click();
    
    await page.waitForTimeout(3000); // wait for queries to invalidate

    console.log('Checking Debtors table...');
    // Log the debtors
    const rows = await page.locator('tbody tr').all();
    console.log(`Found ${rows.length} debtors in the UI:`);
    for (const row of rows) {
      const text = await row.innerText();
      console.log(`- ${text.replace(/\n/g, ' | ')}`);
    }

    await page.screenshot({ path: 'test-results.png', fullPage: true });
    console.log('Screenshot saved to test-results.png');

  } catch (err) {
    console.error('Error during test:', err);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
