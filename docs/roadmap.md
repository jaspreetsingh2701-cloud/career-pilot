# MVP Roadmap

Build one milestone at a time. Each milestone includes implementation, tests, documentation updates and review. The UI-after-logic approach remains intentional: validate feature logic with a thin token-based UI, then complete the visual pass before moving on.

## M1 — Extension foundation
WXT + React + TypeScript + Tailwind; Manifest V3 side panel; background/content entrypoints; typed messaging; minimal permissions; shared UI primitives; ESLint, TypeScript, Vitest and GitHub Actions CI.
**Exit:** production build succeeds; extension loads unpacked; side panel opens; local fixture messaging works; generated manifest permissions are reviewed; CI is green.

## M2 — Profile and document library
Profile CRUD; multiple resumes/cover letters and role variants; IndexedDB Blob storage; independent defaults; saved answers; message snippets; onboarding; backup export/import; clear-local-data; Light/Dark/System preferences.
**Exit:** profile/library persistence, document operations, backup round-trip and theme behavior are tested.

### M2.1 — Profile flexibility and UX polish
Typed standard-field catalogue; UI-managed custom fields; shared standard/custom candidate adapter; backward-compatible profile handling; saved-answer actions and accessible feedback.
**Exit:** candidate normalization, legacy profile behavior and key library actions are covered by tests.

### M2.2 — Documents-first workflow and library UX
Documents is the first side-panel section. Users manage documents, then populate remaining fields from profile and saved answers. Do not parse resumes into profile data. Country-code selection, accessible toasts, compact answer table, exact plain-text clipboard preservation and document rename/download.
**Exit:** document-first navigation, country-code persistence, rename/download and clipboard preservation are verified.

## M3 — Form detection and website access rules
Detect supported controls after explicit user action; extract available labels, names, IDs, placeholders, examples, helper text, ARIA metadata and native options; filter hidden, disabled and sensitive controls; keep scan values transient. Add local domain/IP allow/block rules and activeTab + scripting for user-initiated injection. Custom widgets, shadow DOM, iframe handling, fieldset/legend context and richer accessible-name resolution remain follow-ups.
**Exit:** fixture tests verify metadata/exclusions; access-rule tests cover validation and precedence; scanning occurs only after a user click and local rules permit it.

## M4 — Deterministic mapping
Match detected metadata to standard/custom profile values and saved answers; return confidence, evidence, alternatives and conservative statuses. Match native options only when a unique enabled option exists.
**Exit:** exact, normalized, alias, saved-answer, option, ambiguous and no-match cases have unit coverage. Mapping never writes to the page.

## M5 — Review and guarded autofill
Side-panel review/edit/approve/skip; approvals tied to scanned tab; per-field replacement opt-in; content-side target revalidation; per-field results; no-submit behavior.
**Implemented:** text-like inputs, textareas and native selects. Radio/checkbox controls remain gated pending group semantics.
**Exit:** browser fixture tests prove approved-only filling, sensitive exclusions, stale/conflict behavior, controlled-input support and no submission.

## M5.1 — Safety and reliability hardening
Remove runtime message/sender/page-metadata logging; guard content listener registration against repeated injection; include the selected phone country code in normalized phone candidates; use lockfile-based CI installation; align documentation with actual implementation.
**Exit:** phone candidate tests pass; CI uses npm ci and passes lint, typecheck, unit tests and production build; runtime handlers do not log page or form data. Backup schema validation and coordinated rollback across chrome.storage.local and IndexedDB remain open.

## M6 — Document upload
Detect file inputs; match context/accepted types; select library document; explicit approval; attempt assignment; verify and provide manual fallback.
**Exit:** supported fixture upload works; unsupported behavior is reported accurately.

## M7 — History, hardening and release
User-confirmed local history; migration/clear-data tests; Playwright integration; accessibility, security, permissions and performance review; packaging, Chrome Web Store preparation and compatibility matrix.
**Exit:** acceptance criteria met; tests/typecheck/lint/build pass; known limitations documented.

Do not claim universal portal compatibility based only on local fixtures. Do not defer privacy, permissions or storage tests to the final milestone.
