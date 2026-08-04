const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function discoverAPIs() {
  const isHeadless = process.env.HEADLESS !== 'false';
  const targetUrl = process.env.TARGET_URL || 'https://einfach-machen.gov.de/meldeformular';

  console.log(`🚀 Starting full form walk-through & API discovery (headless: ${isHeadless})...`);
  const browser = await chromium.launch({ headless: isHeadless });
  const context = await browser.newContext();
  const page = await context.newPage();

  const apiCalls = [];

  page.on('request', request => {
    const url = request.url();
    const method = request.method();
    if (method === 'POST' || url.includes('tx_form_formframework')) {
      apiCalls.push({
        url: url,
        method: method,
        headers: request.headers(),
        postData: request.postData(),
        resourceType: request.resourceType(),
        timestamp: new Date().toISOString()
      });
      console.log(`📡 Captured Request: ${method} ${url}`);
    }
  });

  const docsDir = path.join(__dirname, '../docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  try {
    console.log(`🔍 Step 1: Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: path.join(docsDir, 'step1_perspective.png'), fullPage: true });

    // Step 1: Select Perspective using label or locator check
    console.log('👆 Step 1: Selecting Privatperson...');
    const perspectiveInput = page.locator('input[value="Privatperson"]');
    if (await perspectiveInput.count() > 0) {
      await perspectiveInput.check({ force: true });
    } else {
      await page.check('input[type="radio"]', { force: true });
    }
    await page.click('button[type="submit"]:has-text("Weiter zur Themenauswahl")');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(docsDir, 'step2_topic.png'), fullPage: true });

    // Step 2: Topic Selection
    console.log('👆 Step 2: Selecting Topic...');
    const firstTopicRadio = page.locator('input[type="radio"]').first();
    if (await firstTopicRadio.count() > 0) {
      await firstTopicRadio.check({ force: true });
    }
    const nextButtonsStep2 = page.locator('button[type="submit"]');
    await nextButtonsStep2.last().click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(docsDir, 'step3_description.png'), fullPage: true });

    // Step 3: Description Fill
    console.log('✍️ Step 3: Filling Description...');
    const textarea = page.locator('textarea');
    if (await textarea.count() > 0) {
      await textarea.fill('Automated API Discovery Test: Testing public endpoints and TYPO3 form structure.');
    }
    const nextButtonsStep3 = page.locator('button[type="submit"]');
    await nextButtonsStep3.last().click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(docsDir, 'step4_authority.png'), fullPage: true });

    console.log('✅ Multi-step form walk completed successfully!');

    // Document findings
    const docs = {
      discoveredAt: new Date().toISOString(),
      targetUrl: targetUrl,
      architecture: 'TYPO3 FormFramework (Server-Rendered Multi-Step Form with CSRF & FormCrShield anti-bot tokens)',
      totalCallsCaptured: apiCalls.length,
      endpoints: apiCalls,
      formSubmission: apiCalls.find(call => call.method === 'POST') || null
    };

    fs.writeFileSync(path.join(docsDir, 'api-discovery.json'), JSON.stringify(docs, null, 2));
    console.log('📄 API documentation saved to docs/api-discovery.json');

    const markdown = generateMarkdownDocs(docs);
    fs.writeFileSync(path.join(docsDir, 'api-endpoints.md'), markdown);
    console.log('📝 Markdown documentation saved to docs/api-endpoints.md');

  } catch (error) {
    console.error('❌ Discovery walk failed:', error);
  } finally {
    await browser.close();
  }
}

function generateMarkdownDocs(docs) {
  return `# API Endpoints & Form Structure Discovery

**Discovered:** ${docs.discoveredAt}  
**Target URL:** \`${docs.targetUrl}\`  
**Architecture:** ${docs.architecture}  
**Total Captured POST Calls:** ${docs.totalCallsCaptured}  

## Technical Architecture Analysis

- **System:** TYPO3 Form Framework (\`tx_form_formframework\`)
- **Submission Type:** Multi-step HTML POST form (\`multipart/form-urlencoded\` / \`application/x-www-form-urlencoded\`)
- **Security & Anti-Bot Protections:**
  - HMAC signed state tokens (\`__state\`)
  - Signed trusted properties hash (\`__trustedProperties\`)
  - Dynamic Challenge-Response Honeypot Shield (\`cr-field\` via \`FormCrShield.js\`)
  - Session-bound hidden honeypot fields

## Captured Form Submission Requests

${docs.endpoints.map((call, idx) => `
### Request ${idx + 1}: ${call.method} \`${call.url}\`
- **Resource Type:** \`${call.resourceType}\`
- **Content-Type:** \`${call.headers['content-type'] || 'N/A'}\`
- **Payload Data:**
\`\`\`
${call.postData || 'None'}
\`\`\`
`).join('\n')}
`;
}

if (import.meta.main || require.main === module) {
  discoverAPIs();
}

module.exports = { discoverAPIs };
