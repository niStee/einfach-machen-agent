# EinfachMachen Agent

Automated API discovery and submission framework for [einfach-machen.gov.de](https://einfach-machen.gov.de/) using Playwright-MCP and Bun.

> **AGENTS.md Compliant**: Built exclusively using Bun, git identity overrides, and structured project paths under `~/Projects/einfach-machen-agent`.

## Features

- 🔍 **API & Form Discovery**: Deep inspection of TYPO3 FormFramework structures & anti-bot protection (`FormCrShield`).
- 📝 **Automated Submission**: Multi-step browser automation using Playwright with `dryRun` protection mode.
- 🛡️ **Resilience & Security**: Dynamic honeypot field detection, exponential retries, and structured JSON logging.
- 📦 **Batch Submission Engine**: Automated batch processing for feedback proposals with rate limiting.

## Quick Start

1. **Setup dependencies**:
   ```bash
   cd ~/Projects/einfach-machen-agent
   bun install
   bunx playwright install chromium
   ```

2. **Start MCP server**:
   ```bash
   bun run start-mcp
   ```

3. **Discover APIs & Form Structure**:
   ```bash
   bun run discover
   ```

4. **Test Feedback Submission (Dry-Run Mode)**:
   ```bash
   bun run submit
   ```

5. **Run Batch Submissions**:
   ```bash
   bun run batch
   ```

## Responsible Civic Tech Use & Ethics ⚖️

This repository is designed for legitimate civic technology research, administrative feedback, and open-government automation:

- 🛡️ **Rate Limiting**: Always enforce conservative rate limiting (minimum 2 minutes between requests) to prevent server load.
- 🔐 **Privacy & GDPR**: Do not include personal identifiable information (PII) or sensitive personal data in submission payloads.
- 📜 **Legitimate Use**: Only submit constructive, genuine proposals for bureaucracy reduction. Do not use this framework for spamming or flooding public portals.
- 🧪 **Dry-Run Default**: All scripts default to `dryRun: true` to prevent unintended submissions during testing.

## License

MIT
