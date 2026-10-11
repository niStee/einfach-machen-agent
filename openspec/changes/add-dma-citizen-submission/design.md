# Design: DMA Citizen Submission Module

## Architecture

The module lives in `scripts/submit-dma.ts` and exports:
- `DmaComplaintPayload`
- `validateDmaPayload(payload)`
- `buildPlayIntegrityComplaintPayload(options)`
- `submitDmaComplaint(payload, options)`

It relies on Playwright Chromium using standard offscreening flags matching `submit-feedback.ts`.

## Form Mapping
- First Name: `input[name="oe_first_name[0][value]"]`, `#edit-oe-first-name-0-value`
- Last Name: `input[name="oe_last_name[0][value]"]`, `#edit-oe-last-name-0-value`
- Email: `input[name="mail"]`, `#edit-mail`
- Topic: `select[name="oe_topic"]`, `#edit-oe-topic` -> Option: `Contact us as an EU Citizen`
- Subject: `input[name="subject[0][value]"]`, `#edit-subject-0-value` (max 100 chars)
- Message: `textarea[name="message[0][value]"]`, `#edit-message-0-value` (max 2000 chars)
- Privacy policy: `input[name="privacy_policy"]`, `#edit-privacy-policy` (checkbox)
- Submit: `input[type="submit"][id*="edit-submit"]`, `button[type="submit"]`
