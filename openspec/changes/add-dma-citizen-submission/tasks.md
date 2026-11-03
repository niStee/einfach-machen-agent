# Tasks

## 1. Specification and Contract
- [x] 1.1 Define the proposal, specification delta, and design.
- [x] 1.2 Run the OpenSpec validator locally with `openspec validate --strict`; no project tool lock files are retained because their referenced lock directory is absent.
- [x] 1.3 Remove the broken local tool manifests and keep validation as a local development step.

## 2. Test-Driven Implementation
- [x] 2.1 Record the red baseline: 35 new guard tests failed before implementation, 1 passed, and 9 Chromium-only tests skipped because no browser executable is installed.
- [x] 2.2 Add positive and negative response assessment tests for HTTP 429 with `Retry-After`, HTTP 503, CAPTCHA markers, and a normal page.
- [x] 2.3 Add canonical and changed-field fingerprint tests; add missing, wrong, stale, and valid confirmation tests.
- [x] 2.4 Add complete, missing, and placeholder command-line identity tests.
- [x] 2.5 Add injected-clock cooldown tests and injected-path state round-trip tests.
- [x] 2.6 Add the synthetic offline form fixture, one-match selector checks, and a browser-free removed-field negative control.
- [x] 2.7 Add launch argument and context option tests for offscreen placement, no masking, no disabled sandbox, and no custom user agent.
- [x] 2.8 Add dry-run disclosure, explicit message input, and live message-file refusal tests using an injected submission function.
- [x] 2.9 Implement the response circuit breaker, exact payload confirmation, identity checks, cooldown, and live audit recording in the submission module.
- [x] 2.10 Refactor all inline form selectors into a shared constant and remove environment identity fallbacks.
- [x] 2.11 Verify the guard suite after implementation: 39 passed, 0 failed, 9 skipped; verify the browser-free negative control by removing a fixture field and observing zero matches while its positive control remains at one.
- [x] 2.12 Re-run the guard suite after adding the offline command-line wiring checks: 42 passed, 0 failed, 9 skipped.

## 3. Verification and Safety Gate
- [x] 3.1 Run all tests with `bun test` without network access or live submission.
- [x] 3.2 Run TypeScript compilation with `bun run typecheck`.
- [x] 3.3 A dry run against the real form was performed once for this milestone on 2026-10-11, before this revision. No remote dry run or live submission was performed during this revision.

## 4. Documentation and Review
- [x] 4.1 Rewrite the project decision record so it is self-contained and states only rules enforced here.
- [x] 4.2 Align every specification scenario with code and name its covering test.
- [x] 4.3 Document dry-run fingerprints, `--confirm`, `--message-file`, the repository cooldown, and live audit records in the user and agent guides.
- [x] 4.4 Remove private-repository references and personal or internal environment details from the affected public documentation.
- [ ] 4.5 Maintainer review and merge remain outstanding; this task list does not claim approval.
