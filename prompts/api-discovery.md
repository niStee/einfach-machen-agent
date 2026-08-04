# API DISCOVERY AGENT PROMPT

You are exploring `einfach-machen.gov.de` to discover public API endpoints for automated feedback submission.

## CONTEXT
- Repository: `einfach-machen-agent`
- Location: `~/Projects/einfach-machen-agent`
- Target: `https://einfach-machen.gov.de/meldeformular`
- JS Runtime: Bun (`bun`, `bunx`)
- Tools: Playwright-MCP, Bun

## PROCESS

### Step 1: Repository Verification
```bash
cd ~/Projects/einfach-machen-agent
bun install
```

### Step 2: API Discovery
```bash
bun run discover
```

### Step 3: Documentation Review
- Inspect `docs/api-discovery.json`
- Review `docs/api-endpoints.md`

## SUCCESS CRITERIA
✅ Public API endpoints discovered  
✅ Direct submission workflow documented  
✅ Bun-compliant execution  
