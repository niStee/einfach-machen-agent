const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function discoverPerplexity() {
  const isHeadless = process.env.HEADLESS !== 'false';
  console.log(`🌐 Navigating safely to Perplexity.ai (headless: ${isHeadless})...`);

  const browser = await chromium.launch({ 
    headless: isHeadless,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    locale: 'de-DE'
  });

  const page = await context.newPage();
  const docsDir = path.join(__dirname, '../docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  try {
    console.log('🔍 Loading Perplexity landing page...');
    const response = await page.goto('https://www.perplexity.ai', { waitUntil: 'commit', timeout: 15000 });
    console.log(`📡 Response status: ${response ? response.status() : 'N/A'}`);
    
    await page.waitForTimeout(4000);
    const title = await page.title();
    console.log(`✅ Page Title: "${title}"`);

    await page.screenshot({ path: path.join(docsDir, 'perplexity_guest_landing.png') });

    const discoveryReport = {
      timestamp: new Date().toISOString(),
      status: response ? response.status() : 'N/A',
      pageTitle: title,
      note: 'Cloudflare / Turnstile guest protection active.'
    };

    fs.writeFileSync(path.join(docsDir, 'perplexity-discovery.json'), JSON.stringify(discoveryReport, null, 2));
    console.log('📄 Saved discovery status to docs/perplexity-discovery.json');

  } catch (err) {
    console.error('❌ Exploration notice:', err.message);
  } finally {
    await browser.close();
  }
}

if (import.meta.main || require.main === module) {
  discoverPerplexity();
}

module.exports = { discoverPerplexity };
