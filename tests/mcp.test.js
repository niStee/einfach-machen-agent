import { describe, expect, test } from 'bun:test';
import fs from 'fs';
import path from 'path';

describe('MCP Server Contract & Capability Audit (August 2026 Standard)', () => {
  test('package.json defines valid MCP start command and dependencies', () => {
    const pkgPath = path.join(__dirname, '../package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

    expect(pkg.scripts['start-mcp']).toBeDefined();
    expect(pkg.scripts['start-mcp']).toContain('playwright-mcp-server');
    expect(pkg.dependencies['@executeautomation/playwright-mcp-server']).toBeDefined();
  });

  test('Form submission prompt schemas and API docs adhere to MCP tool definitions', () => {
    const promptPath = path.join(__dirname, '../prompts/submission.md');
    const apiDocPath = path.join(__dirname, '../docs/api-endpoints.md');

    expect(fs.existsSync(promptPath)).toBe(true);
    expect(fs.existsSync(apiDocPath)).toBe(true);

    const promptText = fs.readFileSync(promptPath, 'utf8');
    const apiDocText = fs.readFileSync(apiDocPath, 'utf8');

    expect(promptText).toContain('einfach-machen.gov.de');
    expect(apiDocText).toContain('tx_form_formframework');
  });
});
