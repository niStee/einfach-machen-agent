const { submitWithRetry } = require('./submit-feedback');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

function loadFeedbackItems() {
  const dataPath = path.join(__dirname, '../data/feedbacks.json');
  if (fs.existsSync(dataPath)) {
    try {
      const raw = fs.readFileSync(dataPath, 'utf-8');
      return JSON.parse(raw);
    } catch (e) {
      console.warn('⚠️ Could not parse data/feedbacks.json, using fallback sample items.');
    }
  }

  return [
    {
      perspective: 'Privatperson',
      topic: 'Digitalisierung',
      description: 'Verwaltungsleistungen sollten ohne vorherige Registrierung im Nutzerkonto direkt nutzbar sein.',
      dryRun: true
    }
  ];
}

async function runBatchSubmission(batchItems = null, delayMs = 120000) {
  const itemsToProcess = batchItems || loadFeedbackItems();
  console.log(`📦 Starting batch submission for ${itemsToProcess.length} items (rate limit delay: ${delayMs / 1000}s)...`);

  for (let i = 0; i < itemsToProcess.length; i++) {
    const item = itemsToProcess[i];
    console.log(`\n----------------------------------------`);
    console.log(`Processing item ${i + 1}/${itemsToProcess.length}: [${item.perspective}] ${item.title || item.topic}`);
    console.log(`----------------------------------------`);

    try {
      await submitWithRetry(item, 3);
      console.log(`✅ Item ${i + 1} completed.`);
    } catch (err) {
      console.error(`❌ Item ${i + 1} failed:`, err.message);
    }

    if (i < itemsToProcess.length - 1) {
      console.log(`⏳ Rate limiting: Waiting ${delayMs / 1000}s before next submission...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  console.log('\n🎉 Batch submission processing complete!');
}

if (import.meta.main || require.main === module) {
  runBatchSubmission(null, process.env.BATCH_DELAY_MS ? parseInt(process.env.BATCH_DELAY_MS, 10) : 2000);
}

module.exports = { runBatchSubmission, loadFeedbackItems };
