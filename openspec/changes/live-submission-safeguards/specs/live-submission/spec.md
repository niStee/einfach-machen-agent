# Spec Delta

## Purpose

Bound the behaviour of a live submission so that the tool never floods, retries against, or files unapproved content with a public endpoint.

## ADDED Requirements

### Requirement: Dry run stays the default
The tool SHALL perform a live submission only when the live flag is present on that invocation. Configuration files, environment variables and saved preferences SHALL NOT enable live mode. A dry run SHALL NOT submit the form and SHALL NOT require an approval record.

#### Scenario: No flag given
- **WHEN** the tool is started without the live flag
- **THEN** the form is not submitted and the run is reported as a dry run

#### Scenario: Live mode configured but flag absent
- **WHEN** a configuration file or environment variable asks for live mode and the live flag is absent
- **THEN** the run remains a dry run

#### Scenario: Dry run without approval
- **WHEN** a dry run is started and no approval record exists
- **THEN** the dry run proceeds

### Requirement: Stop on throttling or service unavailable
The tool SHALL stop a live run when the endpoint answers with HTTP 429 or HTTP 503. It SHALL send exactly one request for the affected item, SHALL NOT retry it, and SHALL NOT continue with further items. It SHALL report the status and any Retry-After value and exit with a failure status. It SHALL NOT use Retry-After to schedule a retry or a later run.

#### Scenario: Throttled during a batch
- **WHEN** the endpoint answers the second of five batch items with HTTP 429 and `Retry-After: 120`
- **THEN** exactly one request was made for item two, items three to five are not attempted, the report names status 429 and the value 120, and the exit status is a failure

#### Scenario: Throttled in a single submission
- **WHEN** a single live submission is answered with HTTP 429
- **THEN** exactly one request is made, the report names status 429, and the exit status is a failure

#### Scenario: Service unavailable in a single submission
- **WHEN** a single live submission is answered with HTTP 503
- **THEN** exactly one request is made, the report names status 503, and the exit status is a failure

#### Scenario: Service unavailable during a batch
- **WHEN** the endpoint answers the first of three batch items with HTTP 503
- **THEN** items two and three are not attempted and the exit status is a failure

#### Scenario: Restart after a stop
- **WHEN** a run stopped on HTTP 429 and the tool is started again immediately for the same item
- **THEN** no request is sent until the applicable cooldown, pacing and approval checks pass

#### Scenario: Ordinary success is not a stop
- **WHEN** the endpoint answers with HTTP 200 and the confirmation page
- **THEN** the item is recorded as submitted and a batch continues subject to pacing

### Requirement: Stop on a challenge and never work around it
The tool SHALL stop a live run whenever a CAPTCHA is presented, and likewise for any other challenge that an ordinary browser session does not pass on its own. It SHALL NOT attempt to solve, bypass or repeat past the challenge, and SHALL send no further request to the endpoint after detecting it.

#### Scenario: CAPTCHA shown
- **WHEN** the form page shows a CAPTCHA instead of the next step
- **THEN** the run stops, nothing is submitted, no further request is sent to the endpoint, and the report names the challenge

#### Scenario: Challenge in a batch
- **WHEN** a challenge appears on the third item of a batch
- **THEN** no further item is attempted and no further request is sent to the endpoint

### Requirement: No automatic retry of a dispatch
The tool SHALL NOT automatically retry a form dispatch after a transport failure, timeout or ambiguous response. It SHALL stop, report that the outcome may be unknown, and exit with a failure status. The time of the dispatch SHALL govern cooldown and pacing even when the outcome is unknown.

#### Scenario: Timeout after dispatch
- **WHEN** the connection times out after the form was dispatched
- **THEN** exactly one dispatch attempt was made, the report says the outcome may be unknown, and the exit status is a failure

#### Scenario: Interrupted before confirmation is recorded
- **WHEN** the run is interrupted after dispatch and before the confirmation is recorded, and the tool is started again for the same matter
- **THEN** the dispatch time counts for cooldown and pacing and the tool does not dispatch again automatically

### Requirement: Trustworthy submission history
The tool SHALL read a record of past live submissions before it opens the form. It SHALL refuse a live submission when that record is malformed, fails integrity validation, is unexpectedly missing, or contains a timestamp later than the current time. A valid, initialised and empty record SHALL permit a first submission, subject to the other safeguards.

#### Scenario: First submission with an initialised empty history
- **WHEN** the record is valid and empty
- **THEN** the history check does not refuse the submission

#### Scenario: Unreadable or tampered history
- **WHEN** the record cannot be read, is malformed or fails integrity validation
- **THEN** the tool refuses and does not open the form

#### Scenario: Missing history
- **WHEN** the record is missing after the tool has been initialised
- **THEN** the tool refuses and does not open the form

#### Scenario: Future timestamp
- **WHEN** the record contains a submission time later than the current time
- **THEN** the tool refuses and does not open the form

### Requirement: Per-matter cooldown
The tool SHALL refuse a live submission for a matter that was submitted live less than 24 hours earlier, before it opens the form.

#### Scenario: Same matter after 23 hours 59 minutes
- **WHEN** a matter was submitted live 23 hours 59 minutes ago and is submitted live again
- **THEN** the tool refuses, names the remaining wait, and does not open the form

#### Scenario: Same matter after exactly 24 hours
- **WHEN** a matter was submitted live exactly 24 hours ago, all other safeguards pass and the stub endpoint returns success
- **THEN** exactly one dispatch is made and the submission is recorded

### Requirement: Submission pacing
The tool SHALL keep at least 10 minutes between any two live submissions to the same endpoint, whatever the matter. The interval MAY be configured longer and SHALL NOT be configurable shorter.

#### Scenario: Second item of a batch
- **WHEN** the first item of a batch was submitted live one minute ago
- **THEN** the second item is not submitted before 10 minutes have passed since the first

#### Scenario: Separate invocations
- **WHEN** a live submission succeeded nine minutes ago in an earlier run and a new live run starts
- **THEN** the tool refuses or waits until 10 minutes have passed

#### Scenario: Exactly 10 minutes
- **WHEN** the previous live submission to the endpoint was exactly 10 minutes ago and all other safeguards pass
- **THEN** pacing permits the submission

#### Scenario: Longer interval configured
- **WHEN** the interval is configured to 15 minutes
- **THEN** it is accepted and submissions are kept at least 15 minutes apart

#### Scenario: Shorter interval configured
- **WHEN** the interval is configured to five minutes
- **THEN** the tool refuses to start and names the minimum

### Requirement: Safeguards hold across concurrent runs
The tool SHALL ensure that cooldown, pacing and approval consumption hold when two live runs are started at the same time. At most one of them SHALL dispatch; the other SHALL wait or refuse without dispatching.

#### Scenario: Two runs for the same matter
- **WHEN** two live runs for the same matter are ready at the same moment
- **THEN** at most one opens the form and the other refuses or waits until the full cooldown has elapsed

#### Scenario: Two runs for different matters
- **WHEN** two live runs for different matters against the same endpoint are ready at the same moment
- **THEN** their dispatches are at least the configured interval apart, and the second waits or refuses without dispatching

### Requirement: Approval per live submission
The tool SHALL perform a live submission only when an approval record exists that names the same matter, matches the exact text to be submitted, and has not expired. It SHALL check this before it opens the form. An approval SHALL be valid only while the current time is earlier than its expiry.

#### Scenario: No approval record
- **WHEN** live mode is requested and no approval record exists for the matter
- **THEN** the tool refuses and does not open the form

#### Scenario: Text changed after approval
- **WHEN** an approval record exists but the text to be submitted differs from the approved text
- **THEN** the tool refuses and does not open the form

#### Scenario: Approval for another matter
- **WHEN** an unexpired record matches the text but names another matter
- **THEN** the tool refuses and does not open the form

#### Scenario: Expired approval
- **WHEN** the approval record expired one minute ago
- **THEN** the tool refuses and does not open the form

#### Scenario: Approval at the expiry instant
- **WHEN** the current time equals the expiry of the record
- **THEN** the tool refuses and does not open the form

#### Scenario: One tick before expiry
- **WHEN** the current time is one second before the expiry, and all other safeguards pass and the stub endpoint returns success
- **THEN** exactly one dispatch is made and the submission is recorded

#### Scenario: Valid approval
- **WHEN** an unexpired, unused, intact record matches the matter and the text, all other safeguards pass and the stub endpoint returns success
- **THEN** exactly one dispatch is made and the submission is recorded

### Requirement: Approval records are single-use and intact
An approval record SHALL authorise exactly one dispatch. The tool SHALL refuse a record that is malformed, unreadable, altered after it was recorded, or without a valid expiry, and SHALL refuse a record that was already used.

#### Scenario: Record without a valid expiry or altered
- **WHEN** the record has no valid expiry, is malformed, or was altered after it was recorded
- **THEN** the tool refuses and does not open the form

#### Scenario: Approval used twice
- **WHEN** a record was already consumed by a dispatch and a second live submission presents it, sequentially or at the same time as the first
- **THEN** at most one dispatch is made in total

### Requirement: Batches stop at the first unapproved item
The tool SHALL stop a batch before it submits an item that lacks a valid approval, and SHALL NOT submit any later item of that batch.

#### Scenario: Second of three items lacks approval
- **WHEN** the second of three items has no valid approval
- **THEN** the second and third items are not submitted, and the first is submitted only if all its safeguards passed
