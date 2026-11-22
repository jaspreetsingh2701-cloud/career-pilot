# Testing Strategy

## Goals
Verify detection, matching, option selection, filling, document management, and safe non-action behavior. Test ambiguous and unsupported cases as deliberately as successful cases.

## Unit tests (Vitest)
- Label association, wrapping labels, names/IDs, placeholders, ARIA names/descriptions.
- Helper text, examples, fieldset/legend context.
- Hidden, disabled, read-only, required and unrelated controls.
- Radio/checkbox grouping.
- Exact/normalized/alias matches, conflicting evidence, missing values, ambiguity.
- Sensitive-field exclusions.
- Helper examples treated as context, not answers/options.
- Native option matching, disabled/placeholder options, no-match and multi-match behavior.
- Input/select/radio/checkbox updates and controlled-framework events.
- Stale/rerendered targets and partial failures.
- Profile CRUD, multiple documents, default uniqueness, Blob round-trip, validation, replacement/deletion, clear-all and migrations.

## Local fixture application
Create realistic fixtures for:
1. Basic HTML form.
2. Helper text, examples, and ARIA metadata.
3. Native selects, radio groups, checkboxes.
4. React-controlled inputs.
5. Dynamic fields and asynchronously populated options.
6. Resume and cover-letter file inputs.
7. Multi-section form with unrelated search/navigation controls.

Use synthetic data only.

## Browser/integration tests (Playwright)
- Open extension side panel and trigger detection.
- Verify extracted metadata/options.
- Review, edit, skip, and approve mappings.
- Confirm approved fields fill; unapproved/sensitive fields remain untouched.
- Select a stored document and test supported upload/fallback.
- Reload and verify persistence.
- Clear all data and verify every store is empty.
- Assert no form submission occurs.

Use local fixtures first; do not automate arbitrary third-party portals without a stable, permitted test environment.

## Manual compatibility matrix
Record browser version, portal/form type, feature tested, outcome, and limitations. Do not claim universal support based only on local fixtures.

## Milestone quality gates
Tests pass, typecheck/lint pass, failure states are exercised, privacy/security reviewed, and relevant docs updated before moving to the next milestone.
