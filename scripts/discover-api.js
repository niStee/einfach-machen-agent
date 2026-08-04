const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function discoverAPIs() {
  const isHeadless = process.env.HEADLESS !== 'false';
  const targetUrl = process.env.TARGET_URL || 'https://einfach-machen.gov.de/meldeformular';

  console.log(`🚀 Launching Playwright browser (headless: ${isHeadless})...`);
  const browser = await chromium.launch({ headless: isHeadless });
  const context = await browser.newContext();
  const page = await context.newPage();

  const apiCalls = [];

  // Intercept and record network requests & responses
  page.on('request', request => {
    const url = request.url();
    const resourceType = request.resourceType();
    if (['xhr', 'fetch'].includes(resourceType) || url.includes('api') || url.includes('feedback') || url.includes('submit')) {
      apiCalls.push({
        url: url,
        method: request.method(),
        headers: request.headers(),
        postData: request.postData(),
        resourceType: resourceType,
        timestamp: new Date().toISOString()
      });
    }
  });

  try {
    console.log(`🔍 Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });

    console.log('✅ Page loaded successfully');
    
    // Create docs folder if missing
    const docsDir = path.join(__dirname, '../docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    // Save initial screenshot & state documentation
    await page.screenshot({ path: path.join(docsDir, 'initial_form_page.png'), fullPage: true });

    // Document findings
    const docs = {
      discoveredAt: new Date().toISOString(),
      targetUrl: targetUrl,
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
    console.error('❌ Discovery failed:', error);
  } finally {
    await browser.close();
  }
}

function generateMarkdownDocs(docs) {
  return `# API Endpoints Discovery

**Discovered:** ${docs.discoveredAt}  
**Target URL:** \`${docs.targetUrl}\`  
**Total Captured Requests:** ${docs.totalCallsCaptured}  

## Discovered Submission Endpoints

${docs.formSubmission ? `
**URL:** \`${docs.formSubmission.url}\`  
**Method:** \`${docs.formSubmission.method}\`  
**Resource Type:** \`${docs.formSubmission.resourceType}\`  
**Payload:** \`${docs.formSubmission.postData || 'N/A'}\`
` : 'No direct form submission endpoint captured during initial load.'}

## All Captured Endpoints (XHR/Fetch/API)

${docs.endpoints.length > 0 ? docs.endpoints.map(call => `
### ${call.method} \`${call.url}\`
- **Resource Type:** ${call.resourceType}
- **Timestamp:** ${call.timestamp}
- **Data Payload:** \`${call.postData || 'None'}\`
`).join('\n') : '*No API endpoints recorded during initial crawl.*'}
`;
}

if (import.meta.main || require.main === module) {
  discoverAPIs();
}

module.exports = { discoverAPIs };
