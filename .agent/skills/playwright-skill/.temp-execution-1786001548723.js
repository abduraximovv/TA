
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  await page.goto('http://localhost:3003/', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/abdur/AppData/Local/Temp/claude/e--Desktop-EC-Projects-TA/58024cc0-a8d7-4966-b991-1178a9e17444/scratchpad/footer-wide.png' });
  await browser.close();
  console.log('DONE');
})();
