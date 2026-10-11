# ADR-001: Civic Contact Identity and Email Relay Strategy

- **Status**: Proposed
- **Date**: 2026-10-11
- **Context**: Automated civic participation and complaint filing (einfach-machen.gov.de, EU Digital Markets Act portal)

---

## Context and Problem Statement

Automated civic engagement agents submit inquiries, proposals, and regulatory complaints to public authorities and institutional portals (e.g. European Commission DMA Citizen Portal, TYPO3 FormFramework). These portals mandate a verified email address to acknowledge receipt and return formal case numbers or follow-ups.

Directly exposing an operator's primary personal email address creates tracking risks, data harvesting vulnerabilities, and potential spam exposure. Operators require an email privacy and masking strategy that balances deliverability, anonymity, operational simplicity, and reply routing.

Two distinct relay architectures have been proposed:
1. **Custom Subdomain Relay Mask** (e.g. `<purpose>@<user-subdomain>.mozmail.com` via Mozilla Relay Premium / custom domain routing).
2. **Random Pseudonymous Relay Pool** (e.g. `<random-id>@mozmail.com` via Mozilla Relay API or pre-allocated pool with deduplication).

---

## Decision Drivers

- **Anonymity & PII Protection**: Preventing correlation between the operator's real identity/surname and the submission.
- **Operational Complexity**: Ease of automation without requiring interactive browser sessions or secret API tokens.
- **Deduplication & Collision Prevention**: Ensuring case tracking remains deterministic across multiple filings.
- **Reply Routing & Longevity**: Ability for European Commission case officers to reply to the submitter and receive legitimate follow-ups.
- **Rate-Limiting & Domain Reputation**: Ensuring civic forms do not block or flag the sender domain.

---

## Considered Options

### Option 1: Custom Subdomain Relay Mask (`<purpose>@<subdomain>.mozmail.com`)

In this model, the operator uses a custom relay domain or subdomain (such as Mozilla Relay Premium or a personal domain with catch-all/wildcard routing). Any prefix matching the specific civic submission (e.g. `dma@<subdomain>.mozmail.com`, `kartell@<subdomain>.mozmail.com`) is generated on-the-fly and routes automatically to the destination inbox.

* **Pros**:
  * **Zero API Dependency**: Aliases are synthesized deterministically at runtime; no network calls or API tokens required to provision an address before submitting.
  * **Deterministic Deduplication**: Aliases map directly to the case topic or regulatory scope, making email filtering and archiving straightforward.
  * **Persistent Inbound Routing**: Institutional replies route through the existing relay configuration without manual mask management.
  * **Easy Revocation**: If a specific alias is ever harvested or spammed, the individual alias can be disabled or blocked in the relay control panel.
* **Cons**:
  * **Partial PII Exposure**: If the operator's custom subdomain reflects their surname (e.g. `<lastname>.mozmail.com`), institutional case workers or database logs can still infer the submitter's identity.

---

### Option 2: Random Pseudonymous Relay Pool with Deduplication (`<random-id>@mozmail.com`)

In this model, the agent integrates with the Mozilla Relay API (or consumes a pre-allocated, local SQLite/JSON pool of random relay masks like `x7k9p2a@mozmail.com`). A unique, random address is assigned per regulatory body or filing campaign and persisted locally in an audit ledger to ensure deduplication.

* **Pros**:
  * **Full Anonymity**: Neither the local part nor the domain reveals the operator's real name or family identity.
  * **High Domain Trust**: `mozmail.com` is a widely recognized, deliverable consumer relay service that bypasses typical disposable-email blocklists.
  * **Compartmentalized Blast Radius**: A leaked or targeted submission exposes only an ephemeral hash with no relation to other civic submissions.
* **Cons**:
  * **API / Credential Overhead**: Generating masks programmatically requires interacting with Mozilla Relay endpoints or maintaining a pre-generated key pool.
  * **State Management**: Requires local ledger state (`data/relay-aliases.json`) to track which mask corresponds to which regulatory case number for deduplication.
  * **Quota Limits**: Free/standard tier accounts have mask creation caps (e.g. 5 masks on free tier; unlimited on premium, but subject to rate limits).

---

## Architectural Comparison Matrix

| Evaluation Dimension | Option 1: Subdomain Relay (`<slug>@<subdomain>.mozmail.com`) | Option 2: Random Relay Pool (`<hash>@mozmail.com`) |
|---|---|---|
| **Identity Obfuscation** | Moderate (hides primary inbox, may reveal surname domain) | High (complete pseudonymity, random hash) |
| **Automation Overhead** | None (purely client-side string synthesis) | Medium (requires API call or pre-allocated pool ledger) |
| **Deduplication Strategy** | Built-in by semantic convention (`dma@...`, `ozg@...`) | Requires local ledger mapping (`campaign_id -> mask`) |
| **Institutional Reply Path** | High reliability (permanent forwarder) | High reliability (managed by Relay backend) |
| **Secret Storage Required** | None | Relay API token / Session cookie |

---

## Recommendation and Phased Strategy

1. **Phase 1 (Immediate / Pragmatic)**:
   Use **Option 1** (`dma@<subdomain>.mozmail.com`) for direct civic and regulatory filings where the operator is filing under their legal name (as the European Commission DMA Citizen form explicitly requests First and Last Name). Semantic aliases allow clean inbox separation with zero external moving parts.

2. **Phase 2 (Whistleblower & Anonymous Submissions)**:
   When expanding the framework to whistleblower portals or anonymous feedback paths where identity must remain entirely confidential:
   * Implement an automated Mozilla Relay client (`scripts/relay-manager.ts`).
   * Maintain a deduplicated local state ledger in `data/relay-pool.json`.
   * Automatically allocate a random `<hash>@mozmail.com` forwarder per submission batch.
