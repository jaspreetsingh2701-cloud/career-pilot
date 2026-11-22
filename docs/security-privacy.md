# Security and Privacy

## MVP privacy promise
Profile data, documents, saved answers, preferences, and history stay in the browser profile. The MVP has no backend, cloud sync, remote LLM, or third-party analytics transmission. Verify this promise against actual permissions, dependencies, network behavior, and release configuration.

## Data minimization
- Scan only after an explicit user action.
- Inspect only likely application forms and necessary field metadata.
- Do not retain full page HTML, unrelated browsing activity, or unrelated form values.
- Send only approved values to the content script.
- Keep scan data transient, including snapshots of values the site already holds; never log or persist them.

## Sensitive controls
Never autofill passwords, OTPs, payment-card, bank-account, or authentication controls. Treat government identifiers, demographic/equal-opportunity answers, legal attestations, and work-authorization declarations as sensitive; exclude by default and do not infer answers. Do not bypass CAPTCHA, authentication, access controls, or site security.

## File safety
- Validate file type and size at import.
- Render filenames and page metadata as text, never HTML.
- Keep file content in IndexedDB and never transmit it in MVP.
- Require explicit document selection and upload approval.
- Provide deletion and clear failure/fallback feedback.

## Extension permissions
- M1 requests only `storage`, `sidePanel`, and `activeTab`; no broad `host_permissions` are declared.
- Profile and appearance preference use `chrome.storage.local`; documents and reusable collections use IndexedDB. No data is sent to a server.
- Imported documents are restricted to PDF, DOC, or DOCX and 5 MB per file. Backup restore validates the schema and document metadata before replacing local records.
- The M1 content script is restricted to localhost fixture origins to validate the message path without requesting access to arbitrary sites.
- Revisit content-script injection and any additional permission only when implementing user-initiated detection in M3; document the rationale before changing the manifest.
- Avoid broad all-sites host permissions unless justified. Explain optional permission prompts.
- Review the generated Manifest V3 manifest before release.

## Messaging and DOM safety
- Validate sender, tab/frame context, request ID, message type, and payload schema.
- Never evaluate page-provided strings or execute code received from content.
- Treat labels, option text, URLs, and metadata as untrusted.
- Revalidate field references before filling because pages may rerender.
- Avoid unsafe HTML insertion.

## Clipboard
Copy happens only on an explicit click. Do not read the clipboard, do not log copied text, and do not auto-insert text into pages. Remind users that other apps can read the clipboard.

## User control
Detection, autofill, and document assignment are explicit actions. Show values and filenames before use. Never submit forms automatically. Provide clear-all-data and distinguish filling from submission.

## Release checklist
- [ ] Manifest permissions reviewed.
- [ ] No personal/document data sent remotely.
- [ ] No sensitive values in logs.
- [ ] File validation and untrusted text rendering tested.
- [ ] Message schemas and sender contexts validated.
- [ ] Sensitive fields excluded by tests.
- [ ] Clear-all-data covers IndexedDB and chrome.storage.local.
- [ ] Dependencies reviewed.
- [ ] Store privacy disclosures match actual behavior.
