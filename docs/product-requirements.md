# Product Requirements

## Purpose
CareerPilot reduces repetitive job-application data entry while keeping the applicant in control. The MVP is a local-first Chrome extension; no backend, cloud sync, or remote AI service is included.

## Target user and problem
Job seekers repeatedly enter contact, experience, compensation, availability, and document information across different career portals. Field wording and controls vary, making manual completion slow and error-prone.

## Product principles
- Local-first: profile, documents, saved answers, preferences, and history stay on the device.
- Human approval: preview proposed values and approve before filling.
- Explainable: show match evidence and confidence; do not silently guess.
- Conservative: ambiguous or unsupported fields remain untouched.
- No auto-submit: the user reviews and submits the application.
- Never overwrite: values already on the page (typed by the user, parsed from a resume, or imported by the site) are kept unless the user explicitly replaces them per field.
- Minimal permissions and data collection.

## Functional requirements

### FR-01 Candidate profile
- Create, view, edit, and clear a local profile.
- Support name, contact details, experience, current role/company, compensation (with currency), notice period, location, and professional links.
- Support education entries, employment history entries, skills, languages, and job preferences (preferred role, work mode, willingness to relocate, notice-period negotiability).
- Store phone with country code; keep user-entered wording for compensation and notice period.
- Keep optional values optional; never fabricate missing information.
- Allow custom profile fields with a user-defined label, value type, value, optional section/description, and explicit matching aliases.
- Keep built-in profile field definitions in a typed TypeScript catalogue; store user-created fields with the local profile.
- Normalize built-in and custom profile values into the same candidate-source shape for future mapping; custom fields remain suggestions and require user approval.
- Custom profile fields are included in local backup/restore and remain compatible with older backups that do not contain them.

### FR-02 Document library
- Import and store multiple resumes and cover letters locally. Documents is the first section in the side panel and the starting point for application preparation.
- Rename, categorize, replace, and delete documents.
- Mark a default resume and default cover letter independently.
- Support role-specific variants (e.g. frontend engineer, engineering lead).
- Select a specific resume and cover letter per application.
- Show selected file names before attempting upload; require explicit user approval.
- Application workflow: choose/attach the resume first, then review and fill remaining application fields from the saved profile and answers. Resume upload never extracts into or modifies the profile.

### FR-03 Saved answers
- Create, edit, and delete reusable answers to common application questions.
- Associate answers with keywords/categories.
- Treat answers as suggestions; allow review/edit per application.
- Allow copying saved answers as plain text, with visible success or manual-copy fallback feedback.
- Never invent personal history, eligibility, or legal declarations.

### FR-04 Form detection and metadata
On user request, detect likely application forms and supported controls. Extract available:
- Tag/control type, id, name, placeholder.
- Associated label and accessible name/description (ARIA).
- Helper text, examples, nearby instructions.
- Fieldset/legend or local group context.
- Native select options and radio/checkbox labels and values.
- Required, disabled, read-only, hidden status.

Prioritize application forms; ignore unrelated search/navigation controls and exclude sensitive controls.

### FR-05 Mapping
- Use deterministic, explainable rules to map metadata to profile properties or saved answers.
- Consider labels, names, IDs, placeholders, examples, helper text, ARIA metadata, and nearby context.
- Show proposed source/value, confidence, and evidence.
- Allow manual mapping, editing, and skipping.
- Scale to large forms (dozens of fields): group by form section, filter by status, show an approved-of-total progress count, and offer per-section and global "approve all ready". Conflicts, no-match and excluded fields are never included in bulk approval.
- Do not fill ambiguous or unsafe matches.

### FR-06 Dropdown and option selection
- Inspect actual available options for native select, radio, and checkbox controls.
- Compare option labels/values with saved profile values and preferences.
- Normalize harmless case/whitespace differences; use only explicit, safe aliases.
- Do not mistake helper examples for selectable options or choose the first option by default.
- Show proposed selection for approval.
- If no safe match exists, leave unchanged and explain why.
- Custom and dynamically populated dropdowns are best-effort and need dedicated tests.

### FR-07 Autofill
- Preview proposed field/value pairs.
- User can approve individually or in bulk, edit, or skip.
- Fill only approved fields and verify results where possible.
- Fill only empty fields by default. Treat placeholder states (e.g. a select on "Select...") as empty.
- Skip fields whose current value already matches the profile (normalized) and report "Already filled".
- Show a conflict when the page holds a different value ("Site has X, profile has Y"). Default action is Keep; Replace is a separate per-field choice and is excluded from bulk approval.
- Re-read each field's live value immediately before writing; skip and report if it is no longer empty or changed since the scan.
- Sites may populate fields after a resume upload or social sign-in. Advise scanning after the form settles and show a "form changed, re-scan" notice when the page keeps mutating.
- Exclude passwords, OTPs, payment/bank fields, and other sensitive controls.
- Never click submit or submit forms.

### FR-08 Document upload
- Detect candidate resume/cover-letter file inputs using label, context, attributes, and accepted types.
- Let the user choose a stored document and confirm before assignment.
- Verify resulting input state where possible.
- Provide manual fallback if the browser/site blocks assignment. Compatibility is best-effort, not universal.

### FR-09 Application history
- Save a local record only when the user chooses to record an application or confirms submission.
- Store useful metadata (company, role, date, URL, selected document IDs, notes).
- Never infer submission from autofill success.

### FR-10 Local data controls
- Provide a clear-all-data workflow covering profile, documents, answers, preferences, and history.
- Disclose what is stored and where.
- Do not transmit personal or document data remotely in the MVP.

### FR-11 Backup and restore
- Export profile, saved answers, preferences, history and documents (including file content) to a single local file.
- Import validates schema version and file types/sizes; show a summary and require confirmation before overwriting existing data.
- No network transfer; the file is saved to the user's device.

### FR-12 First-run onboarding
- Explain the privacy model, collect minimum profile fields, optionally import a first resume.
- Detection is unavailable until the minimum profile exists, with a clear explanation.

### FR-13 Message snippets and clipboard
- Create, edit, tag and delete reusable messages (e.g. LinkedIn connection note, referral request, follow-up, recruiter reply).
- Optional placeholders such as {{recipient_name}} and {{company}}, filled in a small form before copying.
- "Copy" places the final text on the clipboard as plain text with line breaks, blank lines, spacing and emoji preserved exactly; no HTML or rich formatting.
- Show a live preview, character count and paragraph count, with an optional per-snippet length limit (for example for connection notes). Limits are user-editable because sites change them.
- Confirm with a visible "Copied" state; if the browser blocks clipboard access, show a select-all text fallback.
- CareerPilot only copies. It never types, pastes, posts or sends messages on LinkedIn or any other site.

## Non-functional requirements
- Privacy: no backend, cloud sync, remote LLM, or personal-data telemetry.
- Security: validate file types/sizes, validate messages, safely render untrusted text.
- Reliability: partial failures must not corrupt unrelated fields or stored records.
- Usability/accessibility: keyboard-operable UI, visible focus, clear status and error feedback.
- Maintainability: isolate detection, mapping, filling, storage, and UI logic.
- Performance: keep scanning/mapping responsive on typical application forms.
- Internationalization: validate phone formats with country code; ambiguous dates are shown in the user's own wording.

## Out of scope
AI answer generation, JD analysis/resume scoring, cloud accounts/sync, backend, automatic submission, CAPTCHA/access-control bypass, authentication automation, guaranteed support for every portal/iframe/shadow DOM/custom widget (same-origin iframes and open shadow DOM are a post-MVP spike), mass application automation.

## Acceptance criteria
1. Profile persists across reloads and can be edited/deleted.
2. Multiple resumes/cover letters can be stored, defaulted, and selected per application.
3. Saved answers can be reused and edited.
4. Detection exposes labels, metadata, examples/helper text, and native options on fixture forms.
5. User can review, edit, skip, and approve mappings/options.
6. Approved text/select/radio/checkbox fields fill without submitting.
7. File upload succeeds on supported fixtures or reports a clear fallback.
8. All user data remains local and can be cleared.
9. A backup file can be exported and restored on a clean profile with identical data.
10. First-run onboarding completes with only name and email provided.
11. Pre-filled fields are never overwritten without per-field opt-in; changed or filled fields are skipped and reported.
12. A snippet copied from CareerPilot pastes into LinkedIn and a plain-text editor with identical line breaks and blank lines; placeholders are replaced and unfilled ones are flagged before copying.
13. Custom profile fields persist across reloads and backup/restore, and are exposed alongside standard profile values through a shared candidate-value adapter.
14. Resume and cover-letter imports preserve the selected document type; each type can have its own independent default.
15. Upload, save, copy, and validation actions provide visible, accessible status feedback; profile save state distinguishes saving, saved, and unsaved changes.
16. Saved answers can be copied, edited, and deleted.
17. Documents is the first side-panel section; users can rename and download imported files without changing the original filename or file content.
18. Resume attachment and profile-field autofill are distinct user-approved steps; importing a resume never modifies profile data.

## Confirmed decisions
CareerPilot name; Chrome Manifest V3; local-only MVP; no AI/backend/cloud; multiple documents; metadata-aware detection and option matching; user approval; no auto-submit.

## To validate (proposed defaults, confirm before M2)
- File formats: PDF, DOC, DOCX; max 5 MB per file.
- Profile schema: as in the data model, extended with education, employment history, skills, languages, preferences.
- Application history: recorded only when the user chooses; default is off.
- Minimum Chrome version: decide after confirming side panel API support during M1.
- Backup format: versioned JSON with documents embedded as base64 (or a zip if size becomes a problem).
