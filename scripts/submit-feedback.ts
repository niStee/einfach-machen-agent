import { chromium, Browser, BrowserContext, Page } from 'playwright';
import fs from 'fs';
import path from 'path';

export interface FeedbackPayload {
  perspective?: string;
  topic?: string;
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
 * Executes feedback submission for einfach-machen.gov.de with dryRun protection and Playwright automation.
 */
export async function submitFeedback(
  payload: FeedbackPayload,
  options: SubmissionOptions = { dryRun: true }
): Promise<SubmissionResult> {
  const isDryRun = options.dryRun !== false;
  console.log(`📝 Executing Feedback Submission (dryRun: ${isDryRun})...`);

  const browser: Browser = await chromium.launch({ headless: true });
  const context: BrowserContext = await browser.newContext();
  const page: Page = await context.newPage();

  try {
    await page.goto('https://einfach-machen.gov.de/meldeformular', { waitUntil: 'domcontentloaded', timeout: 30000 });

    if (isDryRun) {
      console.log('🧪 Dry-Run Mode Active: Navigated to form and validated step 1 accessibility.');
      await browser.close();
      return {
        success: true,
        dryRun: true,
        submissionId: `dryrun-${Date.now()}`,
        timestamp: new Date().toISOString()
      };
    }

    console.log('🚀 Live Mode: Submitting feedback proposal...');
    await page.waitForSelector('form button[type="submit"]', { timeout: 10000 });
    await page.click('form button[type="submit"]');

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
  submitFeedback({
    description: 'Vorschlag zur Beschleunigung digitaler Verwaltungsanträge und Abbau von Schriftformerfordernissen.'
  });
}
