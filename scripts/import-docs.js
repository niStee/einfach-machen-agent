const fs = require('fs');
const path = require('path');

/**
 * Decoupled & security-sanitized documentation importer:
 * Pulls strictly relevant, public-safe research markdown files from perplexity-agent exports into local docs/perplexity.
 */
function importDocs() {
  const homeDir = process.env.HOME || '/home/nils';
  const sourceDir = path.join(homeDir, 'Projects/perplexity-agent/exports/categorized/einfach-machen');
  const targetDir = path.join(__dirname, '../docs/perplexity');

  if (!fs.existsSync(sourceDir)) {
    console.log(`ℹ️ Source export directory not found: ${sourceDir}`);
    return;
  }

  // Clear existing target dir to avoid stale or sensitive files
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }
  fs.mkdirSync(targetDir, { recursive: true });

  const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.md'));
  let importedCount = 0;

  // Allowed public proposal keywords
  const publicKeywords = ['einfach-machen', 'bürgerantrag', 'typo3', 'elster', 'bundid', 'spendenbescheinigung', 'fahrgastrechte'];

  for (const file of files) {
    const srcFile = path.join(sourceDir, file);
    let content = fs.readFileSync(srcFile, 'utf8');

    // Skip files containing obvious private booking or personal email data
    if (content.includes('mozmail.com') || content.includes('Order number') || content.includes('Flexpreis')) {
      console.log(`🛡️ Skipping sensitive file: ${file}`);
      continue;
    }

    const lowerContent = content.toLowerCase();
    const isPublicRelevant = publicKeywords.some(kw => lowerContent.includes(kw));

    if (isPublicRelevant) {
      // Sanitize any remaining personal email patterns
      content = content.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]');
      
      const destFile = path.join(targetDir, file);
      fs.writeFileSync(destFile, content, 'utf8');
      importedCount++;
    }
  }

  console.log(`✅ Successfully imported ${importedCount} public-sanitized research documents into ${targetDir}`);
}

if (import.meta.main || require.main === module) {
  importDocs();
}

module.exports = { importDocs };
