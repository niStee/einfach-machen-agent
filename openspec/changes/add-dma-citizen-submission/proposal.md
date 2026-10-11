# Proposal: Add EU DMA Citizen Submission Capability

## Why

Consumers experiencing technical lock-in or circumvention of digital rights by gatekeepers (e.g. Google using Play Integrity API remote attestation to render third-party OSes and alternative app distribution channels unusable for everyday services like Ryde) require a reliable, automated civic submission path to the European Commission's Digital Markets Act (DMA) citizen contact portal (`https://digital-markets-act.ec.europa.eu/contact-us-eu-citizen_en`).

Expanding `einfach-machen-agent` from federal German bureaucracy reduction (`einfach-machen.gov.de`) into European regulatory enforcement establishes a unified, scriptable civic automation framework for end-users.

## What Changes

- Dedicated DMA complaint submission module (`scripts/submit-dma.ts`) using Playwright with window offscreening.
- Pre-filled compliant report documenting circumvention of DMA Articles 6(4) and 6(7) via Google Play Integrity API.
- Form field constraint validation (Subject <= 100 chars, Message <= 2,000 chars, valid email).
- Safe dry-run default mode (`bun run submit:dma`) with full-page audit screenshot capture (`logs/dma-dryrun-*.png`).
- Explicit `--live` flag for actual submission to the European Commission DMA team.
- Automated test suite (`tests/dma.test.ts`) covering positive/negative validation pairs and sensitivity probes.
- Repository documentation updates in `AGENTS.md` and `README.md`.

## Capabilities

### New Capabilities
- `dma-citizen-submission`: Automated validation, offscreen form filling, and submission of citizen feedback to the European Commission Digital Markets Act team.

### Modified Capabilities
None.

## Impact

- Extends `einfach-machen-agent` CLI commands with `submit:dma`.
- Zero disruption to existing `einfach-machen.gov.de` TYPO3 submission pipelines.
- All actions remain non-destructive and default to dry-run protection.
