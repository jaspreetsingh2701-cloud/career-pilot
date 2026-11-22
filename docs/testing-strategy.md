# Testing Strategy

## CI
GitHub Actions uses Node.js 22, `npm ci`, ESLint, TypeScript typecheck, Vitest and the production WXT build. Green CI does not replace real Chrome permission and compatibility checks.

## Unit tests
- Website rules: domain/IP validation, exact IP matching, subdomains, allowlist and blocklist precedence.
- Profile candidate normalization: standard/custom values, legacy profiles and phone country-code composition without duplication.
- Mapping: exact/normalized/alias matches, saved-answer keywords, ambiguity, missing values and native option matching.
- Detection: labels, names/IDs, placeholders, ARIA metadata, helper text, hidden/disabled/read-only and sensitive-field exclusions.
- Filling: approved-only behavior, existing-value preservation, explicit replacement, stale targets, changed control type, sensitive controls, native selects and no-submit behavior.
- Library: profile persistence, custom fields, document Blob round-trip, defaults, saved-answer/snippet CRUD, clipboard preservation and clear-all.
- Backup: round-trip and malformed/unsupported backup rejection (coverage remains to be expanded).

## Local fixture
Serve the synthetic form fixture:
```bash
python -m http.server 4173 --directory tests/fixtures/local-page
```
Use synthetic data only. Extend fixtures for radio/checkbox groups, fieldset/legend context, ARIA-labelledby, helper text, React-controlled inputs, dynamic options, prefilled conflicts and file inputs.

## Browser/integration tests — pending
Playwright extension setup is not yet present. Required scenarios include side-panel detection, activeTab permission behavior, review/edit/approve/skip, approved-only fill, sensitive exclusion, stale/conflict handling, no form submission, React-controlled inputs, backup restore, clear-all and accessibility.

Use local fixtures first; do not automate arbitrary third-party portals without a stable, permitted test environment.

## Quality gate
Tests, typecheck, lint and production build must pass. Browser-specific behavior must be recorded in a compatibility matrix; do not infer universal portal compatibility from local fixtures.
