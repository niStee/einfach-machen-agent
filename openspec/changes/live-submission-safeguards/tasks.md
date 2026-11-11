# Tasks

## 1. Scenarios as tests

- [ ] 1.1 Write one test per scenario in `specs/live-submission/spec.md`. Tests use a stubbed page and a controllable clock; none of them contacts a live endpoint (the suite-wide network guard follows in the next slice). Each guard has a positive and a negative case. Done when every test fails for the right reason before any implementation exists.
- [ ] 1.2 Sensitivity probe for each guard: weaken it, see its test fail, restore it. Done when each probe is recorded in the pull request description.

## 2. Safeguards

- [ ] 2.1 Live only by flag. Done when the "Dry run stays the default" scenarios pass.
- [ ] 2.2 Stop rule for HTTP 429, HTTP 503 and a challenge, in single and batch mode, with request-count assertions. Done when the scenarios of "Stop on throttling or service unavailable" and "Stop on a challenge and never work around it" pass.
- [ ] 2.3 No automatic retry of a dispatch, and dispatch time governing the waits. Done when the "No automatic retry of a dispatch" scenarios pass.
- [ ] 2.4 Submission history with integrity validation and a first-run initialisation. Done when the "Trustworthy submission history" scenarios pass, including the first-run case.
- [ ] 2.5 Per-matter cooldown and submission pacing with a 10-minute floor across items and across invocations. Done when the "Per-matter cooldown" and "Submission pacing" scenarios pass, both boundaries on both sides.
- [ ] 2.6 Locking so that cooldown, pacing and approval consumption hold across concurrent runs. Done when the "Safeguards hold across concurrent runs" scenarios pass.
- [ ] 2.7 Approval record: creation command, expiry assignment, integrity protection, single-use consumption, and the check before the form is opened. Done when the "Approval per live submission", "Approval records are single-use and intact" and "Batches stop at the first unapproved item" scenarios pass, and a test covers creating a record with the documented command.

## 3. Documentation

- [ ] 3.1 README and AGENTS.md describe the safeguards, how an approval record is created, and that a dry run needs none. Done when the documented commands are the ones exercised by the test in 2.7.
