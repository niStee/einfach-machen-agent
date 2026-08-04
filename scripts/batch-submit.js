const { submitWithRetry } = require('./submit-feedback');
require('dotenv').config();

const items = [
  {
    perspective: 'Privatperson',
    topic: 'Digitalisierung',
    description: 'Verwaltungsleistungen sollten ohne vorherige Registrierung im Nutzerkonto direkt nutzbar sein.',
    dryRun: true
  },
  {
    perspective: 'Unternehmen',
    topic: 'Digitalisierung',
    description: 'Automatisierte Machine-to-Machine Schnittstellen für Gewerbeanmeldungen einrichten.',
    dryRun: true
  }
];

async function runBatchSubmission(batchItems, delayMs = 120000) {
  console.log(`📦 Starting batch submission for ${batchItems.length} items (rate limit delay: ${delayMs / 1000}s)...`);

  for (let i = 0; i < batchItems.length; i++) {
    const item = batchItems[i];
    console.log(`\n----------------------------------------`);
    console.log(`Processing item ${i + 1}/${batchItems.length}: [${item.perspective}] ${item.topic}`);
    console.log(`----------------------------------------`);

    try {
      await submitWithRetry(item, 3);
      console.log(`✅ Item ${i + 1} completed.`);
    } catch (err) {
      console.error(`❌ Item ${i + 1} failed:`, err.message);
    }

    if (i < batchItems.length - 1) {
      console.log(`⏳ Rate limiting: Waiting ${delayMs / 1000}s before next submission...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  console.log('\n🎉 Batch submission processing complete!');
}

if (import.meta.main || require.main === module) {
  runBatchSubmission(items, 2000); // 2s delay for batch test
}

module.exports = { runBatchSubmission };
