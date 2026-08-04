# EinfachMachen Agent

Automated API discovery and submission for [einfach-machen.gov.de](https://einfach-machen.gov.de/) using Playwright-MCP and Bun.

> **AGENTS.md Compliant**: Built exclusively using Bun, git identity overrides, and structured project paths under `~/Projects/einfach-machen-agent`.

## Features

- 🔍 **API Discovery**: Automatically discover public API endpoints
- 📝 **Direct Submission**: Submit feedback without browser dependency
- 📊 **Payload Analysis**: Document API structures and headers
- ⚡ **Bun Powered**: Fast script execution & MCP server integration

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

3. **Discover APIs**:
   ```bash
   bun run discover
   ```

4. **Submit feedback**:
   ```bash
   bun run submit
   ```

## License

MIT
