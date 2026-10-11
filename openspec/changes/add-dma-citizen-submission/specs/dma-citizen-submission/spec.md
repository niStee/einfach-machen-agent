# Spec Delta: DMA Citizen Submission

## Purpose

Enable automated, verified, and audited submissions of citizen complaints to the European Commission's Digital Markets Act (DMA) contact portal, ensuring privacy, headless/offscreen browser operation, and compliance with form constraints.

## ADDED Requirements

### Requirement: Dry-run safety by default
The DMA submission module SHALL default to dry-run mode unless explicitly passed `--live`. In dry-run mode, it SHALL fill the form and capture an audit screenshot, but SHALL NEVER click the submit button.

#### Scenario: Default dry-run execution
- **WHEN** `submitDmaComplaint` is invoked with default options
- **THEN** the form is populated and verified, an audit screenshot is saved under `logs/`, and the browser exits with `dryRun: true` without submitting.

#### Scenario: Live execution
- **WHEN** `submitDmaComplaint` is invoked with `{ dryRun: false }` or `--live`
- **THEN** the submit button is clicked, submission response is recorded in `logs/dma-submissions.json`, and the browser exits with `dryRun: false`.

### Requirement: Constraint validation
The DMA submission module SHALL validate all payload fields against the European Commission portal constraints before launching the browser.

#### Scenario: Valid payload
- **WHEN** a payload with subject <= 100 chars, message <= 2000 chars, and valid email is supplied
- **THEN** validation passes.

#### Scenario: Subject exceeding 100 characters
- **WHEN** a payload has a subject with more than 100 characters
- **THEN** validation fails and rejects execution before browser launch.

#### Scenario: Message exceeding 2000 characters
- **WHEN** a payload has a message with more than 2000 characters
- **THEN** validation fails and rejects execution before browser launch.

### Requirement: Offscreen browser execution
The submission module SHALL launch the browser minimized and offscreen (`--window-position=-32000,-32000`) so it does not steal focus from the user's active workstation session.

#### Scenario: Focus isolation
- **WHEN** the browser is launched
- **THEN** it executes in an offscreen window position.
