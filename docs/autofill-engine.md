# M5 Autofill Review and Execution

## User flow
1. Open a supported application form and click **Detect fields on active tab**.
2. CareerPilot checks the locally configured website rules and scans the active tab.
3. The mapping engine proposes profile or saved-answer values with confidence and evidence.
4. Review each detected field. Edit the proposed value where needed; ambiguous/no-match fields require manual input.
5. Explicitly approve only the fields to fill. Existing values are preserved by default.
6. Enable **Replace existing value** only for an individual field when replacement is intended.
7. Click **Fill approved fields**. Review per-field outcomes and verify the page yourself.
8. Submit the application manually.

## Safety behavior
- Scanning does not write to the page.
- Only individually approved fields are sent to the content script.
- Approval is bound to the scanned tab and URL; switching tabs requires a new scan.
- Sensitive metadata (passwords, OTPs, payment/bank details, government identifiers, demographic answers, legal attestations and work authorization) is excluded during detection.
- The content script accepts messages from this extension only.
- The fill engine rechecks the live element's position, tag, name and ID, then re-reads its current value immediately before writing.
- Existing different values are reported as conflicts and kept unchanged unless that field has explicit replacement approval.
- Matching values are reported as already filled.
- Disabled, read-only, sensitive, stale and unsupported controls are not changed.
- No submit button is clicked and no form is submitted.

## Supported controls in this integration
Text-like inputs, textareas and native selects. Radio/checkbox inputs are detected for visibility but are not approvable until grouped-control semantics are implemented. Custom widgets, shadow DOM, iframes and dynamic control adapters remain unsupported.

## Result statuses
`filled`, `already-filled`, `conflict`, `stale`, `unsupported`, `failed`, and `not-approved`.

## Validation
Unit tests cover approval, preservation/replacement, stale identity, sensitive controls, native option validation, events and no-submit behavior. Use the local synthetic application fixture for a Chrome smoke test. Real-browser testing of framework-controlled inputs and automated extension E2E remain release gates; do not infer universal portal compatibility from the local fixture.
