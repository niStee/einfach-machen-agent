# Spec Delta

## Purpose

Bound the behaviour of a live submission so that the tool never floods, retries
against or files unapproved content with a public endpoint.

## ADDED Requirements

### Requirement: Dry run stays the default
The tool SHALL perform a live submission only when live mode is requested explicitly. A dry run SHALL NOT submit the form and SHALL NOT require an approval record.

#### Scenario: No mode given
- **WHEN** the tool is started without requesting live mode
- **THEN** the form is not submitted and the run is reported as a dry run

#### Scenario: Dry run without approval
- **WHEN** a dry run is started and no approval record exists
- **THEN** the dry run proceeds

### Requirement: Stop on throttling or service unavailable
The tool SHALL stop a live run when the endpoint answers with HTTP 429 or HTTP 503. It SHALL NOT retry the request and SHALL NOT continue with further items of a batch. It SHALL report the status and any Retry-After value to the user and exit with a failure status.

#### Scenario: Throttled during a batch
- **WHEN** the endpoint answers the second of five batch items with HTTP 429 and `Retry-After: 120`
- **THEN** items three to five are not attempted, the report names status 429 and the value 120, and the exit status is a failure

#### Scenario: Service unavailable
- **WHEN** the endpoint answers with HTTP 503
- **THEN** the run stops without a second request to the endpoint

#### Scenario: Ordinary success is not a stop
- **WHEN** the endpoint answers with HTTP 200 and the confirmation page
- **THEN** the item is recorded as submitted and a batch continues subject to pacing

### Requirement: Stop on a challenge and never work around it
The tool SHALL stop a live run when the endpoint presents a challenge that an ordinary browser session does not pass on its own, such as a CAPTCHA. It SHALL NOT attempt to solve, bypass or repeat past the challenge.

#### Scenario: CAPTCHA shown
- **WHEN** the form page shows a CAPTCHA instead of the next step
- **THEN** the run stops, nothing is submitted, and the report names the challenge

#### Scenario: Challenge in a batch
- **WHEN** a challenge appears on the third item of a batch
- **THEN** no further item is attempted

### Requirement: Per-matter cooldown
The tool SHALL refuse a live submission for a matter that was submitted live less than 24 hours earlier, before it opens the form.

#### Scenario: Same matter after 23 hours 59 minutes
- **WHEN** a matter was submitted live 23 hours 59 minutes ago and is submitted live again
- **THEN** the tool refuses, names the remaining wait, and does not open the form

#### Scenario: Same matter after 24 hours
- **WHEN** a matter was submitted live 24 hours ago and is submitted live again
- **THEN** the cooldown does not refuse it

#### Scenario: Unreadable history
- **WHEN** the record of past submissions cannot be read
- **THEN** the tool refuses the live submission

### Requirement: Submission pacing
The tool SHALL keep at least 10 minutes between any two live submissions, whatever the matter. The interval MAY be configured longer and SHALL NOT be configurable shorter.

#### Scenario: Second item of a batch
- **WHEN** the first item of a batch was submitted live one minute ago
- **THEN** the second item is not submitted before 10 minutes have passed since the first

#### Scenario: Separate invocations
- **WHEN** a live submission succeeded nine minutes ago in an earlier run and a new live run starts
- **THEN** the tool refuses or waits until 10 minutes have passed

#### Scenario: Shorter interval configured
- **WHEN** the interval is configured to five minutes
- **THEN** the tool refuses to start and names the minimum

### Requirement: Approval per live submission
The tool SHALL perform a live submission only when an approval record exists that names the same matter, matches the exact text to be submitted, and has not expired. It SHALL check this before it opens the form.

#### Scenario: No approval record
- **WHEN** live mode is requested and no approval record exists for the matter
- **THEN** the tool refuses and does not open the form

#### Scenario: Text changed after approval
- **WHEN** an approval record exists but the text to be submitted differs from the approved text
- **THEN** the tool refuses

#### Scenario: Expired approval
- **WHEN** the approval record expired one minute ago
- **THEN** the tool refuses

#### Scenario: Valid approval
- **WHEN** an unexpired approval record matches the matter and the text
- **THEN** the approval check passes and the other safeguards still apply

#### Scenario: Batch with one unapproved item
- **WHEN** a batch of three contains one item without a valid approval
- **THEN** that item is refused and the batch stops before submitting it
