const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:3003';
const OUT_DIR = 'C:/Users/abdur/AppData/Local/Temp/claude/e--Desktop-EC-Projects-TA/58024cc0-a8d7-4966-b991-1178a9e17444/scratchpad';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

  const loopWarnings = [];
  page.on('console', (msg) => {
    if (msg.text().includes('not enough slides')) loopWarnings.push(msg.text());
  });

  await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
  const section = page.locator('section').filter({ hasText: 'Things To Do' });
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  const tabs = ['Nature', 'Bazaars', 'Food & Beverages', 'Culture & History', 'All'];
  for (const tab of tabs) {
    await page.getByRole('button', { name: tab, exact: true }).click();
    await page.waitForTimeout(150); // immediate, mirrors what user sees right after clicking
    const safe = tab.replace(/[^a-z0-9]/gi, '-');
    await section.screenshot({ path: `${OUT_DIR}/verify-${safe}.png` });
    console.log(`captured verify-${safe}.png`);
  }

  console.log('LOOP_WARNINGS_COUNT:' + loopWarnings.length);
  await browser.close();
  console.log('DONE');
})();
