# AGENTS.md — einfach-machen-agent

Automated API discovery and submission agent for `einfach-machen.gov.de` using Playwright-MCP and Bun.

> Primary Repo: `niStee/einfach-machen-agent` on GitHub (public) · European Union (EU) Mirror: `niStee/einfach-machen-agent` on Codeberg
> License: GNU General Public License v3.0 (GPL-3.0) · [SECURITY.md](./SECURITY.md)

## Overview

`einfach-machen-agent` is an open-source civic technology framework and MCP server designed for administrative feedback and bureaucracy reduction proposal automation.

## Quick Reference

| Action | Command | Notes |
|--------|---------|-------|
| **Start MCP Server** | `bun run start-mcp` | Starts Playwright MCP Server on port 3550 |
| **Discover API** | `bun run discover` | Scans TYPO3 FormFramework structure & anti-bot tokens |
| **Submit Feedback** | `bun run submit` | Runs single feedback proposal submission (`dryRun` mode) |
| **Submit Digital Markets Act (DMA) Complaint** | `bun run submit:dma` | Dry run default; live requires `--live`, `--message-file`, full CLI identity and `--confirm <fingerprint>` |
| **Batch Process** | `bun run batch` | Runs rate-limited batch submission engine |
| **Run Tests** | `bun test` | Runs Bun test pyramid & MCP contract tests |

## Development Rules

1. **Bun Exclusive**: Use Bun (`bun`) exclusively as JS runtime and package manager. No npm/pnpm.
2. **KISS & TDI**: Write failing unit tests first (`tests/`), implement minimal logic, and verify clean test runs before completion.
3. **Dry-Run Protection**: Scripts must default to `dryRun: true` during development.
4. **Git Identity**: Ensure repository-specific git identity overrides are configured (`user.name "niStee"`).
5. **No Direct Main Pushes**: Always use feature branches (`feat/...`, `fix/...`) and Pull Requests.

## DMA Live Safeguards

- Dry run is the default. Its built-in text is an unreviewed sample and its placeholder identity must produce a clear notice; a live run needs the documented confirmation and identity safeguards below.
- For a reviewed payload, pass `--message-file FILE`; use the dry-run fingerprint with `--confirm` only when every payload field is unchanged.
- Live mode requires `--live`, the exact `--confirm <fingerprint>`, and non-placeholder `--first-name`, `--last-name`, and `--email` arguments. Identity environment fallbacks are not supported.
- A live attempt within 24 hours of the last recorded attempt is refused. This is a repository anti-duplication rule, not a statutory period.
- HTTP 429, HTTP 503, and CAPTCHA responses abort with an audit screenshot, no retry, and no challenge handling. Preserve any `Retry-After` value in the result.
- Live results append to `logs/dma-submissions.json`; last-live state and screenshots also stay under the gitignored `logs/` directory. Test selector changes against the synthetic offline fixture before any remote dry run.

## Repository topology
- canonical: GitHub (niStee/einfach-machen-agent) — all changes land via PR to main
- mirror: Codeberg (codeberg.org/niStee/einfach-machen-agent) — automated push mirror via
  .github/workflows/mirror-codeberg.yml; receives main + tags only
- never push directly to main; never push to Codeberg directly
- tags are immutable once pushed; never rewrite or delete a mirrored tag
- mirror repair path: re-run the workflow (workflow_dispatch), not local
  pushes
- operations runbook: maintainer-operated Codeberg mirror recovery; re-run the
  mirror workflow rather than pushing locally
## Auto-merge policy

Follow this repository's review and branch-protection requirements. Agents do not merge without explicit maintainer approval.
