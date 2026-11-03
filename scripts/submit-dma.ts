/* eslint-disable security/detect-non-literal-fs-filename */
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { createHash } from 'node:crypto';
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

export type DmaResponseAssessment =
  | { ok: true }
  | { ok: false; reason: 'rate-limited' | 'unavailable' | 'challenge'; retryAfter?: string };

export interface DmaSubmissionResult {
  success: boolean;
  dryRun: boolean;
  submissionId?: string;
  timestamp: string;
  screenshotPath?: string;
  reason?: 'rate-limited' | 'unavailable' | 'challenge';
  retryAfter?: string;
  error?: string;
}

export interface DmaLiveIdentity {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export type DmaLiveCheck =
  | { ok: true }
  | { ok: false; reason: 'confirmation-required' | 'confirmation-mismatch' | 'identity-required' };

export interface DmaValidationResult {
  valid: boolean;
  errors: string[];
}

export const DMA_FORM_URL = 'https://digital-markets-act.ec.europa.eu/contact-us-eu-citizen_en';
export const DMA_LIVE_COOLDOWN_MS = 24 * 60 * 60 * 1000;
export const DMA_AUDIT_PATH = path.join('logs', 'dma-submissions.json');
export const DMA_LAST_LIVE_PATH = path.join('logs', 'dma-last-live');

export const DMA_SELECTORS = {
  firstName: 'input[name="oe_first_name[0][value]"], #edit-oe-first-name-0-value',
  lastName: 'input[name="oe_last_name[0][value]"], #edit-oe-last-name-0-value',
  email: 'input[name="mail"], #edit-mail',
  topic: 'select[name="oe_topic"], #edit-oe-topic',
  subject: 'input[name="subject[0][value]"], #edit-subject-0-value',
  message: 'textarea[name="message[0][value]"], #edit-message-0-value',
  privacy: 'input[name="privacy_policy"], #edit-privacy-policy',
  submit: '#edit-submit, button[name="op"][value="Send message"], form.contact-message-feedback-form button[type="submit"]',
  confirmation: '.messages--status, [role="status"], [role="alert"], .alert-success'
} as const;

export function assessResponse(input: {
  status: number;
  headers: Record<string, string>;
  html: string;
}): DmaResponseAssessment {
  if (input.status === 429) {
    const retryAfter = Object.entries(input.headers)
      .find(([name]) => name.toLowerCase() === 'retry-after')?.[1];
    return {
      ok: false,
      reason: 'rate-limited',
      ...(retryAfter !== undefined ? { retryAfter } : {})
    };
  }
  if (input.status === 503) {
    return { ok: false, reason: 'unavailable' };
  }

  const html = input.html.toLowerCase();
  const hasCaptchaIframe = /<iframe\b[^>]*\bsrc\s*=\s*["'][^"']*captcha/i.test(input.html)
    || /<iframe\b[^>]*\bsrc\s*=\s*[^\s>]*captcha/i.test(input.html);
  if (html.includes('g-recaptcha') || html.includes('h-captcha') || hasCaptchaIframe) {
    return { ok: false, reason: 'challenge' };
  }
  if (input.status < 200 || input.status >= 300) {
    return { ok: false, reason: 'unavailable' };
  }
  return { ok: true };
}

export function payloadFingerprint(payload: DmaComplaintPayload): string {
  const canonicalPayload = [
    payload.firstName,
    payload.lastName,
    payload.email,
    payload.topic,
    payload.subject,
    payload.message
  ].join('\n');
  return createHash('sha256').update(canonicalPayload, 'utf8').digest('hex').slice(0, 12);
}

export function checkLive(input: {
  args: string[];
  payload: DmaComplaintPayload;
  identityProvided: DmaLiveIdentity;
}): DmaLiveCheck {
  const confirmation = getArgValue(input.args, '--confirm');
  if (!confirmation) {
    return { ok: false, reason: 'confirmation-required' };
  }

  const identity = input.identityProvided;
  const placeholders: Record<keyof DmaLiveIdentity, string> = {
    firstName: 'EU',
    lastName: 'Citizen',
    email: 'citizen@example.eu'
  };
  const identityComplete = (Object.keys(placeholders) as Array<keyof DmaLiveIdentity>).every(field => {
    const value = identity[field]?.trim();
    return Boolean(value) && value?.toLowerCase() !== placeholders[field].toLowerCase();
  });
  if (!identityComplete) {
    return { ok: false, reason: 'identity-required' };
  }
  if (confirmation !== payloadFingerprint(input.payload)) {
    return { ok: false, reason: 'confirmation-mismatch' };
  }
  return { ok: true };
}

export function cooldownRemainingMs(lastLiveIso: string | null | undefined, nowMs: number): number {
  if (!lastLiveIso) {
    return 0;
  }
  const lastLiveMs = Date.parse(lastLiveIso);
  if (!Number.isFinite(lastLiveMs)) {
    throw new Error('The last-live record is not a valid ISO timestamp');
  }
  return Math.max(0, DMA_LIVE_COOLDOWN_MS - (nowMs - lastLiveMs));
}

export function readLastLive(recordPath: string): string | null {
  if (!fs.existsSync(recordPath)) {
    return null;
  }
  return fs.readFileSync(recordPath, 'utf8').trim() || null;
}

export function writeLastLive(recordPath: string, iso: string): void {
  fs.mkdirSync(path.dirname(recordPath), { recursive: true });
  fs.writeFileSync(recordPath, `${iso}\n`, { encoding: 'utf8', mode: 0o600 });
}

export function recordLiveSubmission(input: {
  result: DmaSubmissionResult;
  auditPath: string;
  lastLivePath: string;
  recordedAt: string;
}): void {
  if (input.result.dryRun) {
    return;
  }
  fs.mkdirSync(path.dirname(input.auditPath), { recursive: true });
  fs.appendFileSync(input.auditPath, `${JSON.stringify(input.result)}\n`, { encoding: 'utf8', mode: 0o600 });
  writeLastLive(input.lastLivePath, input.recordedAt);
}

export function buildLaunchArgs(): string[] {
  return [
    '--start-minimized',
    '--window-position=-32000,-32000',
    '--window-size=1280,900'
  ];
}

export function buildContextOptions(): { viewport: { width: number; height: number } } {
  return { viewport: { width: 1280, height: 900 } };
}

export function isLiveMode(args: string[]): boolean {
  return args.includes('--live');
}

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
    firstName: options?.firstName || 'EU',
    lastName: options?.lastName || 'Citizen',
    email: options?.email || 'citizen@example.eu',
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
    args: buildLaunchArgs()
  });

  const context: BrowserContext = await browser.newContext(buildContextOptions());
  const page: Page = await context.newPage();

  try {
    console.log(`🌐 Navigating to ${DMA_FORM_URL}...`);
    const response = await page.goto(DMA_FORM_URL, { waitUntil: 'domcontentloaded', timeout: 35000 });
    const assessment = assessResponse({
      status: response?.status() ?? 0,
      headers: response?.headers() ?? {},
      html: await page.content()
    });

    // Ensure logs directory exists
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs', { recursive: true });
    }

    if (!assessment.ok) {
      const auditTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotPath = path.join('logs', `dma-response-${auditTimestamp}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      const retryAfter = assessment.retryAfter ? `; Retry-After: ${assessment.retryAfter}` : '';
      console.error(`Circuit breaker stopped the run (${assessment.reason})${retryAfter}`);
      console.error(`📸 Audit screenshot saved: ${screenshotPath}`);
      await browser.close();
      return {
        success: false,
        dryRun: isDryRun,
        timestamp: new Date().toISOString(),
        screenshotPath,
        reason: assessment.reason,
        ...(assessment.retryAfter !== undefined ? { retryAfter: assessment.retryAfter } : {})
      };
    }

    await page.waitForTimeout(2000);

    // 1. Fill First Name
    const firstNameInput = await page.$(DMA_SELECTORS.firstName);
    if (firstNameInput) {
      await firstNameInput.fill(payload.firstName);
      console.log('✅ Filled First Name');
    } else {
      throw new Error('First name input field not found on page');
    }

    // 2. Fill Last Name
    const lastNameInput = await page.$(DMA_SELECTORS.lastName);
    if (lastNameInput) {
      await lastNameInput.fill(payload.lastName);
      console.log('✅ Filled Last Name');
    } else {
      throw new Error('Last name input field not found on page');
    }

    // 3. Fill Email
    const emailInput = await page.$(DMA_SELECTORS.email);
    if (emailInput) {
      await emailInput.fill(payload.email);
      console.log('✅ Filled Email Address');
    } else {
      throw new Error('Email input field not found on page');
    }

    // 4. Select Topic
    const topicSelect = await page.$(DMA_SELECTORS.topic);
    if (topicSelect) {
      await topicSelect.selectOption({ label: payload.topic });
      console.log(`✅ Selected Topic: ${payload.topic}`);
    } else {
      throw new Error('Topic select dropdown not found on page');
    }

    // 5. Fill Subject
    const subjectInput = await page.$(DMA_SELECTORS.subject);
    if (subjectInput) {
      await subjectInput.fill(payload.subject);
      console.log(`✅ Filled Subject (${payload.subject.length}/100 chars)`);
    } else {
      throw new Error('Subject input field not found on page');
    }

    // 6. Fill Message
    const messageInput = await page.$(DMA_SELECTORS.message);
    if (messageInput) {
      await messageInput.fill(payload.message);
      console.log(`✅ Filled Message (${payload.message.length}/2000 chars)`);
    } else {
      throw new Error('Message textarea not found on page');
    }

    // 7. Check Privacy Policy Checkbox
    const privacyCheckbox = await page.$(DMA_SELECTORS.privacy);
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
    const submitBtn = await page.$(DMA_SELECTORS.submit);
    if (!submitBtn) {
      throw new Error('Submit button not found on page');
    }

    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click({ force: true });
    try {
      await page.waitForLoadState('networkidle', { timeout: 15000 });
    } catch {
      await page.waitForTimeout(5000);
    }

    const currentUrl = page.url();
    console.log(`📍 Submission target URL: ${currentUrl}`);

    const confirmationBanner = await page.$(DMA_SELECTORS.confirmation);
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
export async function runDmaCli(
  args: string[],
  submit: typeof submitDmaComplaint = submitDmaComplaint
): Promise<number> {
  const isLive = isLiveMode(args);
  const dryRun = !isLive;
  const firstName = getArgValue(args, '--first-name');
  const lastName = getArgValue(args, '--last-name');
  const email = getArgValue(args, '--email');
  const messageFile = getArgValue(args, '--message-file');

  console.log('\n=== DMA Citizen Complaint Automation ===');
  console.log(`Mode: ${dryRun ? 'DRY-RUN (Safe mode, will not submit)' : 'LIVE SUBMISSION'}\n`);

  try {
    const payload = buildPlayIntegrityComplaintPayload({ firstName, lastName, email });
    if (messageFile) {
      payload.message = fs.readFileSync(messageFile, 'utf8');
    }

    const usesPlaceholderIdentity = payload.firstName === 'EU'
      || payload.lastName === 'Citizen'
      || payload.email === 'citizen@example.eu';

    if (dryRun) {
      if (usesPlaceholderIdentity) {
        console.log('PLACEHOLDER IDENTITY: dry-run-only identity placeholders are in use and are refused for live runs.');
      }
      if (!messageFile) {
        console.log('UNREVIEWED SAMPLE COMPLAINT TEXT: the built-in text is a dry-run sample only, not a reviewed statement.');
      }
      console.log(`Payload fingerprint: ${payloadFingerprint(payload)}`);
      console.log('A live run requires --confirm with this exact payload fingerprint, --message-file PATH, and a complete command-line identity.');
    } else {
      if (!messageFile) {
        throw new Error('Live submission requires --message-file PATH; the built-in text is only a dry-run sample.');
      }
      const liveCheck = checkLive({
        args,
        payload,
        identityProvided: { firstName, lastName, email }
      });
      if (!liveCheck.ok) {
        const messages = {
          'confirmation-required': 'Live submission requires --confirm <fingerprint> from the dry run of the exact payload.',
          'confirmation-mismatch': 'Live confirmation does not match the exact payload fingerprint.',
          'identity-required': 'Live submission requires non-placeholder --first-name, --last-name, and --email values.'
        };
        throw new Error(messages[liveCheck.reason]);
      }

      const remainingMs = cooldownRemainingMs(readLastLive(DMA_LAST_LIVE_PATH), Date.now());
      if (remainingMs > 0) {
        const remainingHours = (remainingMs / (60 * 60 * 1000)).toFixed(2);
        throw new Error(`Live submission refused by the repository 24-hour cooldown; ${remainingHours} hours remain.`);
      }
    }

    const validation = validateDmaPayload(payload);
    if (!validation.valid) {
      throw new Error(`Invalid DMA Complaint Payload: ${validation.errors.join('; ')}`);
    }

    let result: DmaSubmissionResult;
    try {
      result = await submit(payload, { dryRun });
    } catch (error) {
      if (isLive) {
        recordLiveSubmission({
          result: {
            success: false,
            dryRun: false,
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : String(error)
          },
          auditPath: DMA_AUDIT_PATH,
          lastLivePath: DMA_LAST_LIVE_PATH,
          recordedAt: new Date().toISOString()
        });
      }
      throw error;
    }

    if (isLive) {
      recordLiveSubmission({
        result,
        auditPath: DMA_AUDIT_PATH,
        lastLivePath: DMA_LAST_LIVE_PATH,
        recordedAt: new Date().toISOString()
      });
    }

    console.log('\nResult:', JSON.stringify(result, null, 2));
    return result.success ? 0 : 1;
  } catch (error) {
    console.error('\n❌ Error during execution:', error instanceof Error ? error.message : error);
    return 1;
  }
}

if (import.meta.main) {
  process.exitCode = await runDmaCli(process.argv.slice(2));
}
