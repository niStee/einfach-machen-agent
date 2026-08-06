import { chromium, Browser, BrowserContext, Page } from 'playwright';
import fs from 'fs';
import path from 'path';

export interface DiscoveredFormStep {
  url: string;
  stepName: string;
  formFields: Array<{ name: string; type: string; id?: string; value?: string }>;
  sessionToken?: string;
}

export interface DiscoveryResult {
  portalUrl: string;
  formFrameworkName: string;
  steps: DiscoveredFormStep[];
  timestamp: string;
}

/**
 * Performs automated deep inspection of TYPO3 FormFramework structures in offscreen minimized browser context.
 */
export async function discoverApi(): Promise<DiscoveryResult> {
  console.log('🔍 Starting API & Form Discovery on einfach-machen.gov.de...\n');

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

  const portalUrl = 'https://einfach-machen.gov.de/meldeformular';
  await page.goto(portalUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

  const docsDir = path.join(__dirname, '../docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  await page.screenshot({ path: path.join(docsDir, 'step1_perspective.png'), fullPage: true });

  const steps: DiscoveredFormStep[] = [];

  const step1Fields = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
    return inputs.map((el) => ({
      name: (el as HTMLInputElement).name || '',
      type: (el as HTMLInputElement).type || el.tagName.toLowerCase(),
      id: el.id || undefined,
      value: (el as HTMLInputElement).value || undefined
    })).filter(f => f.name.length > 0);
  });

  steps.push({
    url: page.url(),
    stepName: 'Step 1: Perspective Selection',
    formFields: step1Fields
  });

  const discoveryResult: DiscoveryResult = {
    portalUrl,
    formFrameworkName: 'TYPO3 FormFramework',
    steps,
    timestamp: new Date().toISOString()
  };

  const outputPath = path.join(docsDir, 'perplexity-discovery.json');
  fs.writeFileSync(outputPath, JSON.stringify(discoveryResult, null, 2), 'utf8');

  console.log(`✅ Discovery complete! Form schema saved to ${outputPath}`);
  await browser.close();

  return discoveryResult;
}

if (import.meta.main) {
  discoverApi();
}
