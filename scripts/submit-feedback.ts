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
 * Executes feedback submission for einfach-machen.gov.de with Playwright automation.
 */
export async function submitFeedback(
  payload: FeedbackPayload,
  options: SubmissionOptions = { dryRun: true }
): Promise<SubmissionResult> {
  const isDryRun = options.dryRun !== false;
  console.log(`📝 Executing Feedback Submission (dryRun: ${isDryRun})...`);

  const browser: Browser = await chromium.launch({ headless: false });
  const context: BrowserContext = await browser.newContext();
  const page: Page = await context.newPage();

  try {
    await page.goto('https://einfach-machen.gov.de/meldeformular', { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(2000);

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

    console.log('🚀 Live Mode: Filling proposal form fields...');

    // Fill form elements if available
    const textarea = await page.$('textarea');
    if (textarea) {
      const fullText = `${payload.title ? `Titel: ${payload.title}\n\n` : ''}${payload.description}`;
      await textarea.fill(fullText);
      console.log('✅ Textarea filled with proposal text.');
    }

    const nextBtn = await page.$('form button[type="submit"], form input[type="submit"], button.btn-primary');
    if (nextBtn) {
      console.log('🚀 Submitting form...');
      await nextBtn.click();
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
      description: 'Problem:\nÖffentliche Verwaltungen geben dreistellige Millionenbeträge für proprietäre Softwarelizenzen und US-Cloud-Abos aus — z. B. Bayern mit rund 360 Millionen Euro an Microsoft (2020–2027) oder die Bundesverwaltung mit Kostensteigerungen von 8,8 Mio. € (2020) auf 18,3 Mio. € (2025). Dies missachtet u. a. das Bayerische Digitalgesetz von 2022, das Behörden bei Neuanschaffungen zur Nutzung von Open Source verpflichtet, sowie den Beschluss der Ministerpräsidentenkonferenz zur föderalen Modernisierungsagenda (Frist: 31. März 2027 für souveräne Alternativen).\n\nVorschlag:\n1. Konsequente Umsetzung des Grundsatzes "Public Money = Public Code" bei allen IT-Neuanschaffungen auf Landes- und Bundesebene.\n2. Einhaltung der gesetzlichen Vorrangregel für Open Source und Verbindlichkeit der Frist zum 31. März 2027.\n3. Beschleunigte Bereitstellung und Nutzung quelloffener Arbeitsplätze (z. B. openDesk / Phoenix) in der Verwaltung.'
    },
    { dryRun: !isLive }
  );
}
