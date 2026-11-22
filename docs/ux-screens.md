# UX and Screens

Surface: Chrome side panel. Keyboard-operable, visible focus, clear status text. Upload, save, copy, and validation feedback appears in a prominent live status/toast region. Document import displays selected filename, busy state, and result; document type selection controls the stored type.

## Screens
1. **Autofill (mapping review)**, designed for long forms: fixed header with progress ("12 of 28 approved") and status filters (All, Ready, Review, Conflict, Filled, Other); a scrolling list of compact rows grouped by form section, each with a checkbox, label, truncated value and status badge; tap a row to expand evidence, options, conflict choices and Edit/Skip; per-section "Approve ready"; fixed footer with "Approve all ready" and "Fill N approved". Footer states that CareerPilot never submits.
2. **Profile**: grouped editor (contact, experience, compensation, links, education, employment history, preferences), plus a custom-field editor for label, value, type, aliases, and optional section. Built-in fields are code-defined; custom fields are UI-managed. Save state is explicit (unsaved, saving, saved) and validation explains disabled actions.
3. **Documents**: library list with default badges, role variants, import/replace/rename/delete.
4. **Saved answers**: list, keywords/category, edit, copy as plain text, and delete.
5. **History**: user-recorded applications only.
6. **Settings and data**: what is stored and where, export backup, import backup, clear all data.
7. **Messages** (Library): snippet list, placeholder form, live preview, character and paragraph counts, "Copy as plain text" with a visible "Copied" state.
8. **Appearance** (Settings): Light, Dark, System options; System is selected by default and follows OS appearance changes.
9. **Backup and restore** (Settings): export a versioned local backup and restore after explicit confirmation.

## First-run flow
1. Welcome: privacy promise (local only, no submit).
2. Minimal profile (name, email; everything else optional).
3. Optional: import first resume and mark it default.
4. Land on Autofill with a "Open a job form and click Detect Fields" prompt.

## Empty states
- No profile: prompt to complete minimum fields before detection.
- No documents: prompt to import; upload step shows manual fallback.
- No form detected: explain what was scanned and offer re-scan.
- No saved answers or history: one-line explanation and primary action.

## Error and partial-result states
- Per field: filled, skipped, failed, verification unavailable.
- Upload: assigned, unsupported, failed, manual action required.
- Stale target (page re-rendered): offer re-scan, never fill silently.
- Storage quota or import validation failure: show cause and next step.

## Pre-filled and conflict states
- Already filled: value matches the profile; card shows "Already filled" with no action.
- Conflict: card shows "Site has X, profile has Y". Primary action Keep site value; Replace is separate and marked. Conflicts are excluded from "Approve all".
- Changed since scan: skipped with a "Re-scan" action.
- Notice when the form keeps changing: "Wait for the form to finish loading, then re-scan."

## Confidence display
High, Medium, Low labels with the evidence list. Low or ambiguous never pre-approved.
