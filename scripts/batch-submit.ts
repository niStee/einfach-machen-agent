import fs from 'fs';
import path from 'path';
import { submitFeedback, FeedbackPayload, SubmissionResult } from './submit-feedback.ts';

export interface BatchSummary {
  totalProcessed: number;
  successful: number;
  failed: number;
  results: SubmissionResult[];
}

/**
 * Batch submits feedback proposals from data/feedbacks.json.
 */
export async function batchSubmit(dryRun: boolean = true): Promise<BatchSummary> {
  const dataPath = path.join(__dirname, '../data/feedbacks.json');
  if (!fs.existsSync(dataPath)) {
    console.error('❌ Data file not found: data/feedbacks.json');
    return { totalProcessed: 0, successful: 0, failed: 0, results: [] };
  }

  const proposals: FeedbackPayload[] = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log(`📦 Starting Batch Processing for ${proposals.length} proposals (dryRun: ${dryRun})...\n`);

  const results: SubmissionResult[] = [];
  let successful = 0;
  let failed = 0;

  for (let i = 0; i < proposals.length; i++) {
    const item = proposals[i];
    console.log(`[${i + 1}/${proposals.length}] Processing proposal: "${(item.title || item.description).slice(0, 50)}..."`);

    const result = await submitFeedback(item, { dryRun });
    results.push(result);

    if (result.success) {
      successful++;
    } else {
      failed++;
    }
  }

  console.log(`\n🎉 Batch processing complete! ${successful} succeeded, ${failed} failed.`);
  return {
    totalProcessed: proposals.length,
    successful,
    failed,
    results
  };
}

if (import.meta.main) {
  const isLive = process.argv.includes('--live');
  batchSubmit(!isLive);
}
