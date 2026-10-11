# Tasks

## 1. Specification & Contract
- [x] 1.1 Define OpenSpec proposal, spec delta, and design in `openspec/changes/add-dma-citizen-submission/`.
- [x] 1.2 Validate schema with `openspec validate --strict`.

## 2. Test-Driven Implementation (TDD)
- [x] 2.1 Author `tests/dma.test.ts` covering form limit validation, positive/negative pairs, and sensitivity probes.
- [x] 2.2 Implement `scripts/submit-dma.ts` satisfying all test requirements and offscreen browser mechanics.
- [x] 2.3 Add `submit:dma` script to `package.json`.

## 3. Verification & Safety Gate
- [x] 3.1 Verify all tests pass with `bun test`.
- [x] 3.2 Verify TypeScript compilation with `bun run typecheck`.
- [x] 3.3 Verify live dry-run against the EU Commission form with full audit screenshot capture in `logs/`.

## 4. Documentation & PR
- [x] 4.1 Update `README.md` and `AGENTS.md`.
- [x] 4.2 Push branch `feat/dma-submission-module` and open Pull Request.
