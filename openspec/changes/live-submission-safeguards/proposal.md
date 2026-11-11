# Proposal: live-submission safeguards

Tracking issue: https://github.com/niStee/einfach-machen-agent/issues/63

## Why

A live run of this tool files a real proposal with a public institution. Today the only protection is that scripts default to a dry run. Once `--live` is passed, nothing bounds the tool:

- a throttling response, a service-unavailable response or a challenge page is treated like any other error, and a batch continues;
- nothing prevents the same matter from being filed twice within a day, or spaces live submissions apart: on 2026-08-06 the tool filed 21 proposals within 43 minutes;
- `--live` selects the mode but nothing checks that this submission was approved.

A tool that talks to a citizen-facing endpoint must not degrade it, flood it, or file on its own initiative.

## What changes

One vertical slice, the behaviour of a live run:

1. **Live only by flag.** Configuration cannot enable it.
2. **Stop on 429, 503 or a challenge.** One request for the affected item, no retry, no further batch items, nothing past a challenge. Retry-After is reported, not acted on. No automatic retry of any dispatch; an unknown outcome is reported.
3. **Trustworthy history.** A missing, malformed, tampered or future-dated record refuses the run.
4. **Per-matter cooldown** of 24 hours and **pacing** of at least 10 minutes between live submissions to the same endpoint, both holding across concurrent runs.
5. **Approval per submission:** same matter, same exact text, unexpired, intact and single-use, checked before the form is opened. A batch stops at the first unapproved item.

A dry run stays the default and needs none of this.

## Out of scope

- Offline HTML fixtures and a guard that fails any test that tries to reach the network (next slice). Tests in this slice use a stubbed page and a controllable clock and do not contact an endpoint.
- Probe limits, dry-run screenshots and the form inspection script (third slice).
- Any change to what is filed or to form selectors.
- ADR-045 contact-address rules (separate slice).

## Reuse check

Build. `cockatiel` and `opossum` manage long-lived breaker state; this is a one-shot command and needs a stop rule. `p-retry` retries, the opposite of the rule. `bottleneck` has had no release since 2019.

## Sources

RFC 9110 (June 2022) sections 9.2.2, 10.2.3, 15.6.4; RFC 6585 (April 2012) section 4; Microsoft Azure Architecture Center, Circuit Breaker (2025-02-05) and Retry (2024-07-18).
