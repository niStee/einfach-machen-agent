# AGENTS.md — einfach-machen-agent

Automated API discovery and submission agent for `einfach-machen.gov.de` using Playwright-MCP and Bun.

> Parent: [~/Projects/AGENTS.md](../AGENTS.md) — environment-wide project index.

## Overview

`einfach-machen-agent` is an open-source civic technology framework and MCP server designed for administrative feedback and bureaucracy reduction proposal automation.

## Quick Reference

| Action | Command | Notes |
|--------|---------|-------|
| **Start MCP Server** | `bun run start-mcp` | Starts Playwright MCP Server on port 3550 |
| **Discover API** | `bun run discover` | Scans TYPO3 FormFramework structure & anti-bot tokens |
| **Submit Feedback** | `bun run submit` | Runs single feedback proposal submission (`dryRun` mode) |
| **Batch Process** | `bun run batch` | Runs rate-limited batch submission engine |
| **Run Tests** | `bun test` | Runs Bun test pyramid & MCP contract tests |

## Development Rules

1. **Bun Exclusive**: Use Bun (`bun`) exclusively as JS runtime and package manager. No npm/pnpm.
2. **KISS & TDI**: Write failing unit tests first (`tests/`), implement minimal logic, and verify clean test runs before completion.
3. **Dry-Run Protection**: Scripts must default to `dryRun: true` during development.
4. **Git Identity**: Ensure repository-specific git identity overrides are configured (`user.name "niStee"`).
5. **No Direct Main Pushes**: Always use feature branches (`feat/...`, `fix/...`) and Pull Requests.
