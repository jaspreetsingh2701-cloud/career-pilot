# Security and Privacy

## MVP privacy promise
Profile data, documents, saved answers and preferences stay in the browser profile. The MVP has no backend, cloud sync, remote LLM or third-party analytics transmission. Verify this promise against actual permissions, dependencies, network behavior and release configuration.

## Data minimization
- Scan only after an explicit user action.
- Inspect only supported form controls and necessary field metadata.
- Do not retain full page HTML, unrelated browsing activity or unrelated form values.
- Send only individually approved values to the content script.
- Keep scan data transient; never log or persist page values.

## Sensitive controls
Never autofill passwords, OTPs, payment-card, bank-account or authentication controls. Treat government identifiers, demographic/equal-opportunity answers, legal attestations and work-authorization declarations as sensitive; exclude by default and do not infer answers. Detection and fill-time checks both apply sensitive-field filters. Do not bypass CAPTCHA, authentication, access controls or site security.

## Extension permissions
- The manifest requests storage, sidePanel, activeTab, scripting and clipboardWrite; no broad host_permissions are declared.
- Form detection starts from an explicit side-panel action. CareerPilot checks local allow/block rules, then uses temporary activeTab access for current-tab injection.
- Static content-script matches are limited to localhost fixture origins; explicit user-initiated injection is a separate flow.
- Profile/preferences use chrome.storage.local; documents and reusable collections use IndexedDB. No data is sent to a server.
- Review the generated Manifest V3 manifest before release.

## Messaging and DOM safety
- Validate sender context and message type before handling content-script messages.
- Never evaluate page-provided strings or execute code received from content.
- Treat labels, option text, URLs and metadata as untrusted.
- Revalidate field references before filling because pages may rerender.
- Content-side filling re-queries the DOM, checks target identity and live values, and never submits.
- Content listener registration is guarded against repeated injection in the same isolated world.
- Runtime handlers must not log messages, sender details, field values or page metadata.
- Existing values are preserved by default. Replacement is an explicit per-field opt-in.

## Backup and restore
The current schema-version-1 backup contains profile, answers, snippets and document metadata/content. Import validation and coordinated rollback across chrome.storage.local and IndexedDB remain open work; do not describe restore as atomic.

## User control
Detection, autofill and document assignment are explicit actions. Never submit forms automatically. Provide clear-all-data and distinguish filling from submission.
