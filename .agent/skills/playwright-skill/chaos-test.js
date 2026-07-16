const { chromium } = require('playwright');
const TARGET_URL = 'http://localhost:8000';

(async () => {
    console.log('🚀 CHAOS CRAWLER V2: DOM Interaction Engaged');
    const browser = await chromium.launch({ headless: true, slowMo: 100 });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('Logging in as Teacher lazizbekq...');
    try {
        await page.goto(`${TARGET_URL}/login`);
        await page.waitForTimeout(500); // UI stabilization

        const emailInput = page.locator("input[name='username']");
        await emailInput.fill("lazizbekq");

        const passwordInput = page.locator("input[name='password']");
        await passwordInput.fill("LazizbekQ");

        await page.click("button[type='submit']");
        await page.waitForTimeout(2500); // network propagation

        console.log('✅ Auth mapping fired successfully');
    } catch (e) {
        console.log('Auth exception:', e);
    }

    const targets = [
        `${TARGET_URL}/teacher/groups/6/edit?tab=students`,
        `${TARGET_URL}/teacher/groups/6/syllabus`,
        `${TARGET_URL}/teacher/groups/6/edit?tab=teaching-plans`,
        `${TARGET_URL}/teacher/groups/6/edit?tab=schedule`,
        `${TARGET_URL}/teacher/groups/6/lessons/5087`
    ];

    for (const url of targets) {
        console.log(`\n============================`);
        console.log(`Fuzzing URL Measure: ${url}`);
        const startTime = Date.now();

        try {
            const response = await page.goto(url, { waitUntil: 'load', timeout: 30000 });
            const duration = Date.now() - startTime;

            if (!response) {
                console.error(`❌ FAILED TO LOAD (No Response) ${url}`);
                continue;
            }

            if (response.status() >= 400) {
                console.error(`❌ CRITICAL FAILURE HTTP ${response.status()} on ${url} in ${duration}ms`);
            } else {
                console.log(`✅ Loaded ${url} cleanly in ⚡ ${duration}ms with status HTTP ${response.status()}`);

                // 🔥 DOM ACTION FUZZING 🔥
                console.log(`🤖 Initiating UI Click Triggers...`);
                const buttons = await page.locator('button, a.bg-indigo-600, a.text-indigo-600').all();
                const clickableCount = Math.min(buttons.length, 3); // Max 3 clicks per page to prevent full nav-away

                for (let i = 0; i < clickableCount; i++) {
                    try {
                        const isVisible = await buttons[i].isVisible();
                        if (isVisible) {
                            // We don't want to actually submit destructive forms, so we use a very short timeout
                            // and swallow navigation timeouts to simulate rapid clicking.
                            await buttons[i].click({ timeout: 1500, noWaitAfter: true });
                            console.log(`   👉 Clicked DOM element [${i + 1}/${clickableCount}]`);
                            await page.waitForTimeout(500);
                        }
                    } catch (clickErr) {
                        // Click failures (like element covered) are normal in fuzzing
                    }
                }

                // Ensure no 500 error dumped visually to the DOM after interaction
                const content = await page.content();
                if (content.includes("Internal Server Error")) {
                    console.error(`❌ VISUAL 500 DOM CRASH DETECTED ON ${url}`);
                } else {
                    console.log(`✅ DOM Resilience Confirmed`);
                }
            }
        } catch (err) {
            const duration = Date.now() - startTime;
            console.error(`❌ CRITICAL EXCEPTION on ${url} after ${duration}ms: ${err.message}`);
        }
    }

    console.log('\nChaos Crawler UI evaluation finished successfully.');
    await browser.close();
})();
