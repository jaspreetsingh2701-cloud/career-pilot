# Technical Architecture

## Goals
Keep the MVP small, local-first, explainable, and testable. Separate extension UI, page inspection, orchestration, domain logic, and persistence. No backend or monorepo is required.

## Proposed stack
| Area | Choice | Purpose |
|---|---|---|
| Browser | Chrome Extension Manifest V3 | Extension platform |
| Tooling | WXT | Extension build and entrypoints |
| UI | React + TypeScript | Side panel |
| Styling | Tailwind CSS | UI styling |
| Small structured data | chrome.storage.local | Profile/preferences |
| Documents and collections | IndexedDB | Blob storage and indexed records |
| Unit tests | Vitest | Domain and repository tests |
| Browser tests | Playwright | Local fixtures and extension workflows |

Validate exact WXT conventions and browser API support during foundation setup.

## Components

### Side panel UI
Dashboard, profile editor, document library, saved answers, detected fields, mapping review, document selection, autofill results, history, and data deletion. It communicates with the content script through extension messaging rather than inspecting page DOM directly.

### Content script
Detect likely application forms; extract supported field metadata and native options; exclude unsuitable controls; receive only approved values; fill approved controls; attempt selected file assignment where supported; return structured outcomes.

### Background service worker
Coordinate side-panel/content-script messages, active-tab operations, permissions, storage access where appropriate, and explicit history actions. MV3 workers can be suspended; durable state must live in storage.

### Domain modules
Form detection, relevance filtering, field classification, mapping rules, confidence/evidence, option matching, autofill adapters, document upload, and history. Keep pure logic independent of React/browser APIs where possible.

### Storage
- chrome.storage.local: profile, preferences, small settings.
- IndexedDB: document Blobs, saved answers, application history.
- Repositories abstract storage APIs.
- No external data transfer in MVP.

## User flow
1. User opens a job form and CareerPilot side panel.
2. User clicks Detect Fields.
3. Content script scans likely application forms and returns metadata.
4. Mapping engine compares metadata with profile and saved answers.
5. Side panel displays suggestions, options, confidence, and reasons.
6. User selects resume/cover letter and approves values.
7. Only approved values are sent to the content script.
8. Content script fills supported controls and reports per-field results.
9. User reviews the page and submits manually.

## Messaging
Use typed, validated, discriminated-union messages such as:
- DETECT_FIELDS_REQUEST / DETECT_FIELDS_RESULT
- AUTOFILL_APPROVED_FIELDS_REQUEST / AUTOFILL_RESULT
- ASSIGN_SELECTED_DOCUMENT_REQUEST / DOCUMENT_ASSIGNMENT_RESULT

Include request IDs and structured errors. Validate sender, tab/frame context, payload shape, and approved field references. Never accept executable code from page content.

## Proposed structure
Adapt to WXT conventions; create modules incrementally rather than pre-creating empty files.

```text
career-pilot/
├── entrypoints/
│   ├── sidepanel/
│   │   ├── index.html
│   │   ├── main.tsx
│   │   └── App.tsx
│   ├── background.ts
│   └── content.ts
├── src/
│   ├── components/{layout,profile,documents,autofill,common}/
│   ├── features/{profile,documents,saved-answers,form-detection,field-mapping,autofill,application-history}/
│   ├── services/
│   ├── storage/
│   ├── types/
│   ├── utils/
│   └── styles/
├── tests/{unit,integration,fixtures}/
├── docs/
├── wxt.config.ts
├── package.json
└── tsconfig.json
```

## Permissions
Start with the minimum permissions needed. Likely candidates include storage, sidePanel, activeTab, scripting, and clipboardWrite (for copy), subject to implementation. Prefer user-initiated active-tab access; avoid broad all-sites host permissions unless justified. Review generated manifest permissions before release.

## Detection and mapping pipeline
Extract field identity/type, label, name/id, placeholder, accessible description, examples/helper text, group context, required/disabled/read-only/hidden state, and native option lists. Filter search/navigation, authentication, sensitive, hidden, and unrelated controls.

Mapping uses a controlled alias/rule catalogue and returns proposed target/value, confidence, evidence, and warnings. Any initial weights or thresholds are hypotheses; calibrate against fixture tests. A high score remains a suggestion, not authorization to fill.

## Option matching
Read actual native options; normalize labels/values; compare to user-provided values; use only unambiguous aliases; show the proposed choice. Leave unchanged when no safe match exists. Helper text such as "e.g. 10 years" is context, not an option. Custom dropdowns need dedicated adapters and tests.

## Autofill
Start with text, email, tel, URL, number, textarea, native select, radio, checkbox, and separately reviewed file inputs. Use appropriate native setters and bubbling input/change events for controlled frameworks where required. Revalidate targets before fill and return per-field outcomes. Never submit.

## Document upload limitations
Store Blob content in IndexedDB. The user explicitly selects a library document and approves its assignment. Programmatic assignment to input.files may work for standard inputs but is not universally accepted by portals/custom uploaders. Verify when possible and offer manual upload fallback.

## Clipboard
Copy runs in the side panel on a user click, using navigator.clipboard.writeText with plain text (normalize CRLF to LF, no trimming of blank lines or spaces). No content script is involved and nothing is inserted into any page. Add the clipboardWrite permission only if testing shows it is needed. Fallback: show the text selected in a read-only box for manual copy.

## Pre-filled forms
Some sites fill fields after a resume upload or social sign-in. Scan captures each field's current value (in memory only) and classifies it: empty or placeholder (fillable), already matching the profile (skip, "Already filled"), or different (conflict, default Keep). Before writing, the content script re-reads the live value and skips the field if it changed since the scan. Sign-in flows stay out of scope; CareerPilot works on the form after the user returns to it.

## Failure states
Distinguish detected/not detected; suggested/needs review/no safe match; filled/skipped/skipped (already filled)/changed since scan/failed/verification unavailable; upload assigned/unsupported/failed/manual action required. One field failure must not block independent approved fields.
