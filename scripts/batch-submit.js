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

function parseCliArgs() {
  const args = process.argv.slice(2);
  let limit = null;
  let filterIds = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) {
      limit = parseInt(args[i + 1], 10);
    } else if (args[i].startsWith('--limit=')) {
      limit = parseInt(args[i].split('=')[1], 10);
    } else if (args[i] === '--ids' && args[i + 1]) {
      filterIds = args[i + 1].split(',').map(s => s.trim());
    } else if (args[i].startsWith('--ids=')) {
      filterIds = args[i].split('=')[1].split(',').map(s => s.trim());
    }
  }

  return { limit, filterIds };
}

async function runBatchSubmission(batchItems = null, delayMs = 120000) {
  let itemsToProcess = batchItems || loadFeedbackItems();
  const { limit, filterIds } = parseCliArgs();

  if (filterIds && filterIds.length > 0) {
    itemsToProcess = itemsToProcess.filter(item => filterIds.includes(item.id));
    console.log(`🎯 Filtered by IDs (${filterIds.join(', ')}): ${itemsToProcess.length} items remaining.`);
  }

  if (limit && limit > 0 && limit < itemsToProcess.length) {
    itemsToProcess = itemsToProcess.slice(0, limit);
    console.log(`⏱️ Applied limit (${limit}): ${itemsToProcess.length} items selected for this run.`);
  }

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
  const defaultDelay = process.env.BATCH_DELAY_MS ? parseInt(process.env.BATCH_DELAY_MS, 10) : 2000;
  runBatchSubmission(null, defaultDelay);
}

module.exports = { runBatchSubmission, loadFeedbackItems };
