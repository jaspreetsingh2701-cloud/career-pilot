# Design Reference and UI Implementation Contract

## Source of truth
Use these references in this order when implementing or changing the UI:
1. `docs/design-system.md` — brand palette, tokens, accessibility, typography, and component conventions.
2. `design/design-tokens.json` — machine-readable token values for implementation.
3. Approved screen mockups under `design/mockups/` — layout, hierarchy, spacing, and component appearance.
4. This document — screen inventory, behavior notes, and review checklist.
5. Product and architecture requirements in `docs/product-requirements.md` and `docs/architecture.md` — product behavior and technical boundaries.

If references conflict, do not guess. Follow product/security requirements for behavior, follow the design system for visual tokens, and flag the conflict for resolution.

## Mockup asset convention
Store approved mockups in `design/mockups/` as PNG exports. Keep editable originals (for example Figma source or SVG) alongside them where practical. Use descriptive filenames:
- `dashboard.png`
- `profile.png`
- `documents.png`
- `autofill-review.png`
- `field-mapping.png`
- `application-history.png`

A composite overview board may be stored as `design/mockups/overview-board.png`, but individual screen exports are preferred for implementation and visual review.

## Screen inventory and behavior

### Dashboard
- Provide clear navigation to profile, documents, saved answers, and application history.
- Make the primary action Detect Fields / Start Autofill easy to find.
- Show useful counts only when backed by actual local data.
- Do not use fabricated user data in the production UI.

### Profile
- Group candidate details into understandable sections.
- Use persistent labels, helper text where useful, and clear validation.
- Preserve optional fields as optional; do not invent values.

### Documents
- Separate resumes and cover letters.
- Support multiple documents, default selection, role-specific variants, and explicit per-application selection.
- Display file name/type/size and clear upload, replace, delete, and default states.

### Autofill review
- Show detected fields and suggested values before filling.
- Make confidence and evidence visible without implying a guarantee.
- Provide edit, approve, and skip actions.
- Keep sensitive or ambiguous fields excluded or clearly marked for manual review.
- The user must explicitly approve filling. Never submit the application.

### Field mapping
- Show actual native options when relevant.
- Distinguish field helper/example text from selectable options.
- Explain why a value or option was suggested.
- Do not select the first option by default.

### Application history
- Display only records explicitly saved or confirmed by the user.
- Distinguish draft, submitted (user-confirmed), and unknown statuses.

## Implementation rules
- Build reusable components from the design system; do not copy/paste screen-specific styles.
- Use semantic tokens rather than hard-coded color values.
- Match the narrow Chrome side-panel viewport first; test resizing and browser zoom.
- Use synthetic sample data in fixtures and mockups. Never put real personal data in screenshots.
- Preserve keyboard access, visible focus, accessible names, and WCAG 2.2 AA contrast.
- Do not add visual elements that imply unsupported functionality.

## Visual review checklist
- [ ] Correct Indigo + Teal brand tokens are used.
- [ ] Typography, spacing, radii, borders, and shadows follow `docs/design-system.md`.
- [ ] Layout and hierarchy match the approved screen mockup.
- [ ] Side-panel width, overflow, and responsive behavior are checked.
- [ ] Loading, empty, error, disabled, and success states are designed where relevant.
- [ ] Keyboard navigation and visible focus work.
- [ ] Text and controls meet contrast requirements.
- [ ] No fabricated personal data or unsupported product actions appear.
- [ ] Screenshots of the implemented UI are compared with the approved reference before the milestone is accepted.

## Change control
A visual change that materially alters a screen or shared component should update the relevant mockup and this reference. A brand/token change must update `docs/design-system.md` and `design/design-tokens.json` together.
