# Spec Delta: DMA Citizen Submission

## Purpose

Enable reviewed and audited citizen complaints to the European Commission's Digital Markets Act contact portal. Offline checks and explicit live guards take precedence over automation convenience.

## ADDED Requirements

### Requirement: Dry-run safety by default
The submission module SHALL default to dry-run mode unless the live flag is explicit. In dry-run mode it SHALL populate the form and capture an audit screenshot without clicking submit. It SHALL disclose placeholder identity use, label the built-in complaint text as an unreviewed sample, and print the exact payload fingerprint with instructions for live confirmation.

#### Scenario: Default dry-run execution
- **WHEN** no live flag is supplied
- **THEN** dry-run mode is selected and no live confirmation is required.
- **Test**: `CLI mode defaults to dry run`

#### Scenario: Dry-run disclosures and fingerprint
- **WHEN** the built-in sample and any identity placeholder are used
- **THEN** the output labels the sample as unreviewed, gives a placeholder identity notice, and prints the exact payload fingerprint needed by a live run.
- **Test**: `runDmaCli labels the sample and placeholder identity and prints the exact fingerprint`

#### Scenario: Live execution
- **WHEN** every live guard passes and the form is submitted
- **THEN** the result identifies a live run and includes its audit screenshot.
- **Test**: `CLI mode selects live only with an explicit live flag`

### Requirement: Constraint validation
The submission module SHALL validate all payload fields against the observed portal constraints before launching the browser.

#### Scenario: Valid payload
- **WHEN** a payload has a subject of at most 100 characters, a message of at most 2,000 characters, and a valid email
- **THEN** validation passes.
- **Test**: `validateDmaPayload accepts a well-formed payload (happy path)`

#### Scenario: Subject exceeding 100 characters
- **WHEN** a payload has a subject with more than 100 characters
- **THEN** validation fails before browser launch.
- **Test**: `validateDmaPayload rejects invalid payloads (error paths / sensitivity probe)`

#### Scenario: Message exceeding 2000 characters
- **WHEN** a payload has a message with more than 2,000 characters
- **THEN** validation fails before browser launch.
- **Test**: `validateDmaPayload rejects invalid payloads (error paths / sensitivity probe)`

### Requirement: Exact payload confirmation and reviewed message input
Live submission SHALL require a 12-character SHA-256 fingerprint prefix over the identity, topic, subject, and message joined by newlines. The supplied confirmation SHALL equal the fingerprint of the exact payload. Live submission SHALL also require an explicit message file; the built-in text SHALL be limited to dry-run sample use.

#### Scenario: Exact payload accepted
- **WHEN** the confirmation matches the exact payload fingerprint
- **THEN** the confirmation check passes.
- **Test**: `checkLive accepts the exact payload fingerprint and complete CLI identity`

#### Scenario: Missing or wrong confirmation
- **WHEN** confirmation is absent, incorrect, or stale after any payload field changes
- **THEN** live submission is refused.
- **Tests**: `checkLive refuses a missing confirmation`; `checkLive refuses a wrong confirmation`; `checkLive refuses confirmation after one message word changes`; `payloadFingerprint changes when any payload field changes`

#### Scenario: Canonical fingerprint
- **WHEN** a known payload is fingerprinted
- **THEN** the result is the first 12 lowercase hexadecimal characters of its specified SHA-256 digest.
- **Test**: `payloadFingerprint is the specified 12-character SHA-256 prefix`

#### Scenario: Explicit complaint text
- **WHEN** a message file is supplied
- **THEN** its content becomes the message and is included in the fingerprint.
- **Test**: `runDmaCli fingerprints explicit message-file content in a dry run`

#### Scenario: Built-in text refused live
- **WHEN** live mode has no message file
- **THEN** execution is refused before browser launch.
- **Test**: `runDmaCli refuses live mode without an explicit message file before submission`

### Requirement: Complete live identity
Live submission SHALL require first name, last name, and email directly from command-line arguments. Missing values and dry-run placeholders SHALL NOT satisfy this requirement, and environment fallbacks SHALL NOT replace them.

#### Scenario: Complete identity
- **WHEN** all three non-placeholder identity arguments are present
- **THEN** the identity portion of the live check passes.
- **Test**: `checkLive accepts the exact payload fingerprint and complete CLI identity`

#### Scenario: Missing or placeholder identity
- **WHEN** any identity argument is missing or uses a dry-run placeholder
- **THEN** live submission is refused.
- **Tests**: `checkLive refuses each missing CLI identity field`; `checkLive refuses the dry-run placeholder identity`

### Requirement: Repository live cooldown
A 24-hour interval between recorded live runs SHALL be enforced as this repository's own anti-duplication rule, not as a statutory period. A first run and a run at or after the interval SHALL be allowed; a run inside the interval SHALL be refused before browser launch.

#### Scenario: Cooldown permits an eligible run
- **WHEN** no last-live record exists or the injected clock is at least 24 hours after it
- **THEN** no cooldown time remains.
- **Test**: `cooldownRemainingMs allows a first run and a run at or after 24 hours`

#### Scenario: Cooldown refuses a recent run
- **WHEN** the injected clock is less than 24 hours after the last-live record
- **THEN** the remaining interval is returned and live execution is refused.
- **Test**: `cooldownRemainingMs refuses a run within 24 hours`

#### Scenario: Last-live persistence
- **WHEN** an injected state path is written and read
- **THEN** the exact ISO timestamp round-trips, while an absent record returns no timestamp.
- **Tests**: `last-live record round-trips through an injected path`; `readLastLive returns null when the injected path has no record`

### Requirement: Response circuit breaker
The first navigation response SHALL be assessed before form filling. HTTP 429 SHALL stop the run as rate-limited and retain the `Retry-After` value, HTTP 503 SHALL stop it as unavailable, and a recognized CAPTCHA marker SHALL stop it as a challenge. A non-ok assessment SHALL save an audit screenshot and SHALL NOT retry, submit, or attempt challenge handling.

#### Scenario: Normal response
- **WHEN** a normal HTTP 200 page has no challenge marker
- **THEN** form processing may continue.
- **Test**: `assessResponse returns ok for a normal 200 page`

#### Scenario: Rate limiting
- **WHEN** the response is HTTP 429 with `Retry-After`
- **THEN** the run is classified as rate-limited and the header value is retained in its result.
- **Test**: `assessResponse rate-limits HTTP 429 and preserves Retry-After`

#### Scenario: Service unavailable
- **WHEN** the response is HTTP 503
- **THEN** the run is classified as unavailable and stops without retry.
- **Test**: `assessResponse marks HTTP 503 unavailable`

#### Scenario: Challenge detected
- **WHEN** the page contains a supported CAPTCHA class or an iframe whose source contains captcha
- **THEN** the run is classified as a challenge and stops.
- **Test**: `assessResponse detects every supported CAPTCHA marker`

#### Scenario: Ordinary prose is not a challenge
- **WHEN** the page merely mentions captcha without a recognized marker
- **THEN** it is not classified as a challenge.
- **Test**: `assessResponse does not mistake ordinary captcha prose for an iframe challenge`

### Requirement: Offline fixture coverage
Every form selector SHALL match exactly one element in a synthetic offline fixture. Selector tests SHALL use Chromium with local content when available and SHALL always include browser-independent checks. Removing a required field SHALL be detected without a browser or network access.

#### Scenario: Complete fixture
- **WHEN** each form selector is evaluated against the complete fixture
- **THEN** exactly one element matches.
- **Tests**: `Chromium fixture selector <field> matches exactly one element`; `HTMLRewriter fixture selector <field> matches exactly one element`

#### Scenario: Incomplete fixture
- **WHEN** the first-name field is removed from the fixture
- **THEN** the browser-independent check reports no match while the complete-fixture control still reports one.
- **Test**: `browser-free negative control detects a fixture with first name removed`

### Requirement: Transparent offscreen browser execution
The browser SHALL launch offscreen using the prescribed window position. It SHALL NOT disable its sandbox, disable automation identification, or set a custom user agent.

#### Scenario: Focus isolation
- **WHEN** launch arguments are built
- **THEN** the offscreen window position is present.
- **Test**: `buildLaunchArgs retains the offscreen window position`

#### Scenario: No masking or sandbox removal
- **WHEN** launch arguments and context options are built
- **THEN** automation-masking and disabled-sandbox flags are absent, the viewport is explicit, and no custom user agent is set.
- **Tests**: `buildLaunchArgs omits automation masking and disabled-sandbox flags`; `buildContextOptions retains an explicit viewport`; `buildContextOptions does not set a custom user agent`

### Requirement: Live audit recording
Every attempt that reaches live submission execution SHALL append its result as one JSON line in the ignored log area and update the last-live record, including circuit-breaker and error results. Dry runs SHALL NOT create either live record.

#### Scenario: Live result recorded
- **WHEN** a live result is recorded with injected paths and time
- **THEN** exactly one JSON line containing the result is appended and the cooldown timestamp is written.
- **Test**: `recordLiveSubmission appends one JSON line and writes the cooldown record`

#### Scenario: Dry result excluded
- **WHEN** a dry-run result is passed to live recording
- **THEN** neither the audit log nor the last-live record is created.
- **Test**: `recordLiveSubmission does not record a dry run as a live attempt`
