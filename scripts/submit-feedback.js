const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

/**
 * Submits feedback to einfach-machen.gov.de using Playwright browser automation
 * to safely handle TYPO3 CSRF state tokens, FormCrShield anti-bot protection, and dynamic honeypot fields.
 * 
 * @param {Object} feedbackData
 * @param {string} feedbackData.perspective - e.g. "Privatperson", "Unternehmen", "Selbstständig", "Verwaltung", "Verbände", "Verein", "Sonstige"
 * @param {string} feedbackData.topic - e.g. "Digitalisierung", "Arbeit", "Behördenprozesse", etc.
 * @param {string} feedbackData.description - Detailed description text (up to 3000 chars)
 * @param {boolean} [feedbackData.dryRun=true] - If true, stops right before clicking the final submission button to prevent spamming
 */
async function submitFeedback(feedbackData = {}) {
  const isHeadless = process.env.HEADLESS !== 'false';
  const targetUrl = process.env.TARGET_URL || 'https://einfach-machen.gov.de/meldeformular';
  const dryRun = feedbackData.dryRun !== false;

  const data = {
    perspective: feedbackData.perspective || 'Privatperson',
    topic: feedbackData.topic || 'Digitalisierung',
    description: feedbackData.description || 'Automatisiertes Bürger-Feedback zur Digitalisierung der Verwaltungsprozesse.',
    dryRun: dryRun
  };

  console.log(`📝 Starting feedback submission process (dryRun: ${data.dryRun}, headless: ${isHeadless})...`);
  const browser = await chromium.launch({ headless: isHeadless });
  const context = await browser.newContext();
  const page = await context.newPage();

  const screenshotsDir = path.join(__dirname, '../docs/submission_screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  try {
    // Step 1: Navigate to form
    console.log(`🔍 Step 1: Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle' });

    // Step 1: Select Perspective
    console.log(`👉 Selecting perspective: "${data.perspective}"...`);
    const perspectiveInput = page.locator(`input[value="${data.perspective}"]`);
    if (await perspectiveInput.count() > 0) {
      await perspectiveInput.check({ force: true });
    } else {
      await page.check('input[type="radio"]', { force: true });
    }
    await page.screenshot({ path: path.join(screenshotsDir, '01_perspective_selected.png') });
    await page.click('button[type="submit"]:has-text("Weiter zur Themenauswahl")');
    await page.waitForLoadState('networkidle');

    // Step 2: Select Topic / Category
    console.log(`👉 Step 2: Selecting topic category...`);
    const topicRadio = page.locator(`input[value="${data.topic}"]`);
    if (await topicRadio.count() > 0) {
      await topicRadio.check({ force: true });
    } else {
      // Fallback: check first available topic radio
      const firstRadio = page.locator('input[type="radio"]').first();
      await firstRadio.check({ force: true });
    }
    await page.screenshot({ path: path.join(screenshotsDir, '02_topic_selected.png') });
    
    const nextButtonsStep2 = page.locator('button[type="submit"]');
    await nextButtonsStep2.last().click();
    await page.waitForLoadState('networkidle');

    // Step 3: Fill Description
    console.log(`✍️ Step 3: Filling description field (${data.description.length} chars)...`);
    const textarea = page.locator('textarea');
    if (await textarea.count() > 0) {
      await textarea.fill(data.description.substring(0, 3000));
    }
    await page.screenshot({ path: path.join(screenshotsDir, '03_description_filled.png') });

    const nextButtonsStep3 = page.locator('button[type="submit"]');
    await nextButtonsStep3.last().click();
    await page.waitForLoadState('networkidle');

    // Step 4: Review / Authority Step
    console.log(`📋 Step 4: Final confirmation step reached.`);
    await page.screenshot({ path: path.join(screenshotsDir, '04_final_review.png'), fullPage: true });

    if (data.dryRun) {
      console.log('⚠️ DRY RUN ENABLED: Submission verified up to final review step. Form was NOT submitted to live servers.');
    } else {
      console.log('🚀 Submitting form...');
      const submitButton = page.locator('button[type="submit"]:has-text("Absenden")');
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForLoadState('networkidle');
        console.log('🎉 Form successfully submitted!');
        await page.screenshot({ path: path.join(screenshotsDir, '05_submission_success.png') });
      }
    }

  } catch (error) {
    console.error('❌ Feedback submission failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

const defaultExample = {
  perspective: 'Privatperson',
  topic: 'Digitalisierung',
  description: 'Vorschlag zur Beschleunigung digitaler Verwaltungsanträge und Abbau von Schriftformerfordernissen.',
  dryRun: true
};

if (import.meta.main || require.main === module) {
  submitFeedback(defaultExample)
    .then(() => console.log('✅ Submission automation script completed successfully.'))
    .catch(err => console.error('💥 Fatal error in submission script:', err));
}

module.exports = { submitFeedback };
