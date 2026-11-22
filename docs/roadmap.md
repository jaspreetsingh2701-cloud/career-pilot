# MVP Roadmap

Build one milestone at a time. Each milestone includes implementation, tests, documentation updates, and a review.

## M1 — Extension foundation
WXT + React + TypeScript + Tailwind; Manifest V3 side panel, background/content entrypoints, basic navigation, typed messaging, minimal permissions, lint/typecheck/test setup, GitHub Actions CI (lint, typecheck, unit tests, build).
**Exit:** builds and loads unpacked in Chrome; side panel opens; local page messaging works; permissions reviewed.

## M2 — Profile and document library
Profile CRUD; multiple resumes/cover letters; IndexedDB Blob storage; defaults; role variants; per-application document choice; saved answers; message snippets with copy-to-clipboard; first-run onboarding; backup export/import; clear-local-data.
**Exit:** persistence, default uniqueness, replace/delete and document selection are tested; backup round-trip restores identical data on a clean profile.

## M3 — Form detection and metadata
Detect likely application forms; inspect input, textarea, select, radio, checkbox, and file controls; extract labels, names, IDs, placeholders, examples, helper text, ARIA, grouping, and native options; filter unrelated/sensitive fields; fixtures for custom dropdowns (e.g. combobox patterns) in addition to native controls; capture current values and classify empty/placeholder/matching/different; time-boxed spike on same-origin iframes.
**Exit:** fixtures verify metadata and exclusion; no fields are filled yet.

## M4 — Mapping and option matching
Profile aliases, evidence/confidence, saved-answer matching, native option matching, manual mapping/edit/approve/skip, conservative ambiguity handling.
**Exit:** exact, normalized, ambiguous, and no-match cases covered; uncertain suggestions are never silently selected.

## M5 — Autofill engine
Approved text/textarea/select/radio/checkbox filling; controlled-input events; target revalidation; per-field results and verification; partial-failure handling; compare-before-write and conflict handling.
**Exit:** fixtures fill approved fields only; excluded fields stay untouched; no submission occurs.

## M6 — Document upload
Detect file inputs; match context/accepted types; select library document; explicit approval; attempt assignment; verify and provide manual fallback.
**Exit:** supported fixture upload works; unsupported behavior is reported accurately.

## M7 — History, hardening and release
User-confirmed local history; migration/clear-data tests; Playwright integration; accessibility, security, permissions, performance review; packaging, Chrome Web Store submission per the release process, and compatibility matrix.
**Exit:** product acceptance criteria met; tests/typecheck/lint/build pass; known limitations documented.

A usable personal beta may be possible once profile, detection, mapping, and autofill are integrated. Do not defer privacy, permissions, or storage tests to the final milestone.
