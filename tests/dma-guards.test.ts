import { afterAll, afterEach, beforeEach, describe, expect, test } from 'bun:test';
import fs from 'node:fs';
import { chromium, type Browser } from 'playwright';
import * as dma from '../scripts/submit-dma';
import type { DmaComplaintPayload, DmaSubmissionResult } from '../scripts/submit-dma';

const NOW_MS = Date.UTC(2026, 0, 2, 12, 0, 0);
const DAY_MS = 24 * 60 * 60 * 1000;

const basePayload: DmaComplaintPayload = {
  firstName: 'Test',
  lastName: 'User',
  email: 'user@example.invalid',
  topic: 'Contact us as an EU Citizen',
  subject: 'Test subject',
  message: 'Test message'
};

const baseIdentity = {
  firstName: 'Test',
  lastName: 'User',
  email: 'user@example.invalid'
};

const expectedFingerprint = 'd90402a5acaa';
const liveArgs = [
  '--live',
  '--first-name', 'Test',
  '--last-name', 'User',
  '--email', 'user@example.invalid',
  '--message-file', 'complaint.txt',
  '--confirm', expectedFingerprint
];

const fixtureHtml = fs.readFileSync('tests/fixtures/dma-form.html', 'utf8');
const originalWorkingDirectory = process.cwd();
let testWorkingDirectory = '';
const selectorFields = [
  'firstName',
  'lastName',
  'email',
  'topic',
  'subject',
  'message',
  'privacy',
  'submit',
  'confirmation'
] as const;

let browser: Browser | undefined;
let browserLaunchError = '';
try {
  browser = await chromium.launch({ headless: true });
} catch (error) {
  browserLaunchError = error instanceof Error ? error.message.split('\n')[0] : String(error);
  console.warn(`Chromium unavailable; offline browser tests skipped: ${browserLaunchError}`);
}
const browserTest = browser ? test : test.skip;

afterAll(async () => {
  await browser?.close();
});

async function countWithHtmlRewriter(pageContent: string, selector: string): Promise<number> {
  let count = 0;
  const output = new HTMLRewriter()
    .on(selector, {
      element() {
        count += 1;
      }
    })
    .transform(new Response(pageContent));
  await output.text();
  return count;
}

function temporaryDirectory(): string {
  return fs.mkdtempSync('tests/.dma-guards-');
}

beforeEach(() => {
  testWorkingDirectory = temporaryDirectory();
  process.chdir(testWorkingDirectory);
});

afterEach(() => {
  process.chdir(originalWorkingDirectory);
  fs.rmSync(testWorkingDirectory, { recursive: true, force: true });
});

describe('DMA response circuit breaker', () => {
  test('assessResponse returns ok for a normal 200 page', () => {
    expect(dma.assessResponse({ status: 200, headers: {}, pageContent: '<form>Contact</form>' }))
      .toEqual({ ok: true });
  });

  test('assessResponse rate-limits HTTP 429 and preserves Retry-After', () => {
    expect(dma.assessResponse({
      status: 429,
      headers: { 'Retry-After': '120' },
      pageContent: 'Too many requests'
    })).toEqual({ ok: false, reason: 'rate-limited', retryAfter: '120' });
  });

  test('assessResponse marks HTTP 503 unavailable', () => {
    expect(dma.assessResponse({ status: 503, headers: {}, pageContent: 'Unavailable' }))
      .toEqual({ ok: false, reason: 'unavailable' });
  });

  test('assessResponse detects every supported CAPTCHA marker', () => {
    const captchaPages = [
      '<div class="g-recaptcha"></div>',
      '<div class="h-captcha"></div>',
      '<iframe src="https://challenge.invalid/captcha/widget"></iframe>'
    ];
    for (const pageContent of captchaPages) {
      expect(dma.assessResponse({ status: 200, headers: {}, pageContent }))
        .toEqual({ ok: false, reason: 'challenge' });
    }
  });

  test('assessResponse does not mistake ordinary captcha prose for an iframe challenge', () => {
    expect(dma.assessResponse({
      status: 200,
      headers: {},
      pageContent: '<p>The word captcha in prose is not a challenge widget.</p>'
    })).toEqual({ ok: true });
  });
});

describe('DMA payload confirmation', () => {
  test('payloadFingerprint is the specified 12-character SHA-256 prefix', () => {
    expect(dma.payloadFingerprint(basePayload)).toBe(expectedFingerprint);
    expect(dma.payloadFingerprint(basePayload)).toMatch(/^[0-9a-f]{12}$/);
  });

  test('payloadFingerprint changes when any payload field changes', () => {
    for (const field of Object.keys(basePayload) as Array<keyof DmaComplaintPayload>) {
      const changed = { ...basePayload, [field]: `${basePayload[field]} changed` };
      expect(dma.payloadFingerprint(changed)).not.toBe(expectedFingerprint);
    }
  });

  test('checkLive accepts the exact payload fingerprint and complete CLI identity', () => {
    expect(dma.checkLive({ args: liveArgs, payload: basePayload, identityProvided: baseIdentity }))
      .toEqual({ ok: true });
  });

  test('checkLive refuses a missing confirmation', () => {
    const args = liveArgs.filter((_, index) => index !== liveArgs.indexOf('--confirm') && index !== liveArgs.indexOf('--confirm') + 1);
    expect(dma.checkLive({ args, payload: basePayload, identityProvided: baseIdentity }))
      .toEqual({ ok: false, reason: 'confirmation-required' });
  });

  test('checkLive refuses a wrong confirmation', () => {
    const args = liveArgs.map(value => value === expectedFingerprint ? '000000000000' : value);
    expect(dma.checkLive({ args, payload: basePayload, identityProvided: baseIdentity }))
      .toEqual({ ok: false, reason: 'confirmation-mismatch' });
  });

  test('checkLive refuses confirmation after one message word changes', () => {
    const changed = { ...basePayload, message: 'Test changed message' };
    expect(dma.checkLive({ args: liveArgs, payload: changed, identityProvided: baseIdentity }))
      .toEqual({ ok: false, reason: 'confirmation-mismatch' });
  });

  test('checkLive refuses each missing CLI identity field', () => {
    for (const field of Object.keys(baseIdentity) as Array<keyof typeof baseIdentity>) {
      const identityProvided = { ...baseIdentity, [field]: undefined };
      expect(dma.checkLive({ args: liveArgs, payload: basePayload, identityProvided }))
        .toEqual({ ok: false, reason: 'identity-required' });
    }
  });

  test('checkLive refuses the dry-run placeholder identity', () => {
    const placeholderPayload = dma.buildPlayIntegrityComplaintPayload();
    const identityProvided = {
      firstName: placeholderPayload.firstName,
      lastName: placeholderPayload.lastName,
      email: placeholderPayload.email
    };
    const args = liveArgs.map(value => value === expectedFingerprint ? dma.payloadFingerprint(placeholderPayload) : value);
    expect(dma.checkLive({ args, payload: placeholderPayload, identityProvided }))
      .toEqual({ ok: false, reason: 'identity-required' });
  });

  test('checkLive refuses each placeholder field on its own, with a real identity otherwise', () => {
    const placeholders = [
      { firstName: 'EU' },
      { firstName: 'eu' },
      { lastName: 'Citizen' },
      { lastName: 'CITIZEN' },
      { email: 'citizen@example.eu' },
      { email: 'Citizen@Example.EU' }
    ];
    for (const placeholder of placeholders) {
      const identityProvided = { ...baseIdentity, ...placeholder };
      expect(dma.checkLive({ args: liveArgs, payload: basePayload, identityProvided }))
        .toEqual({ ok: false, reason: 'identity-required' });
    }
    // Control: the same call with the real identity passes, so the refusals above come from the placeholder.
    expect(dma.checkLive({ args: liveArgs, payload: basePayload, identityProvided: baseIdentity }))
      .toEqual({ ok: true });
  });
});

describe('DMA live cooldown and audit records', () => {
  test('cooldownRemainingMs allows a first run and a run at or after 24 hours', () => {
    const lastLiveIso = new Date(NOW_MS - DAY_MS).toISOString();
    expect(dma.cooldownRemainingMs(null, NOW_MS)).toBe(0);
    expect(dma.cooldownRemainingMs(lastLiveIso, NOW_MS)).toBe(0);
    expect(dma.cooldownRemainingMs(new Date(NOW_MS - DAY_MS - 1).toISOString(), NOW_MS)).toBe(0);
  });

  test('cooldownRemainingMs refuses a run within 24 hours', () => {
    const elapsedMs = 60 * 60 * 1000;
    const lastLiveIso = new Date(NOW_MS - elapsedMs).toISOString();
    expect(dma.cooldownRemainingMs(lastLiveIso, NOW_MS)).toBe(DAY_MS - elapsedMs);
  });

  test('last-live record round-trips through the fixed record path', () => {
    const iso = new Date(NOW_MS).toISOString();
    dma.writeLastLive(iso);
    expect(dma.readLastLive()).toBe(iso);
    expect(fs.readFileSync('logs/dma-last-live', 'utf8')).toBe(`${iso}\n`);
  });

  test('readLastLive returns null when the fixed record path has no record', () => {
    expect(dma.readLastLive()).toBeNull();
    expect(fs.existsSync('logs/dma-last-live')).toBe(false);
  });

  test('recordLiveSubmission appends one JSON line and writes the cooldown record', () => {
    const result: DmaSubmissionResult = {
      success: false,
      dryRun: false,
      timestamp: new Date(NOW_MS).toISOString(),
      reason: 'rate-limited',
      retryAfter: '120',
      screenshotPath: 'audit.png'
    };
    const recordedAt = new Date(NOW_MS + 1000).toISOString();
    dma.recordLiveSubmission({ result, recordedAt });
    const lines = fs.readFileSync('logs/dma-submissions.json', 'utf8').trimEnd().split('\n');
    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0])).toEqual(result);
    expect(dma.readLastLive()).toBe(recordedAt);
  });

  test('recordLiveSubmission does not record a dry run as a live attempt', () => {
    const result: DmaSubmissionResult = {
      success: true,
      dryRun: true,
      timestamp: new Date(NOW_MS).toISOString()
    };
    dma.recordLiveSubmission({ result, recordedAt: new Date(NOW_MS).toISOString() });
    expect(fs.existsSync('logs/dma-submissions.json')).toBe(false);
    expect(fs.existsSync('logs/dma-last-live')).toBe(false);
  });
});

describe('DMA offline form fixture', () => {
  test('fixture is synthetic and does not load the live form', () => {
    expect(fixtureHtml).toContain('<!doctype html>');
    expect(fixtureHtml).not.toContain(dma.DMA_FORM_URL);
  });

  for (const field of selectorFields) {
    browserTest(`Chromium fixture selector ${field} matches exactly one element`, async () => {
      const page = await browser!.newPage();
      try {
        await page.setContent(fixtureHtml);
        const selector = dma.DMA_SELECTORS[field];
        expect(typeof selector).toBe('string');
        expect(await page.locator(selector).count()).toBe(1);
      } finally {
        await page.close();
      }
    });

    test(`HTMLRewriter fixture selector ${field} matches exactly one element`, async () => {
      const selector = dma.DMA_SELECTORS[field];
      expect(typeof selector).toBe('string');
      expect(await countWithHtmlRewriter(fixtureHtml, selector)).toBe(1);
    });
  }

  test('browser-free negative control detects a fixture with first name removed', async () => {
    const firstNameElement = '      <input id="edit-oe-first-name-0-value" name="oe_first_name[0][value]" type="text">\n';
    const incompleteFixture = fixtureHtml.replace(firstNameElement, '');
    expect(incompleteFixture).not.toBe(fixtureHtml);
    expect(await countWithHtmlRewriter(incompleteFixture, dma.DMA_SELECTORS.firstName)).toBe(0);
    expect(await countWithHtmlRewriter(fixtureHtml, dma.DMA_SELECTORS.firstName)).toBe(1);
  });
});

describe('DMA browser transparency and CLI mode', () => {
  test('buildLaunchArgs retains the offscreen window position', () => {
    expect(dma.buildLaunchArgs()).toContain('--window-position=-32000,-32000');
  });

  test('buildLaunchArgs omits automation masking and disabled-sandbox flags', () => {
    const args = dma.buildLaunchArgs();
    expect(args).not.toContain('--disable-blink-features=AutomationControlled');
    expect(args).not.toContain('--no-sandbox');
    expect(args).not.toContain('--disable-setuid-sandbox');
  });

  test('buildContextOptions retains an explicit viewport', () => {
    expect(dma.buildContextOptions().viewport).toEqual({ width: 1280, height: 900 });
  });

  test('buildContextOptions does not set a custom user agent', () => {
    expect('userAgent' in dma.buildContextOptions()).toBe(false);
  });

  test('CLI mode defaults to dry run', () => {
    expect(dma.isLiveMode([])).toBe(false);
    expect(dma.isLiveMode(['--message-file', 'complaint.txt'])).toBe(false);
  });

  test('CLI mode selects live only with an explicit live flag', () => {
    expect(dma.isLiveMode(['--live'])).toBe(true);
  });
});

describe('DMA CLI guard wiring without a browser', () => {
  test('runDmaCli labels the sample and placeholder identity and prints the exact fingerprint', async () => {
    const output: string[] = [];
    const originalLog = console.log;
    console.log = (...values: unknown[]) => output.push(values.join(' '));
    try {
      const status = await dma.runDmaCli([], async (_payload, options) => ({
        success: true,
        dryRun: options?.dryRun !== false,
        timestamp: new Date(NOW_MS).toISOString()
      }));
      expect(status).toBe(0);
      const text = output.join('\n');
      expect(text).toContain('PLACEHOLDER IDENTITY');
      expect(text).toContain('UNREVIEWED SAMPLE COMPLAINT TEXT');
      expect(text).toContain(`Payload fingerprint: ${dma.payloadFingerprint(dma.buildPlayIntegrityComplaintPayload())}`);
      expect(text).toContain('A live run requires --confirm');
    } finally {
      console.log = originalLog;
    }
  });

  test('runDmaCli fingerprints explicit message-file content in a dry run', async () => {
    const output: string[] = [];
    const originalLog = console.log;
    console.log = (...values: unknown[]) => output.push(values.join(' '));
    try {
      const messagePath = 'complaint.txt';
      fs.writeFileSync(messagePath, 'Explicitly reviewed test message.');
      let submittedPayload: DmaComplaintPayload | undefined;
      const status = await dma.runDmaCli(['--message-file', messagePath], async (payload, _options) => {
        submittedPayload = payload;
        return { success: true, dryRun: true, timestamp: new Date(NOW_MS).toISOString() };
      });
      expect(status).toBe(0);
      expect(submittedPayload?.message).toBe('Explicitly reviewed test message.');
      expect(output.join('\n')).toContain(`Payload fingerprint: ${dma.payloadFingerprint(submittedPayload!)}`);
      expect(output.join('\n')).not.toContain('UNREVIEWED SAMPLE COMPLAINT TEXT');
    } finally {
      console.log = originalLog;
    }
  });

  test('runDmaCli refuses live mode without an explicit message file before submission', async () => {
    let submissionCalled = false;
    const originalError = console.error;
    console.error = () => undefined;
    try {
      const status = await dma.runDmaCli(['--live'], async (_payload, _options) => {
        submissionCalled = true;
        return { success: true, dryRun: false, timestamp: new Date(NOW_MS).toISOString() };
      });
      expect(status).toBe(1);
      expect(submissionCalled).toBe(false);
    } finally {
      console.error = originalError;
    }
  });
});
