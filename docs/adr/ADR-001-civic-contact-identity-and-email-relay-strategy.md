# ADR-001: Civic Contact Identity, Email Relay, and Anti-Spam Strategy

- **Status**: Proposed
- **Date**: 2026-10-11
- **Governing Standard**: `ai-infra` ADR-023 (Civic contact identity, email relay, and public endpoint anti-spam governance)
- **Context**: Automated civic participation and regulatory complaint filing (`einfach-machen.gov.de`, European Commission Digital Markets Act portal)
- **Standards**: RFC 9110 (HTTP Semantics, 2022), RFC 9309 (Robots Exclusion, 2022),
  RFC 8617 (ARC Protocol, 2019), RFC 7489 (DMARC, 2015 / DMARCbis 2026),
  RFC 5322 (Internet Message Format, 2008), OWASP OAT-014 / OAT-015 (Automated Threats, 2026)

---

## Context and Problem Statement

Automated civic engagement agents submit inquiries, proposals, and regulatory complaints to public authorities and institutional web portals (e.g. European Commission DMA Citizen Portal, TYPO3 FormFramework on `einfach-machen.gov.de`). These portals mandate a verified return email address (RFC 5322) to acknowledge receipt and return formal case numbers.

Exposing an operator's primary personal email address creates tracking risks, cross-agency data correlation, and exposure to public records disclosures (e.g. IFG / Freedom of Information requests). Conversely, poorly bounded browser automation risks flooding public endpoints, violating Europa Web Guide abuse guidelines and OWASP OAT-014 (Automated Submissions).

### Anti-Patterns Remediated in this Record

In accordance with Michael Nygard (2011) and ThoughtWorks ADR guidelines, this record addresses:
- **Sales-Pitch ADR / One-Sided Bias**: Fully documents email forwarding deliverability fragility, SPF/DKIM breakdown risks, and DOM selector maintenance costs alongside privacy benefits.
- **Untestable Directives**: Replaces vague "avoid spamming" rules with falsifiable thresholds (circuit breakers, 24-hour cooldowns, zero remote egress in CI).
- **Public Repo PII Leakage**: Preserves strict repo hygiene (Agent Artifact Policy Rule 4) by using generic placeholders in tracked documentation and injecting runtime identities via CLI arguments.

---

## Decision Drivers

- **Compliance with Fleet Governance**: Direct adherence to `ai-infra` ADR-023 and ADR-019 (Lawfulness, Privacy, and Security by Design).
- **Public Infrastructure Stewardship**: Protection of public-sector endpoints against unintentional traffic spikes, repeated dry-run probes, and mock record pollution.
- **Identity Privacy & Minimization**: Decoupling primary inboxes from administrative case databases.
- **Reply Routing & Forwarding Deliverability**: Ensuring European Commission case officers can send acknowledgements and follow-ups through relay proxies without DMARC rejection.
- **Operational Simplicity (KISS)**: Prioritizing minimal moving parts and zero secret dependencies for standard statutory filings.

---

## Considered Options

### Option 1: Custom Subdomain Relay Mask (`<purpose>@<subdomain>.mozmail.com`)

The operator uses a Mozilla Relay subdomain or personal domain with wildcard forwarding. The alias slug is synthesized programmatically at runtime (e.g. `dma@<subdomain>.mozmail.com`, `bureaucracy@<subdomain>.mozmail.com`).

* **Strengths**:
  - **Zero API Dependency**: Synthesized locally; requires no API tokens, external sessions, or credential management.
  - **Deterministic Deduplication**: Slugs map 1:1 to regulatory scope, simplifying archiving and folder rules.
  - **Persistent Inbound Routing**: Managed permanently by Mozilla Relay's backend (AWS SES / Postfix).
  - **Granular Revocation**: Any individual slug can be blocked independently if spammed.
* **Accepted Trade-offs & Negative Consequences**:
  - **Partial PII Exposure**: If the subdomain contains the operator's surname (e.g. `<surname>.mozmail.com`), institutional systems observe the family name. This is acceptable for Class A statutory filings (e.g. DMA complaints) because statutory procedure already mandates legal First and Last name.
  - **Strict Prohibition for Anonymous Filings**: Option 1 is strictly forbidden for Class B (whistleblower/anonymous) filings.

---

### Option 2: Random Pseudonymous Relay Pool (`<random-id>@mozmail.com`)

The agent provisions random masks (e.g. `k8s2x9p@mozmail.com`) via Relay API or draws from a pre-allocated local pool tracked in a deduplication ledger (`data/relay-ledger.json`).

* **Strengths**:
  - **Complete Identity Obfuscation**: Neither local part nor domain reveals family identity.
  - **High Domain Trust**: `mozmail.com` root domain enjoys standard consumer deliverability.
* **Accepted Trade-offs & Negative Consequences**:
  - **API & Credential Overhead**: Requires storing Relay tokens and handling session refresh.
  - **State Ledger Complexity**: Requires tracking `case_id <-> mask` mappings to avoid orphan aliases or collisions.

---

## Technical Standards & Deliverability Protocol

Under RFC 7489 (DMARC), RFC 8617 (ARC), and RFC 7960:
1. **SPF Invalidation & SRS**: Email forwarding changes the sending MTA IP to Mozilla Relay, invalidating SPF for the original sender (`ec.europa.eu`). Mozilla Relay rewrites the envelope sender via Sender Rewriting Scheme (SRS) to validate against `mozmail.com`.
2. **DKIM Preservation**: Delivery through strict receiver mailboxes (`p=reject`) depends entirely on intact DKIM signatures. Mozilla Relay preserves message body and header integrity unmodified, maintaining valid DKIM authentication.
3. **Receipt Recovery Runbook**: If an institutional confirmation receipt does not arrive within 15 minutes of live submission, the operator verifies Relay dashboard logs. Agents MUST NOT re-submit the form, as doing so creates duplicate official administrative records.

---

## Project Implementation Invariants for `einfach-machen-agent`

1. **Strict Offline Fixture Gate**: All form parsing and schema validations in `tests/dma.test.ts` execute against local offline fixtures. CI runs with zero remote egress.
2. **Offscreen Browser Displacement**: Live dry-run verification uses Playwright with `--window-position=-32000,-32000` to prevent desktop distraction, capturing an audit screenshot in `logs/dma-dryrun-<timestamp>.png`.
3. **Circuit Breaker on Challenge**: If the portal returns HTTP 429, 503, or displays a CAPTCHA, execution aborts immediately ($N = 1$). No automated retry or CAPTCHA circumvention is permitted.
4. **Payload Bounds Gate**: Submissions enforce character limits before browser launch: Subject $\le 100$ characters, Message body $\le 2000$ characters.
5. **Runtime PII Injection**: Zero personal names or email subdomains are committed to the repository. The script mandates runtime arguments (`--first-name`, `--last-name`, `--email`).
6. **Class C4 Gate for Live Dispatch**: `--live` submission requires an unlapsed Class C4 approval card and explicit operator instruction.

---

## Consequences

### Positive
- Enforces strict public infrastructure stewardship matching EU Europa Web Guide standards.
- Shields operator's primary inbox from public records aggregation.
- PII-free codebase suitable for public repository hosting.

### Negative & Accepted Operational Costs
- Brittle DOM selectors require periodic maintenance against EU portal redesigns.
- Email relay introduces a 1-5 minute delay for confirmation receipts.
- Live submissions are throttled by mandatory 24-hour cooldowns.
