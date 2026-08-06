const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const LOG_FILE = path.join(__dirname, '../logs/submissions.log');

function logSubmission(data, status, details = {}) {
  const logDir = path.dirname(LOG_FILE);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const entry = {
    timestamp: new Date().toISOString(),
    id: data.id,
    perspective: data.perspective,
    topic: data.topic,
    title: data.title,
    status: status,
    dryRun: Boolean(data.dryRun),
    details: details
  };

  fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n');
}

async function submitFeedback(data) {
  const isHeadless = process.env.HEADLESS !== 'false';
  console.log(`🚀 Starting submission process [${data.id || 'unnamed'}] (dryRun: ${data.dryRun}, headless: ${isHeadless})...`);

  const browser = await chromium.launch({ 
    headless: isHeadless,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();
  const screenshotsDir = path.join(__dirname, '../logs/screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  try {
    // Step 1: Landing / Perspective
    console.log('🔍 Step 1: Navigating to https://einfach-machen.gov.de/meldeformular...');
    await page.goto('https://einfach-machen.gov.de/meldeformular', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(screenshotsDir, `${data.id}_01_landing.png`) });

    console.log(`👉 Step 1: Selecting perspective "${data.perspective}"...`);
    const perspectiveRadio = page.locator(`input[type="radio"][value="${data.perspective}"]`);
    if (await perspectiveRadio.count() > 0) {
      await perspectiveRadio.check({ force: true });
    } else {
      await page.click(`label:has-text("${data.perspective}")`);
    }

    const formSubmitSelector = 'form button[type="submit"]:not(.tx-solr-submit), form input[type="submit"]:not(.tx-solr-submit)';
    const step1Next = page.locator(formSubmitSelector).first();
    await step1Next.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Step 1: Perspective selected');

    // Step 2: Topic Selection
    console.log(`👉 Step 2: Selecting topic "${data.topic}"...`);
    const topicRadio = page.locator(`input[type="radio"][value="${data.topic}"]`);
    if (await topicRadio.count() > 0) {
      await topicRadio.check({ force: true });
    } else {
      await page.click(`label:has-text("${data.topic}")`);
    }

    const step2Next = page.locator(formSubmitSelector).first();
    await step2Next.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Step 2: Topic selected');

    // Step 3: Description & Form Validation
    console.log(`✍️ Step 3: Filling description field (${data.description.length} chars)...`);
    const textarea = page.locator('textarea').first();
    await textarea.fill(data.description);

    if (data.authority) {
      const authInput = page.locator('input[name*="authority"], input[name*="behoerde"]').first();
      if (await authInput.count() > 0) await authInput.fill(data.authority);
    }
    if (data.plz) {
      const plzInput = page.locator('input[name*="plz"]').first();
      if (await plzInput.count() > 0) await plzInput.fill(data.plz);
    }

    // Honeypot Shield Check
    let honeypotField = null;
    const hiddenInputs = await page.locator('input[type="hidden"], input[style*="display: none"], input[style*="visibility: hidden"]').all();
    for (const hidden of hiddenInputs) {
      const name = await hidden.getAttribute('name');
      if (name && !name.startsWith('__') && !name.startsWith('tx_form')) {
        honeypotField = name;
        console.log(`⚠️  Dynamic honeypot field detected: ${name} (safely left empty)`);
      }
    }

    await page.screenshot({ path: path.join(screenshotsDir, `${data.id}_03_filled.png`) });

    const step3Next = page.locator(formSubmitSelector).first();
    await step3Next.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Step 3: Description filled');

    // Step 4: Final Summary & Submission
    console.log('📋 Step 4: Final confirmation step reached.');
    await page.screenshot({ path: path.join(screenshotsDir, `${data.id}_04_review.png`) });

    if (data.dryRun) {
      console.log('⚠️ DRY RUN ENABLED: Submission verified up to final review step.');
      logSubmission(data, 'SUCCESS_DRY_RUN', { honeypotField });
    } else {
      console.log('🚀 Submitting live form...');
      const submitButtons = page.locator(formSubmitSelector);
      if (await submitButtons.count() > 0) {
        await submitButtons.last().click();
        await page.waitForLoadState('networkidle');
        console.log('🎉 Form successfully submitted!');
        try {
          await page.screenshot({ path: path.join(screenshotsDir, `${data.id}_05_success.png`), fullPage: true, timeout: 5000 });
        } catch {
          console.log('📸 Success screenshot timed out (non-fatal).');
        }
        logSubmission(data, 'SUCCESS_LIVE', { honeypotField });
      }
    }

  } catch (error) {
    console.error('💥 Error during submission:', error);
    logSubmission(data, 'ERROR', { error: error.message });
    throw error;
  } finally {
    await browser.close();
  }
}

async function submitWithRetry(data, maxRetries = 3) {
  let attempt = 0;
  while (attempt < maxRetries) {
    attempt++;
    try {
      await submitFeedback(data);
      return;
    } catch (err) {
      console.warn(`⚠️ Attempt ${attempt}/${maxRetries} failed for [${data.id}]: ${err.message}`);
      if (attempt >= maxRetries) throw err;
      const backoffMs = Math.pow(2, attempt) * 1000;
      console.log(`⏳ Waiting ${backoffMs / 1000}s before retrying...`);
      await new Promise(res => setTimeout(res, backoffMs));
    }
  }
}

module.exports = { submitFeedback, submitWithRetry };
