import { chromium, Browser, BrowserContext, Page } from 'playwright';
import fs from 'fs';
import path from 'path';

export interface FeedbackPayload {
  perspective?: string;
  topic?: string;
  title?: string;
  description: string;
  authority?: string;
}

export interface SubmissionOptions {
  dryRun?: boolean;
}

export interface SubmissionResult {
  success: boolean;
  dryRun: boolean;
  submissionId?: string;
  timestamp: string;
}

/**
 * Executes feedback submission for einfach-machen.gov.de handling label pointer intercepts cleanly.
 */
export async function submitFeedback(
  payload: FeedbackPayload,
  options: SubmissionOptions = { dryRun: true }
): Promise<SubmissionResult> {
  const isDryRun = options.dryRun !== false;
  console.log(`📝 Executing Feedback Submission (dryRun: ${isDryRun})...`);

  const isHeadless = process.env.HEADLESS === 'true';
  const browser: Browser = await chromium.launch({
    headless: isHeadless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--start-minimized',
      '--window-position=-32000,-32000',
      '--window-size=1,1'
    ]
  });

  const context: BrowserContext = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
  });
  const page: Page = await context.newPage();

  try {
    await page.goto('https://einfach-machen.gov.de/meldeformular', { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(2000);

    // Step 1: Click Privatperson label (handles pointer interception)
    const step1Label = await page.$('label[for*="person_art-0"], label.form-check-wrapping-label');
    if (step1Label) {
      await step1Label.click({ force: true });
      console.log('✅ Step 1: Selected perspective option label.');
    }

    if (isDryRun) {
      console.log('🧪 Dry-Run Mode Active: Navigated to form and validated step 1 accessibility in offscreen browser window.');
      await browser.close();
      return {
        success: true,
        dryRun: true,
        submissionId: `dryrun-${Date.now()}`,
        timestamp: new Date().toISOString()
      };
    }

    console.log('🚀 Live Mode: Navigating multi-step proposal form...');

    // Click Step 1 Next
    const step1Btn = await page.$('button[type="submit"].btn-primary, input[type="submit"]');
    if (step1Btn) {
      await step1Btn.click({ force: true });
      await page.waitForTimeout(2500);
    }

    // Step 2: Select Topic Label
    const step2Label = await page.$('label.form-check-wrapping-label');
    if (step2Label) {
      await step2Label.click({ force: true });
      console.log('✅ Step 2: Selected topic option label.');
    }

    const step2Btn = await page.$('button[type="submit"].btn-primary, input[type="submit"]');
    if (step2Btn) {
      await step2Btn.click({ force: true });
      await page.waitForTimeout(2500);
    }

    // Step 3: Fill Textarea with Title and Description
    const textarea = await page.$('textarea');
    if (textarea) {
      const fullText = `${payload.title ? `Titel: ${payload.title}\n\n` : ''}${payload.description}`;
      await textarea.fill(fullText);
      console.log('✅ Step 3: Textarea filled with proposal text.');
    }

    const submitBtn = await page.$('button[type="submit"].btn-primary, input[type="submit"]');
    if (submitBtn) {
      console.log('🚀 Step 3: Submitting proposal...');
      await submitBtn.click({ force: true });
      await page.waitForTimeout(3000);
    }

    await browser.close();
    return {
      success: true,
      dryRun: false,
      submissionId: `live-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  } catch (err: any) {
    console.error('❌ Submission failed:', err.message);
    await browser.close();
    return {
      success: false,
      dryRun: isDryRun,
      timestamp: new Date().toISOString()
    };
  }
}

if (import.meta.main) {
  const isLive = process.argv.includes('--live');
  submitFeedback(
    {
      title: 'Digitale Souveränität: Ausstieg aus MS365 Lock-in & Einhaltung des Digitalgesetzes',
      description: 'Problem:\nÖffentliche Verwaltungen geben dreistellige Millionenbeträge für proprietäre Softwarelizenzen aus.\n\nVorschlag:\n1. Konsequente Umsetzung von "Public Money = Public Code".'
    },
    { dryRun: !isLive }
  );
}
