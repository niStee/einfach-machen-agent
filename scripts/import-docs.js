const fs = require('fs');
const path = require('path');

/**
 * Decoupled documentation importer:
 * Pulls relevant research markdown files from perplexity-agent exports into local docs/perplexity.
 */
function importDocs() {
  const homeDir = process.env.HOME || '/home/nils';
  const sourceDir = path.join(homeDir, 'Projects/perplexity-agent/exports/categorized/einfach-machen');
  const targetDir = path.join(__dirname, '../docs/perplexity');

  if (!fs.existsSync(sourceDir)) {
    console.log(`ℹ️ Source export directory not found: ${sourceDir}`);
    return;
  }

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.md'));
  let importedCount = 0;

  for (const file of files) {
    const srcFile = path.join(sourceDir, file);
    const destFile = path.join(targetDir, file);
    fs.copyFileSync(srcFile, destFile);
    importedCount++;
  }

  console.log(`✅ Successfully imported ${importedCount} research documents into ${targetDir}`);
}

if (import.meta.main || require.main === module) {
  importDocs();
}

module.exports = { importDocs };
