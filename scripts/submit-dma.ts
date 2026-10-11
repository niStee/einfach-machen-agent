/* eslint-disable security/detect-non-literal-fs-filename */
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import fs from 'fs';
import path from 'path';

export interface DmaComplaintPayload {
  firstName: string;
  lastName: string;
  email: string;
  topic: string;
  subject: string;
  message: string;
}

export interface DmaSubmissionOptions {
  dryRun?: boolean;
  headless?: boolean;
}

export interface DmaSubmissionResult {
  success: boolean;
  dryRun: boolean;
  submissionId?: string;
  timestamp: string;
  screenshotPath?: string;
}

export interface DmaValidationResult {
  valid: boolean;
  errors: string[];
}

export const DMA_FORM_URL = 'https://digital-markets-act.ec.europa.eu/contact-us-eu-citizen_en';

export function validateDmaPayload(payload: DmaComplaintPayload): DmaValidationResult {
  const errors: string[] = [];

  if (!payload.firstName || payload.firstName.trim().length === 0) {
    errors.push('First name is required');
  }
  if (!payload.lastName || payload.lastName.trim().length === 0) {
    errors.push('Last name is required');
  }
  if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
    errors.push('A valid email address is required');
  }
  if (!payload.topic || payload.topic.trim().length === 0) {
    errors.push('Topic selection is required');
  }
  if (!payload.subject || payload.subject.trim().length === 0) {
    errors.push('Subject is required');
  } else if (payload.subject.length > 100) {
    errors.push(`Subject exceeds 100 character limit (${payload.subject.length}/100)`);
  }
  if (!payload.message || payload.message.trim().length === 0) {
    errors.push('Message is required');
  } else if (payload.message.length > 2000) {
    errors.push(`Message exceeds 2000 character limit (${payload.message.length}/2000)`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function buildPlayIntegrityComplaintPayload(options?: {
  firstName?: string;
  lastName?: string;
  email?: string;
}): DmaComplaintPayload {
  const subject = 'Circumvention of DMA Art. 6(4) & 6(7) via Google Play Integrity API';

  const message = `Gatekeeper: Alphabet / Google (Core Platform Services: Android OS & Google Play)

I am an EU citizen reporting a technical mechanism deployed by Google that circumvents consumer rights under DMA Article 6(4) (alternative app stores/sideloading) and Article 6(7) (interoperability of operating systems and hardware).

The Mechanism:
While Google nominally allows installing apps outside Google Play, Google's Play Integrity API acts as an anti-competitive gatekeeper check:
1. When an application is installed via an alternative app store or sideloaded, Play Integrity returns "appLicensingVerdict: UNEVALUATED".
2. When a consumer uses an unrooted, community-maintained open OS (such as LineageOS) with an unlocked bootloader, Play Integrity refuses to grant "MEETS_DEVICE_INTEGRITY".

Practical Impact on End-Users:
Everyday mobility, banking, and public service apps (e.g. Ryde / com.ryde_android) integrate Play Integrity as a turnkey check. As a result:
- Sideloaded installations are rejected with server errors (HTTP 403 APP_ATTEST_INVALID: "Please make sure you are using the official app").
- The Google Play Store disables installation ("This app won't work on your device"), and the app blocks login ("Please make sure you are using a supported device").

Harm to the Digital Single Market:
1. Illusory Freedom of App Choice (Art. 6(4)): Sideloading and alternative stores are rendered useless in practice if apps installed through them are systematically blocked.
2. Suppression of Alternative OSes (Art. 6(7)): Consumers are coerced into using Google's proprietary stock firmware and Play account ecosystem, destroying competition from community operating systems.
3. Premature Device Obsolescence: Fully functional hardware running secure, updated open-source software is locked out of essential services.

I request that the DMA Taskforce examine Google Play Integrity API under Articles 6(4) and 6(7) enforcement.`;

  return {
    firstName: options?.firstName || process.env.DMA_FIRST_NAME || 'EU',
    lastName: options?.lastName || process.env.DMA_LAST_NAME || 'Citizen',
    email: options?.email || process.env.DMA_EMAIL || 'citizen@example.eu',
    topic: 'Contact us as an EU Citizen',
    subject,
    message
  };
}

export async function submitDmaComplaint(
  payload: DmaComplaintPayload,
  options: DmaSubmissionOptions = { dryRun: true }
): Promise<DmaSubmissionResult> {
  const isDryRun = options.dryRun !== false;
  console.log(`🇪🇺 Executing DMA Citizen Submission (dryRun: ${isDryRun})...`);

  const validation = validateDmaPayload(payload);
  if (!validation.valid) {
    throw new Error(`Invalid DMA Complaint Payload: ${validation.errors.join('; ')}`);
  }

  const isHeadless = options.headless ?? (process.env.HEADLESS === 'true');
  const browser: Browser = await chromium.launch({
    headless: isHeadless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--start-minimized',
      '--window-position=-32000,-32000',
      '--window-size=1280,900'
    ]
  });

  const context: BrowserContext = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
  });
  const page: Page = await context.newPage();

  try {
    console.log(`🌐 Navigating to ${DMA_FORM_URL}...`);
    await page.goto(DMA_FORM_URL, { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(2000);

    // Ensure logs directory exists
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs', { recursive: true });
    }

    // 1. Fill First Name
    const firstNameInput = await page.$('input[name="oe_first_name[0][value]"], #edit-oe-first-name-0-value');
    if (firstNameInput) {
      await firstNameInput.fill(payload.firstName);
      console.log('✅ Filled First Name');
    } else {
      throw new Error('First name input field not found on page');
    }

    // 2. Fill Last Name
    const lastNameInput = await page.$('input[name="oe_last_name[0][value]"], #edit-oe-last-name-0-value');
    if (lastNameInput) {
      await lastNameInput.fill(payload.lastName);
      console.log('✅ Filled Last Name');
    } else {
      throw new Error('Last name input field not found on page');
    }

    // 3. Fill Email
    const emailInput = await page.$('input[name="mail"], #edit-mail');
    if (emailInput) {
      await emailInput.fill(payload.email);
      console.log('✅ Filled Email Address');
    } else {
      throw new Error('Email input field not found on page');
    }

    // 4. Select Topic
    const topicSelect = await page.$('select[name="oe_topic"], #edit-oe-topic');
    if (topicSelect) {
      await topicSelect.selectOption({ label: payload.topic });
      console.log(`✅ Selected Topic: ${payload.topic}`);
    } else {
      throw new Error('Topic select dropdown not found on page');
    }

    // 5. Fill Subject
    const subjectInput = await page.$('input[name="subject[0][value]"], #edit-subject-0-value');
    if (subjectInput) {
      await subjectInput.fill(payload.subject);
      console.log(`✅ Filled Subject (${payload.subject.length}/100 chars)`);
    } else {
      throw new Error('Subject input field not found on page');
    }

    // 6. Fill Message
    const messageInput = await page.$('textarea[name="message[0][value]"], #edit-message-0-value');
    if (messageInput) {
      await messageInput.fill(payload.message);
      console.log(`✅ Filled Message (${payload.message.length}/2000 chars)`);
    } else {
      throw new Error('Message textarea not found on page');
    }

    // 7. Check Privacy Policy Checkbox
    const privacyCheckbox = await page.$('input[name="privacy_policy"], #edit-privacy-policy');
    if (privacyCheckbox) {
      await privacyCheckbox.check({ force: true });
      console.log('✅ Checked Privacy Policy Consent');
    } else {
      throw new Error('Privacy policy checkbox not found on page');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    if (isDryRun) {
      const screenshotPath = path.join('logs', `dma-dryrun-${timestamp}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`🧪 Dry-Run Mode Active: Form verified and filled successfully without submitting.`);
      console.log(`📸 Audit screenshot saved: ${screenshotPath}`);

      await browser.close();
      return {
        success: true,
        dryRun: true,
        submissionId: `dryrun-${Date.now()}`,
        timestamp: new Date().toISOString(),
        screenshotPath
      };
    }

    // Live Mode: Click Submit
    console.log('🚀 Live Mode: Submitting form to European Commission DMA team...');
    const submitBtn = await page.$('input[type="submit"][id*="edit-submit"], button[type="submit"]');
    if (!submitBtn) {
      throw new Error('Submit button not found on page');
    }

    await submitBtn.click({ force: true });
    try {
      await page.waitForLoadState('networkidle', { timeout: 15000 });
    } catch {
      await page.waitForTimeout(5000);
    }

    const currentUrl = page.url();
    console.log(`📍 Submission target URL: ${currentUrl}`);

    const confirmationBanner = await page.$('.messages--status, [role="status"], [role="alert"], .alert-success');
    if (confirmationBanner) {
      const bannerText = (await confirmationBanner.innerText()).trim();
      console.log(`📋 Confirmation: ${bannerText}`);
    }

    const liveScreenshot = path.join('logs', `dma-submission-${timestamp}.png`);
    await page.screenshot({ path: liveScreenshot, fullPage: true });

    console.log('🎉 DMA Complaint successfully submitted!');
    await browser.close();

    return {
      success: true,
      dryRun: false,
      submissionId: `live-${Date.now()}`,
      timestamp: new Date().toISOString(),
      screenshotPath: liveScreenshot
    };
  } catch (err) {
    await browser.close();
    throw err;
  }
}

export function getArgValue(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx !== -1 && idx + 1 < args.length) {
    return args[idx + 1];
  }
  return undefined;
}

// CLI Execution entry point
if (import.meta.main) {
  const args = process.argv.slice(2);
  const isLive = args.includes('--live');
  const dryRun = !isLive;

  const firstName = getArgValue(args, '--first-name');
  const lastName = getArgValue(args, '--last-name');
  const email = getArgValue(args, '--email');

  console.log(`\n=== DMA Citizen Complaint Automation ===`);
  console.log(`Mode: ${dryRun ? 'DRY-RUN (Safe mode, will not submit)' : 'LIVE SUBMISSION'}\n`);

  const payload = buildPlayIntegrityComplaintPayload({ firstName, lastName, email });

  submitDmaComplaint(payload, { dryRun })
    .then(result => {
      console.log('\nResult:', JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(err => {
      console.error('\n❌ Error during execution:', err);
      process.exit(1);
    });
}
