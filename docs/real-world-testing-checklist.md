# Real-World Testing Checklist

This checklist is the manual acceptance record for CareerPilot. It is intentionally separate from the automated testing strategy. Complete it after the relevant features are implemented, first against the local fixture and then against real application forms where testing is permitted.

## How to use this checklist

- Use synthetic profile data for local testing. Avoid real personal, financial, identity or employment-sensitive information wherever possible.
- Test on a disposable browser profile or export a backup before destructive storage/restore tests.
- Record browser version, extension build/commit, website category, date, expected result, actual result and pass/fail.
- Do not submit job applications during testing. CareerPilot must never submit forms.
- Do not test against portals where automation/testing is prohibited. Do not attempt CAPTCHA, login or access-control bypass.
- A passing local fixture does not establish compatibility with every third-party portal.

Suggested result format:

| Test ID | Result (Pass/Fail/Blocked) | Notes / evidence |
| --- | --- | --- |
| T01 | | |

## A. Installation, permissions and startup

- [ ] **T01 — Load extension:** Build with `npm run build`, load `.output/chrome-mv3` as an unpacked extension and confirm it loads without errors.
- [ ] **T02 — Side panel opens:** Open the extension side panel and verify the four main sections render.
- [ ] **T03 — Minimal permissions:** Inspect the generated manifest and confirm only documented permissions/host access are present.
- [ ] **T04 — No automatic scan:** Open a page with a form. Confirm CareerPilot does not scan until Detect fields is clicked.
- [ ] **T05 — Unsupported browser page:** Try detection on a restricted browser page such as chrome://. Confirm a clear, non-crashing error.

## B. Website allowlist and blocklist

- [ ] **T06 — Empty rules:** With both lists empty, confirm otherwise-supported HTTP(S) pages can be scanned after explicit action.
- [ ] **T07 — Allowlist:** Add one domain and confirm it is eligible while a different domain is blocked.
- [ ] **T08 — Blocklist precedence:** Add the same domain to both lists and confirm blocklist wins.
- [ ] **T09 — Subdomains enabled:** Add a domain and confirm its subdomain is eligible when include-subdomains is enabled.
- [ ] **T10 — Subdomains disabled:** Disable include-subdomains and confirm only the exact domain matches.
- [ ] **T11 — Exact IP:** Add an IPv4 and IPv6 address and confirm exact matching only; no CIDR behavior is expected.
- [ ] **T12 — Invalid rule:** Enter a URL/path/port or malformed host and confirm validation rejects it with useful feedback.
- [ ] **T13 — Persistence:** Save rules, close/reopen the side panel and confirm they persist.

## C. Detection and field metadata

- [ ] **T14 — Text inputs:** Detect text, email, telephone, URL and number fields in the fixture.
- [ ] **T15 — Textarea:** Detect a textarea and verify its current value and label are represented.
- [ ] **T16 — Native select:** Detect a select and inspect its available options.
- [ ] **T17 — Required metadata:** Confirm required controls are identified as mandatory.
- [ ] **T18 — Existing value:** Confirm a prefilled field is detected and its current value is visible in review.
- [ ] **T19 — Password exclusion:** Confirm password fields are excluded from suggestions/fill.
- [ ] **T20 — OTP exclusion:** Confirm one-time-code fields are excluded.
- [ ] **T21 — Disabled/read-only/hidden:** Confirm these controls are not offered for filling.
- [ ] **T22 — Repeat scan:** Scan twice and confirm no duplicate content listeners or duplicate field cards appear.
- [ ] **T23 — Blocked site:** Confirm a blocked domain cannot be scanned even when detection is clicked.

## D. Mapping and review

- [ ] **T24 — Exact match:** Use a field label matching a profile field and confirm the expected suggestion.
- [ ] **T25 — Alias match:** Use an alias for a custom profile field and confirm the expected suggestion.
- [ ] **T26 — Saved-answer keyword:** Use a saved-answer keyword and confirm the correct answer is suggested.
- [ ] **T27 — Ambiguous match:** Create two plausible sources and confirm ambiguity is visible and not silently approved.
- [ ] **T28 — No suggestion:** Confirm a field without a matching source remains editable and is not pre-approved.
- [ ] **T29 — Edit suggestion:** Edit a proposed value and confirm the edited value is what gets filled after approval.
- [ ] **T30 — Skip field:** Leave a field unapproved and confirm it is not changed.
- [ ] **T31 — Tab change:** Scan one tab, switch to another tab and try filling. Confirm CareerPilot asks for a rescan.
- [ ] **T32 — Review compactness:** Confirm field cards use a single-line value editor by default and do not consume excessive vertical space.
- [ ] **T33 — Required/optional grouping:** Confirm mandatory fields appear in their own section with filled and empty counts.
- [ ] **T34 — Optional unmatched collapsed:** Confirm optional fields without suggestions are hidden inside a collapsed section by default and can be expanded.
- [ ] **T35 — Safety tooltip:** Confirm the information icon reveals the approval/replacement explanation on hover/focus, without persistent explanatory text taking up space.
- [ ] **T36 — No repeated match explanation:** Confirm the same long match-reason sentence is not repeated across every field card.
- [ ] **T37 — Fill action placement:** Confirm Fill approved fields remains visible at the bottom of the review area while scrolling through a long form.
- [ ] **T38 — No suggestions and no approvals:** Confirm the fill action is disabled when no fields are approved.

## E. Guarded autofill and conflict handling

- [ ] **T39 — Approved field only:** Approve one field and confirm only that field changes.
- [ ] **T40 — Unapproved field:** Keep another suggested field unapproved and confirm it remains unchanged.
- [ ] **T41 — Preserve existing value:** Confirm a prefilled field is not overwritten by default.
- [ ] **T42 — Explicit replacement:** Enable Replace existing for a prefilled field, approve it and confirm replacement occurs only then.
- [ ] **T43 — Already filled:** Fill a field with the same value and confirm the result reports already-filled.
- [ ] **T44 — Stale target:** Change/remove a field after scanning and confirm it is not filled.
- [ ] **T45 — Changed control:** Change the target element/control type after scanning and confirm it is rejected safely.
- [ ] **T46 — Disabled/read-only at fill time:** Change a field to disabled/read-only after scanning and confirm it is not filled.
- [ ] **T47 — No submission:** Confirm filling never clicks Submit, Next, Apply or other form action buttons.
- [ ] **T48 — Page remains reviewable:** Confirm the user can inspect the page and submit manually after filling.

## F. Unsupported controls and phone values

- [ ] **T49 — Radio controls:** Confirm radio controls are not accidentally treated as independent text fields or filled. Group semantics are not implemented yet.
- [ ] **T50 — Checkbox controls:** Confirm checkbox controls are not accidentally approved/filled. Group semantics are not implemented yet.
- [ ] **T51 — India phone:** Confirm a +91 country code is composed exactly once.
- [ ] **T52 — Other country code:** Confirm a non-India country code is composed correctly.
- [ ] **T53 — Existing international phone:** Confirm a value already containing the country code does not receive a duplicate code.
- [ ] **T54 — Phone conflict:** Confirm a prefilled phone value is preserved unless replacement is explicitly selected.

## G. Profile, documents and saved data

- [ ] **T55 — Profile persistence:** Update/save profile, reopen side panel and confirm values persist.
- [ ] **T56 — Custom fields CRUD:** Add, edit and remove a custom field; save and reload profile.
- [ ] **T57 — Document upload:** Upload a supported PDF/DOC/DOCX within the size limit.
- [ ] **T58 — Multiple documents:** Add multiple resumes and confirm they remain separately available.
- [ ] **T59 — Separate defaults:** Set resume and cover-letter defaults independently.
- [ ] **T60 — Download/rename:** Rename and download a document; verify filename and contents.
- [ ] **T61 — Saved answers CRUD:** Add, edit, copy and delete a saved answer.
- [ ] **T62 — Snippet whitespace:** Copy a message snippet and verify line breaks and whitespace are preserved exactly.
- [ ] **T63 — Clear local data:** Clear all local data and confirm profile, library, saved answers and snippets are removed.

## H. Backup and restore

- [ ] **T64 — Export:** Export a backup and confirm the file is downloaded and contains expected data.
- [ ] **T65 — Valid restore:** Restore a valid backup and confirm profile and library data return.
- [ ] **T66 — Malformed backup:** Try malformed JSON and confirm restore fails with an understandable message.
- [ ] **T67 — Unsupported version:** Try an unsupported backup version and confirm it is rejected safely.
- [ ] **T68 — Restore failure safety:** Test failure during restore using disposable data. Verify whether the prior state is preserved. Coordinated rollback across Chrome storage and IndexedDB is a known pending hardening item; record the observed behavior rather than assuming atomicity.

## I. Real-world portal compatibility

For each permitted portal tested, record the portal category (ATS, company careers site, job board, etc.), browser version, field types, whether labels were detected, mapping accuracy, controlled-input behavior, conflicts, and any unsupported controls.

- [ ] **T69 — Simple application form:** Test a permitted form with common text inputs and a textarea.
- [ ] **T70 — Native dropdowns:** Test required and optional native select controls.
- [ ] **T71 — Prefilled form:** Test fields that already contain values and verify replacement safeguards.
- [ ] **T72 — React-controlled fields:** Verify the visible page state updates after filling controlled inputs.
- [ ] **T73 — Dynamic form:** Test a form where fields appear after a user action; rescan and verify stale targets are not reused.
- [ ] **T74 — Label variations:** Test labels, placeholders and accessible names that differ from the profile field names.
- [ ] **T75 — Long application:** Confirm review remains compact and the fill action remains accessible with many fields.
- [ ] **T76 — Manual review:** Verify all values on the page before any manual submission.

## J. Automated quality gate

Run from the repository root:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

- [ ] **T77 — Lint:** Pass.
- [ ] **T78 — Typecheck:** Pass.
- [ ] **T79 — Unit tests:** Pass.
- [ ] **T80 — Production build:** Pass.
- [ ] **T81 — Console/privacy check:** No unexpected page/form values or runtime metadata are logged.
- [ ] **T82 — Network/privacy check:** No profile, document, answer or form data is transmitted to an unexpected remote service.

## Known limitations to keep visible during testing

- Radio/checkbox group semantics are not implemented; controls should remain gated.
- File-input attachment from the document library is a later milestone; download and manual upload remain the current workflow.
- Playwright extension E2E setup is not yet present.
- Rich label resolution (for example fieldset/legend and ARIA-labelledby), custom widgets, iframe/shadow DOM coverage and broad portal compatibility remain incomplete.
- Backup schema validation and coordinated rollback across Chrome storage and IndexedDB remain open.
- A green CI run does not replace manual Chrome testing.
