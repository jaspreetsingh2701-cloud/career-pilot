# MVP Roadmap

Build one milestone at a time. Each milestone includes implementation, tests, documentation updates, and a review. Work feature-by-feature: validate the logic with a thin token-based UI, then complete the visual-matching pass for that screen before moving on. Do not build every screen upfront or defer all visual refinement to the end.

## M1 — Extension foundation
WXT + React + TypeScript + Tailwind; Manifest V3 side panel; background/content entrypoints; typed message contracts; minimal permissions; design tokens in Tailwind; small shared UI primitives; ESLint, TypeScript, Vitest and GitHub Actions CI (lint, typecheck, unit tests, build).
**Exit:** production build succeeds; extension loads unpacked in Chrome; side panel opens; local fixture page messaging works; generated manifest permissions are reviewed; CI checks are green. No profile, detection, mapping, filling, or document workflows in M1.

### M1 implementation notes
- Tailwind theme values must come from `docs/design-tokens.md`; avoid one-off hex values in feature components.
- Shared primitives are deliberately small: Button, Badge, FieldRow, SectionHeader, Chip, Banner and TextInput.
- The initial content script is scoped to localhost fixture URLs only. This is a messaging smoke test, not a production host-permission decision.
- Keyboard focus, disabled states, minimum 44px controls and reduced-motion preferences are foundational component requirements.

## M2 — Profile and document library
Profile CRUD; multiple resumes/cover letters and role variants; IndexedDB Blob storage; independent default resume/cover letter; saved answers; message snippets with plain-text copy; first-run onboarding; versioned backup export/import; clear-local-data. Appearance preferences are included in M2: Light, Dark, and System (default), persisted locally.

### M2 implementation notes
- Keep profile and appearance preferences in `chrome.storage.local`; keep document Blobs, document metadata, saved answers, and message snippets in IndexedDB.
- Validate imported document type and size (PDF, DOC, DOCX; 5 MB per document). Backups are versioned JSON and remain on the user's device.
- Theme uses semantic CSS variables and Tailwind class-based dark mode. System mode follows `prefers-color-scheme` and reacts to operating-system changes.
- Do not introduce account, cloud, remote AI, or network persistence.
**Exit:** profile and library data persist across reloads; only one default per document type; document replacement/deletion and selection are tested; backup round-trip restores profile, documents, answers, snippets, and defaults; theme preference persists and system mode follows OS changes.

### M2.2 — Documents-first workflow and library UX
Documents is the first side-panel section and the entry point to application preparation. Users import and manage resumes/cover letters, select a document for the file-upload step, then populate remaining fields from their saved profile and answers. Do not parse resumes into profile data. Add country-code selection, floating auto-dismiss status toasts, compact saved-answer table with truncated previews, exact plain-text clipboard preservation, and document rename/download actions.
**Exit:** document-first navigation is the default; rename changes display metadata only; download returns the original file; country code persists; toasts auto-dismiss accessibly; answer table truncates visually without altering stored text; clipboard tests preserve whitespace and line breaks exactly.

## M2.1 — Profile flexibility and UX polish
Typed TypeScript catalogue for standard profile fields; UI-managed custom fields with label, value, type, aliases and section; shared standard/custom candidate-value adapter; backward-compatible profile and backup handling; preserve selected document type on upload; saved-answer copy/edit/delete; clear accessible save/upload/copy feedback and dirty/busy states.
**Exit:** unit tests cover candidate-value normalization and legacy profiles; local smoke test verifies custom field persistence and backup round-trip, separate resume/cover-letter defaults, saved-answer actions, and visible status feedback.

## M3 — Form detection, metadata and website access rules
Detect application forms on explicit user action; inspect supported controls and extract labels, names, IDs, placeholders, examples, helper text, ARIA metadata and native options; filter hidden, disabled and sensitive controls; keep scan values transient. Add locally stored domain/IP allowlists and blocklists, exact IP matching, optional domain subdomain matching, and blocklist precedence. Use activeTab + scripting for user-initiated page injection; do not add broad host permissions. Custom dropdowns and same-origin iframe handling remain follow-up spikes.
**Exit:** fixture tests verify metadata and exclusions; access-rule tests cover validation, exact IPs, subdomains, allowlist behavior, blocklist precedence and unsupported URL schemes; scanning occurs only after a user click and only when the active URL passes local rules. No fields are filled yet.
Detect likely application forms; inspect input, textarea, select, radio, checkbox, and file controls; extract labels, names, IDs, placeholders, examples, helper text, ARIA, grouping, and native options; filter unrelated/sensitive fields; fixtures for custom dropdowns (e.g. combobox patterns) in addition to native controls; capture current values and classify empty/placeholder/matching/different; time-boxed spike on same-origin iframes.
**Exit:** fixtures verify metadata and exclusion; no fields are filled yet.

## M4 — Mapping and option matching
Deterministic explainable matching from detected metadata to standard/custom profile values and saved answers. Return confidence, evidence, alternatives and conservative statuses. Match native select/radio options only when there is one unique enabled option. Ambiguous, weak, and no-match cases require review and are never silently selected.
**Exit:** exact, normalized, alias, saved-answer, native-option, ambiguous, and no-match cases covered by unit tests. M4 never writes to the page or approves a mapping.

## M5 — Autofill engine
Approved text/textarea/select/radio/checkbox filling; controlled-input events; target revalidation; per-field results and verification; partial-failure handling; compare-before-write and conflict handling. The first implementation slice adds a guarded content-side fill primitive and typed message contract; the side-panel review/approval UI and fixture integration remain required before M5 exit.
**Current implementation:** side-panel review/edit/approve/skip flow is wired to the content handler; approvals are tied to the scanned tab; sensitive metadata is excluded; existing values are preserved unless replacement is explicitly enabled per field; results are shown per field. Radio/checkbox grouping and browser-automated extension E2E remain follow-ups.
**Exit:** browser fixture tests prove approved fields fill only; unapproved/sensitive fields remain untouched; stale and conflict cases are reported; controlled inputs work in a real browser; no submission occurs.

## M6 — Document upload
Detect file inputs; match context/accepted types; select library document; explicit approval; attempt assignment; verify and provide manual fallback.
**Exit:** supported fixture upload works; unsupported behavior is reported accurately.

## M7 — History, hardening and release
User-confirmed local history; migration/clear-data tests; Playwright integration; accessibility, security, permissions, performance review; packaging, Chrome Web Store submission per the release process, and compatibility matrix.
**Exit:** product acceptance criteria met; tests/typecheck/lint/build pass; known limitations documented.

A usable personal beta may be possible once profile, detection, mapping, and autofill are integrated. Do not defer privacy, permissions, or storage tests to the final milestone.
