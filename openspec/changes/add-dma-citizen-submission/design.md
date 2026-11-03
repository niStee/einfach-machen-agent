# Design: DMA Citizen Submission Module

## Architecture

The module exports payload validation, a dry-run sample payload builder, and browser submission. It also exports pure guard helpers for response assessment, payload fingerprints, live confirmation, cooldown arithmetic, launch arguments, and context options. Filesystem helpers accept injected paths; command-line tests can inject the submission function so no browser or network is needed.

The dry run is the only mode that may use placeholder identity values or the built-in unreviewed sample text. Live mode requires an explicit message file and a confirmation fingerprint from the exact same payload. Live guards run before browser launch.

## Response and Audit Flow

The first navigation response is assessed before form filling. HTTP 429, HTTP 503, other non-success statuses, and recognized CAPTCHA markers stop the run. A non-ok result includes an audit screenshot and, when supplied, the original `Retry-After` value. There is no retry or challenge-solving branch.

After submission execution finishes, a live result is appended as one JSON line under the ignored log directory and the last-live timestamp is updated. This includes unsuccessful response and error results. Guard refusals before submission execution create no live record. The 24-hour cooldown is a repository anti-duplication rule.

## Form Mapping

All selectors are centralized and tested against a synthetic offline fixture. The fixture covers first name, last name, email, topic, subject, message, privacy consent, submit, and confirmation. Browser checks use local content only when Chromium is available. Independent HTMLRewriter checks always run and include a removed-field negative control.

- First Name: `input[name="oe_first_name[0][value]"]`, `#edit-oe-first-name-0-value`
- Last Name: `input[name="oe_last_name[0][value]"]`, `#edit-oe-last-name-0-value`
- Email: `input[name="mail"]`, `#edit-mail`
- Topic: `select[name="oe_topic"]`, `#edit-oe-topic` -> Option: `Contact us as an EU Citizen`
- Subject: `input[name="subject[0][value]"]`, `#edit-subject-0-value` (observed maximum 100 characters)
- Message: `textarea[name="message[0][value]"]`, `#edit-message-0-value` (observed maximum 2,000 characters)
- Privacy policy: `input[name="privacy_policy"]`, `#edit-privacy-policy`
- Submit: `#edit-submit`, `button[name="op"][value="Send message"]`, or the matching submit button in the contact form
- Confirmation: `.messages--status`, `[role="status"]`, `[role="alert"]`, or `.alert-success`

## Browser and Identity

Chromium retains its normal user agent, automation identification, and sandbox. The launch configuration only minimizes and positions the window offscreen and sets its size.

The project decision record for civic contact identity and submission safety documents the address fallback order and the safety rationale. No external governance document is needed to interpret or test this module.
