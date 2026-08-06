# EinfachMachen Agent

Automated API discovery and submission framework for [einfach-machen.gov.de](https://einfach-machen.gov.de/) using Playwright-MCP and Bun.

> **[AGENTS.md](./AGENTS.md) Compliant**: Built exclusively using Bun, git identity overrides, and structured project paths under `~/Projects/einfach-machen-agent`.

## Features

- 🔍 **API & Form Discovery**: Deep inspection of TYPO3 FormFramework structures & anti-bot protection (`FormCrShield`).
- 📝 **Automated Submission**: Multi-step browser automation using Playwright with `dryRun` protection mode.
- 🖥️ **Offscreen Minimized Browsing**: Non-headless execution with window offscreening (`--window-position=-32000,-32000`) to prevent desktop focus interruption.
- 📦 **Batch Submission Engine**: Automated batch processing for feedback proposals with rate limiting.
- 📊 **21/21 Proposals Audit**: Complete documentation & archive of 21 submitted civic tech proposals ([Submission Report](./docs/submission-report.md)).

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

## Completed Submissions Audit (21 Proposals)

Full audit log and OZG 2.0 evaluation available in [`docs/submission-report.md`](./docs/submission-report.md).

Key highlights:
- 🏆 **Proposal 01**: Public Issue-Tracker & FOSS development for `einfach-machen.gov.de`
- 🏆 **Proposal 02**: 10-Year persistent document archive in Mein ELSTER
- 🏆 **Proposal 03**: Open Source compliance & Microsoft 365 cloud lock-in exit (Bavarian Digital Law)
- 🏆 **Proposal 04**: Open API for volunteer association management software ↔ ELSTER
- 🏆 **Proposal 12**: Real-time legislative synopses & lobby statement register (§ 42 GGO)

## Responsible Civic Tech Use & Ethics ⚖️

This repository is designed for legitimate civic technology research, administrative feedback, and open-government automation:

- 🛡️ **Rate Limiting**: Always enforce conservative rate limiting to prevent server load.
- 🔐 **Privacy & GDPR**: Do not include personal identifiable information (PII) or sensitive personal data in submission payloads.
- 📜 **Legitimate Use**: Only submit constructive, genuine proposals for bureaucracy reduction.
- 🧪 **Dry-Run Default**: All scripts default to `dryRun: true` to prevent unintended submissions during testing.

## License

MIT
