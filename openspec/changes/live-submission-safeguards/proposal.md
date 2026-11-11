# Proposal: live-submission safeguards

Tracking issue: https://github.com/niStee/einfach-machen-agent/issues/63

## Why

A live run of this tool files a real proposal with a public institution. Today the
only protection is that scripts default to a dry run. Once `--live` is passed,
nothing bounds how the tool behaves:

- a throttling response, a service-unavailable response or a challenge page is
  treated like any other error, and a batch simply continues with the next item;
- nothing prevents the same matter from being filed twice within a day;
- nothing spaces live submissions apart: on 2026-08-06 the tool filed 21 proposals
  within 43 minutes;
- `--live` selects the mode but nothing checks that this particular submission
  was approved.

A tool that talks to a citizen-facing public endpoint must not degrade it, must not
flood it, and must never file on its own initiative.

## What changes

One vertical slice, the behaviour of a live run:

1. **Stop on throttling or challenge.** On HTTP 429, HTTP 503 or a challenge the
   tool cannot pass as an ordinary browser, the run stops. It does not retry, and a
   batch does not continue. A `Retry-After` value is reported to the user, not
   acted on. The tool never works around a challenge.
2. **Per-matter cooldown.** A matter that was filed live less than 24 hours ago is
   refused.
3. **Submission pacing.** Any two live submissions are at least 10 minutes apart,
   whatever the matter. A batch waits or stops; it never shortens the interval.
4. **Approval per submission.** A live submission needs an approval record for
   exactly that matter and exactly that text, which has not expired. Without it the
   tool refuses before it opens the form.

A dry run stays the default and needs none of the above.

## Out of scope

- Offline HTML fixtures for the form, and a guard that fails any test that tries
  to reach the network (next slice).
- Probe limits, dry-run screenshots and the fate of the form inspection script
  (third slice).
- Any change to what is filed, to the proposal data, or to the form selectors.
- Retrying a failed submission. A form submission is not idempotent, and
  RFC 9110 section 9.2.2 says a client should not automatically retry such a
  request.

## Reuse check

Build. Circuit-breaker libraries (`cockatiel`, `opossum`) manage long-lived breaker
state with a reset timer; this tool is a one-shot command and needs a stop rule,
not a breaker. `p-retry` retries, which is the opposite of the rule. `bottleneck`
has had no release since 2019. If the tool ever becomes long-running, `cockatiel`
is the first candidate to revisit.

## Sources

- RFC 9110, HTTP Semantics, June 2022: section 9.2.2 (idempotent methods),
  section 10.2.3 (Retry-After), section 15.6.4 (503).
- RFC 6585, Additional HTTP Status Codes, April 2012: section 4 (429).
- Microsoft Azure Architecture Center, Circuit Breaker pattern (2025-02-05) and
  Retry pattern (2024-07-18).
