# Decision Record: Civic Contact Identity and Submission Safety

- **Status**: Proposed
- **Date**: 2026-10-11
- **Revised**: 2026-11-03
- **Scope**: Citizen contact and Digital Markets Act complaint submission in this repository

## Context

The submission tools fill institutional contact forms that require a name and a working reply address. The contact address can become part of an administrative record, while automated visits can create unwanted load or duplicate records. The code therefore favors explicit human review, offline verification, transparent browser automation, and refusal over retries.

The subject limit of 100 characters and message limit of 2,000 characters were observed on the form by the author on 2026-10-11. They have not been independently verified and must be checked again if the form changes.

## Decision

The code enforces these rules:

1. Dry run is the default. It fills and screenshots the form but does not submit it. Placeholder identities and the built-in complaint text are permitted only in this mode, with clear notices that they are placeholders and unreviewed sample text.
2. Form selectors are checked against a synthetic offline fixture before any live-form verification. The fixture contains no copy of the institutional page and tests make no network requests.
3. The first response is a circuit breaker: HTTP 429 stops as rate-limited and preserves `Retry-After`; HTTP 503 stops as unavailable; a supported CAPTCHA marker stops as a challenge. The run saves an audit screenshot and does not retry, solve a challenge, or disguise automation. Other non-success status codes are treated as unavailable.
4. Live submission requires an explicit message file, a complete non-placeholder command-line identity, and `--confirm` containing the fingerprint printed by a dry run of the exact same payload. Changing any identity, topic, subject, or message field invalidates that confirmation.
5. A 24-hour interval between recorded live runs is this repository's own anti-duplication rule, not a statutory period. A run inside that interval is refused before browser launch. Live results are appended as JSON lines and the last-live record is kept in the ignored log directory.
6. Chromium keeps its normal sandbox, automation identification, and user agent. Only window placement and sizing are configured for offscreen operation.

## Contact Address Fallback Order

Use the first available option:

1. An alias on a domain controlled by the operator, with forwarding and receipt of replies verified before filing.
2. The operator's primary mailbox, accepting and recording that this exposes the address to the recipient and potentially to administrative records or disclosure processes.
3. Manual filing by the operator rather than automated submission.

Any relay or forwarding provider's SPF handling, DKIM preservation, and availability must be assessed on the day of use. This record assumes none of those properties and makes no claim about a particular provider. If no expected acknowledgement arrives, inspect the form result and mail routing before taking further action; do not automatically submit again.

## Consequences

A live run takes deliberate preparation: the operator must review the complaint text, supply a reachable identity, run a dry run, and repeat the exact payload through its fingerprint. Form redesigns require fixture and selector maintenance. The cooldown can delay legitimate follow-ups, but preventing duplicate legal submissions takes precedence. If these checks cannot be satisfied, the safe path is manual filing.
