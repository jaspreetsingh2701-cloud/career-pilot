# M5 Autofill Review and Execution

## User flow
1. Open a supported application form and click **Detect fields on active tab**.
2. CareerPilot checks local website rules and requests current-tab access through Chrome's explicit user-action permission flow.
3. The mapping engine proposes profile or saved-answer values with confidence and evidence.
4. Review and edit proposed values; ambiguous/no-match fields require manual input.
5. Explicitly approve only fields to fill. Existing values are preserved by default.
6. Enable **Replace existing value** only for an individual field when replacement is intended.
7. Click **Fill approved fields**, review per-field outcomes and verify the page yourself.
8. Submit the application manually.

## Safety behavior
- Scanning does not write to the page.
- Only individually approved values are sent to the content script.
- Approval is bound to the scanned tab and URL.
- Sensitive metadata is filtered during detection and checked again before filling.
- The content listener is guarded against repeated injection in the same isolated world.
- Runtime handlers do not log message payloads, sender details, scan values or page metadata.
- Filling rechecks target position, tag, type, name, ID and live value.
- Different existing values are kept unless per-field replacement is approved.
- No submit button is clicked and no form is submitted.

## Supported controls
Text-like inputs, textareas and native selects. Radio/checkbox inputs are not approvable until grouped-control semantics are implemented. Custom widgets, shadow DOM, iframes and dynamic control adapters remain unsupported.

## Phone values
The normalized phone candidate combines the selected country calling code with the local number. A country code already present in the phone value is not duplicated.

## Validation
Unit tests cover approved filling, preservation/replacement, stale identity, sensitive controls, native option validation, events, no-submit behavior and phone country-code composition. Real Chrome permission checks, framework-controlled inputs and automated extension E2E remain release gates.
