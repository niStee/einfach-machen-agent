const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const DEBUG = process.env.DEBUG === 'true';

/**
 * Log submission attempt to logs/submissions.log
 */
function logSubmission(feedbackData, status, details = {}) {
  const logsDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const logEntry = {
    timestamp: new Date().toISOString(),
    id: feedbackData.id || 'unknown',
    perspective: feedbackData.perspective,
    topic: feedbackData.topic,
    title: feedbackData.title || '',
    status: status,
    dryRun: feedbackData.dryRun !== false,
    details: details
  };

  fs.appendFileSync(path.join(logsDir, 'submissions.log'), JSON.stringify(logEntry) + '\n');
}

/**
 * Submits feedback to einfach-machen.gov.de using Playwright browser automation
 * to safely handle TYPO3 CSRF state tokens, FormCrShield anti-bot protection, and dynamic honeypot fields.
 */
async function submitFeedback(feedbackData = {}) {
  const isHeadless = process.env.HEADLESS !== 'false';
  const targetUrl = process.env.TARGET_URL || 'https://einfach-machen.gov.de/meldeformular';
  const dryRun = feedbackData.dryRun !== false;

  const data = {
    id: feedbackData.id || 'sample',
    perspective: feedbackData.perspective || 'Privatperson',
    topic: feedbackData.topic || 'Digitalisierung',
    title: feedbackData.title || '',
    description: feedbackData.description || 'Automatisiertes Bürger-Feedback zur Digitalisierung der Verwaltungsprozesse.',
    authority: feedbackData.authority || 'BMDS',
    plz: feedbackData.plz || '10587',
    dryRun: dryRun
  };

  console.log(`🚀 Starting submission process [${data.id}] (dryRun: ${data.dryRun}, headless: ${isHeadless})...`);
  const browser = await chromium.launch({ 
    headless: isHeadless,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();

  if (DEBUG) {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('request', req => console.log('REQUEST:', req.url()));
  }

  const screenshotsDir = path.join(__dirname, '../docs/submission_screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  try {
    // Step 1: Perspective
    console.log(`🔍 Step 1: Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });

    console.log(`👉 Step 1: Selecting perspective "${data.perspective}"...`);
    const perspectiveInput = page.locator(`input[value="${data.perspective}"]`);
    if (await perspectiveInput.count() > 0) {
      await perspectiveInput.check({ force: true });
    } else {
      await page.check('input[type="radio"]', { force: true });
    }
    await page.click('button[type="submit"]:has-text("Weiter zur Themenauswahl")');
    await page.waitForLoadState('networkidle');
    console.log('✅ Step 1: Perspective selected');

    // Step 2: Topic
    console.log(`👉 Step 2: Selecting topic "${data.topic}"...`);
    const topicRadio = page.locator(`input[value="${data.topic}"]`);
    if (await topicRadio.count() > 0) {
      await topicRadio.check({ force: true });
    } else {
      await page.locator('input[type="radio"]').first().check({ force: true });
    }
    await page.locator('button[type="submit"]').last().click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Step 2: Topic selected');

    // Step 3: Description
    console.log(`✍️ Step 3: Filling description field (${data.description.length} chars)...`);
    const textarea = page.locator('textarea');
    if (await textarea.count() > 0) {
      await textarea.fill(data.description.substring(0, 3000));
    }
    await page.locator('button[type="submit"]').last().click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Step 3: Description filled');

    // Detect Honeypot Field for auditing
    const honeypotField = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input[type="text"]'));
      const hidden = inputs.find(i => i.style.display === 'none' || i.style.visibility === 'hidden' || i.offsetHeight === 0);
      return hidden ? hidden.name : null;
    });

    if (honeypotField) {
      console.log(`⚠️  Dynamic honeypot field detected: ${honeypotField} (safely left empty)`);
    }

    // Step 4: Review / Submit
    console.log(`📋 Step 4: Final confirmation step reached.`);
    await page.screenshot({ path: path.join(screenshotsDir, `${data.id}_04_review.png`), fullPage: true });

    if (data.dryRun) {
      console.log('⚠️ DRY RUN ENABLED: Submission verified up to final review step.');
      logSubmission(data, 'SUCCESS_DRY_RUN', { honeypotField });
    } else {
      console.log('🚀 Submitting live form...');
      const submitButtons = page.locator('button[type="submit"], input[type="submit"]');
      if (await submitButtons.count() > 0) {
        await submitButtons.last().click();
        await page.waitForLoadState('networkidle');
        console.log('🎉 Form successfully submitted!');
        await page.screenshot({ path: path.join(screenshotsDir, `${data.id}_05_success.png`), fullPage: true });
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

/**
 * Wraps submission in exponential backoff retries
 */
async function submitWithRetry(feedbackData, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await submitFeedback(feedbackData);
      return;
    } catch (error) {
      console.error(`❌ Attempt ${attempt}/${maxRetries} failed:`, error.message);
      if (attempt === maxRetries) {
        throw new Error(`Submission failed after ${maxRetries} attempts`);
      }
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

const defaultExample = {
  id: 'sample',
  perspective: 'Privatperson',
  topic: 'Digitalisierung',
  title: 'Sample Submission',
  description: 'Vorschlag zur Beschleunigung digitaler Verwaltungsanträge durch optimierte Formularprozesse.',
  authority: 'BMDS',
  plz: '10587',
  dryRun: true
};

if (import.meta.main || require.main === module) {
  if (defaultExample.dryRun) {
    console.log('🧪 DRY RUN MODE - No actual live submission');
  }
  
  submitWithRetry(defaultExample)
    .then(() => console.log('🎉 Process completed successfully.'))
    .catch(err => console.error('❌ Process failed:', err));
}

module.exports = { submitFeedback, submitWithRetry, logSubmission };
