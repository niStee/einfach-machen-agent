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
 * Performs automated deep inspection of TYPO3 FormFramework structures & anti-bot protection on einfach-machen.gov.de
 */
export async function discoverApi(): Promise<DiscoveryResult> {
  console.log('🔍 Starting API & Form Discovery on einfach-machen.gov.de...\n');

  const browser: Browser = await chromium.launch({ headless: true });
  const context: BrowserContext = await browser.newContext();
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
