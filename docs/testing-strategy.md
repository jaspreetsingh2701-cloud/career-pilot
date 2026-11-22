# Testing Strategy

## Goals
Verify detection, matching, option selection, filling, document management, and safe non-action behavior. Test ambiguous and unsupported cases as deliberately as successful cases.

## M1 foundation checks
- Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` locally and in CI.
- Load `.output/chrome-mv3` as an unpacked extension in Chrome; verify the side panel opens.
- Serve `tests/fixtures/local-page` on localhost and verify the side panel's ping reaches the content script and returns a visible status.
- Inspect the generated manifest: M1 must not request broad `host_permissions`; the content script is limited to localhost fixture URLs.

## Unit tests (Vitest)
- Website rules: valid/invalid domains, IPv4 and IPv6, duplicate/blank lines, exact IP matching, optional subdomains, empty/populated allowlist behavior, blocklist precedence, unsupported URL schemes, and persisted settings.
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
- Profile CRUD and persistence; custom field create/remove, alias preservation, older-profile compatibility, standard/custom candidate-value normalization; multiple documents, independent default uniqueness, Blob round-trip, file type/size validation, replacement/deletion, clear-all and migrations.
- UI regression: selected document type is preserved on import; default resume and default cover letter remain independent.
- Saved-answer copy preserves exact plain text; edit updates the existing record rather than creating a duplicate.
- Save/upload/copy success and failure states are announced through the accessible status region; dirty and busy states are accurate.
- Backup export/restore round-trip for profile, documents, saved answers, snippets and default flags; reject unsupported schema versions and invalid document metadata.
- Theme preference defaults to System, persists Light/Dark/System choices, and reacts to `prefers-color-scheme` changes in System mode.

## Local fixture application
Create realistic fixtures for:
1. Basic HTML form.
2. Helper text, examples, and ARIA metadata.
3. Native selects, radio groups, checkboxes.
4. React-controlled inputs.
5. Dynamic fields and asynchronously populated options.
6. Resume and cover-letter file inputs.
7. Multi-section form with unrelated search/navigation controls.
8. Custom dropdown/combobox widgets (ARIA listbox patterns).
9. Same-origin iframe form (spike only).
10. Resume-parse form: fields populated asynchronously after a file upload, some correct, some different, some empty.

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
- Pre-filled fixture: only empty fields fill; matching fields report "Already filled"; different values show a conflict and stay untouched.
- Race: fields populated between scan and fill are skipped and reported.
- Placeholder selects count as empty; selected options, set radios/checkboxes and attached files count as filled.
- Replace works only for the field the user opted in on; bulk approval never replaces.
- Scan snapshots never appear in logs or storage.
- Clipboard: copy a multi-paragraph snippet with blank lines, leading/trailing spaces, tabs, emoji and non-Latin text; read it back and assert it is byte-identical (CRLF normalized to LF).
- Placeholders: resolved values appear; unresolved placeholders are flagged and block a silent copy.
- Length limit and counters; blocked-clipboard fallback.
- Manual check: paste into the LinkedIn message box and post composer, a plain-text editor, and a rich editor; record results in the compatibility matrix.
- Export a backup, clear all data, import, and verify identical data.
- Complete first-run onboarding with name and email only.
- Accessibility: keyboard-only walkthrough of every side-panel screen, focus visibility, and an automated axe check.

Use local fixtures first; do not automate arbitrary third-party portals without a stable, permitted test environment.

## Manual compatibility matrix
Record browser version, portal/form type, feature tested, outcome, and limitations. Do not claim universal support based only on local fixtures.

## Milestone quality gates
Tests pass, typecheck/lint pass, failure states are exercised, privacy/security reviewed, and relevant docs updated before moving to the next milestone.
