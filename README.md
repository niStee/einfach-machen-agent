# EinfachMachen Agent

<p align="left">
  <a href="https://github.com/niStee/einfach-machen-agent/releases"><img src="https://img.shields.io/github/v/release/niStee/einfach-machen-agent?style=flat&logo=github&color=blue" alt="Latest Release"></a>
  <a href="https://github.com/niStee/einfach-machen-agent/actions/workflows/ci.yml"><img src="https://github.com/niStee/einfach-machen-agent/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI Pipeline"></a>
  <a href="https://scorecard.dev/viewer/?uri=github.com/niStee/einfach-machen-agent"><img src="https://api.scorecard.dev/projects/github.com/niStee/einfach-machen-agent/badge" alt="OpenSSF Scorecard"></a>
  <a href="https://github.com/niStee/einfach-machen-agent/actions/workflows/codeql.yml"><img src="https://github.com/niStee/einfach-machen-agent/actions/workflows/codeql.yml/badge.svg?branch=main" alt="CodeQL SAST"></a>
  <a href="https://bun.sh"><img src="https://img.shields.io/badge/Runtime-Bun%20v1.3+-fbf0df?style=flat&logo=bun&logoColor=black" alt="Bun Runtime"></a>
  <a href="https://modelcontextprotocol.io/"><img src="https://img.shields.io/badge/Protocol-MCP-4B32C3?style=flat&logo=anthropic&logoColor=white" alt="Model Context Protocol"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-GPL--3.0-blue.svg?style=flat" alt="License: GPL-3.0"></a>
</p>

Automated API discovery and submission framework for [einfach-machen.gov.de](https://einfach-machen.gov.de/) using Playwright-MCP and Bun.

> **[AGENTS.md](./AGENTS.md) Compliant**: Built exclusively using Bun with repository-specific git identity overrides.

## Features

- 🔍 **API & Form Discovery**: Deep inspection of TYPO3 FormFramework structures & anti-bot protection (`FormCrShield`).
- 📝 **Automated Submission**: Multi-step browser automation using Playwright with `dryRun` protection mode.
- 🖥️ **Offscreen Minimized Browsing**: Non-headless execution with window offscreening (`--window-position=-32000,-32000`) to prevent desktop focus interruption.
- 📦 **Batch Submission Engine**: Automated batch processing for feedback proposals with rate limiting.
- 📊 **21/21 Proposals Audit**: Complete documentation & archive of 21 submitted civic tech proposals ([Submission Report](./docs/submission-report.md)).

## Quick Start

1. **Setup dependencies**:
   ```bash
   cd einfach-machen-agent
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

5. **Test DMA Citizen Complaint Submission (Dry-Run Mode)**:
   ```bash
   bun run submit:dma
   ```
   Dry run is always the default. It prints the fingerprint of the exact payload. When placeholders are used, it prints a `PLACEHOLDER IDENTITY` notice; the built-in complaint text is clearly labelled as an unreviewed sample.

   To prepare a live submission, put text you have personally reviewed in a file and dry-run that exact payload:
   ```bash
   bun run submit:dma \
     --first-name '<legal-first-name>' \
     --last-name '<legal-last-name>' \
     --email '<reply-address>' \
     --message-file ./complaint.txt
   ```
   Then repeat the same arguments with `--live` and the fingerprint printed by that dry run:
   ```bash
   bun run submit:dma --live \
     --first-name '<legal-first-name>' \
     --last-name '<legal-last-name>' \
     --email '<reply-address>' \
     --message-file ./complaint.txt \
     --confirm '<12-character-payload-fingerprint>'
   ```
   Live mode refuses missing or placeholder identity values, a missing message file, and a missing or stale confirmation. Changing any identity, topic, subject, or message field requires a new dry run and fingerprint. There are no `DMA_*` environment-variable identity fallbacks.

   A live attempt is also refused within 24 hours of the last recorded live attempt. This cooldown is the repository's own anti-duplication rule, not a statutory period. Live results append one JSON line to `logs/dma-submissions.json`, and the cooldown state is stored under `logs/`; that directory is gitignored. HTTP 429, HTTP 503, and CAPTCHA responses stop immediately with an audit screenshot and no retry or CAPTCHA handling. A retained `Retry-After` value is included in the result.

6. **Run Batch Submissions**:
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
