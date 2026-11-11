# Tasks

## 1. Scenarios as tests

- [ ] 1.1 Write one test per scenario in `specs/live-submission/spec.md`. Tests run against a stubbed page and a controllable clock; none contacts a live endpoint. Each guard has a positive and a negative case. Done when every test fails for the right reason before any implementation exists.
- [ ] 1.2 Sensitivity probe for each guard: weaken it, see its test fail, restore it. Done when each probe is recorded in the pull request description.

## 2. Safeguards

- [ ] 2.1 Stop rule for HTTP 429, HTTP 503 and a challenge page, in single and batch mode. Done when the scenarios of "Stop on throttling or service unavailable" and "Stop on a challenge and never work around it" pass.
- [ ] 2.2 Per-matter cooldown read from the record of past submissions, refusing on an unreadable record. Done when the "Per-matter cooldown" scenarios pass, including both boundary cases.
- [ ] 2.3 Submission pacing with a 10-minute floor across items and across invocations. Done when the "Submission pacing" scenarios pass.
- [ ] 2.4 Approval record check (matter, exact text, expiry) before the form is opened. Done when the "Approval per live submission" scenarios pass.

## 3. Documentation

- [ ] 3.1 README and AGENTS.md describe the four safeguards, how an approval record is created, and that a dry run needs none. Done when the documented commands match the tested behaviour.
