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
- Minimal permissions and data collection.

## Functional requirements

### FR-01 Candidate profile
- Create, view, edit, and clear a local profile.
- Support name, contact details, experience, current role/company, compensation, notice period, location, and professional links.
- Keep optional values optional; never fabricate missing information.

### FR-02 Document library
- Import and store multiple resumes and cover letters locally.
- Rename, categorize, replace, and delete documents.
- Mark a default resume and default cover letter independently.
- Support role-specific variants (e.g. frontend engineer, engineering lead).
- Select a specific resume and cover letter per application.
- Show selected file names before attempting upload; require explicit user approval.

### FR-03 Saved answers
- Create, edit, and delete reusable answers to common application questions.
- Associate answers with keywords/categories.
- Treat answers as suggestions; allow review/edit per application.
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

## Non-functional requirements
- Privacy: no backend, cloud sync, remote LLM, or personal-data telemetry.
- Security: validate file types/sizes, validate messages, safely render untrusted text.
- Reliability: partial failures must not corrupt unrelated fields or stored records.
- Usability/accessibility: keyboard-operable UI, visible focus, clear status and error feedback.
- Maintainability: isolate detection, mapping, filling, storage, and UI logic.
- Performance: keep scanning/mapping responsive on typical application forms.

## Out of scope
AI answer generation, JD analysis/resume scoring, cloud accounts/sync, backend, automatic submission, CAPTCHA/access-control bypass, authentication automation, guaranteed support for every portal/iframe/shadow DOM/custom widget, mass application automation.

## Acceptance criteria
1. Profile persists across reloads and can be edited/deleted.
2. Multiple resumes/cover letters can be stored, defaulted, and selected per application.
3. Saved answers can be reused and edited.
4. Detection exposes labels, metadata, examples/helper text, and native options on fixture forms.
5. User can review, edit, skip, and approve mappings/options.
6. Approved text/select/radio/checkbox fields fill without submitting.
7. File upload succeeds on supported fixtures or reports a clear fallback.
8. All user data remains local and can be cleared.

## Confirmed decisions
CareerPilot name; Chrome Manifest V3; local-only MVP; no AI/backend/cloud; multiple documents; metadata-aware detection and option matching; user approval; no auto-submit.

## To validate
Supported file formats and size limits, exact profile schema, application-history opt-in behavior, minimum Chrome version, and backup/export format.
