# Design System and Visual Theme

## Purpose
Define a consistent visual language for CareerPilot across the Chrome side panel, extension surfaces, and future product screens. This document is the source of truth for design tokens and UI conventions.

The visual direction should feel professional, calm, focused, trustworthy, and modern. CareerPilot helps users complete repetitive job-application work; the interface should reduce cognitive load rather than compete for attention.

## Brand direction

### Recommended palette: Indigo + Teal
- **Primary brand — Indigo:** communicates confidence, clarity, and focus.
- **Accent — Teal:** communicates progress and positive action.
- **Neutrals — Slate:** provide a restrained foundation for dense forms and data.
- **Semantic colors:** reserved for success, warning, error, and informational states.

Do not imitate another product's signature color. Avoid using orange as the dominant brand color; reserve warm amber for warning or attention states.

### Core color tokens

| Token | Hex | Usage |
|---|---|---|
| brand-50 | #EEF2FF | Subtle brand backgrounds |
| brand-100 | #E0E7FF | Selected/hover surfaces |
| brand-600 | #4F46E5 | Primary actions, active navigation, links |
| brand-700 | #4338CA | Primary hover/pressed state |
| accent-50 | #F0FDFA | Subtle progress backgrounds |
| accent-500 | #14B8A6 | Progress and secondary emphasis |
| accent-700 | #0F766E | Accessible accent text/icons where contrast permits |
| neutral-0 | #FFFFFF | Main light surface |
| neutral-50 | #F8FAFC | App background |
| neutral-100 | #F1F5F9 | Subtle surface |
| neutral-200 | #E2E8F0 | Borders/dividers |
| neutral-500 | #64748B | Muted text/icons |
| neutral-700 | #334155 | Secondary text |
| neutral-900 | #0F172A | Main text |
| success-600 | #16A34A | Successful actions/status |
| warning-600 | #D97706 | Warnings and attention |
| danger-600 | #DC2626 | Errors/destructive actions |
| info-600 | #0284C7 | Informational messages |

Use semantic tokens in components (for example, primary, surface, text-muted, border, success) rather than scattering raw hex values through the UI. The values above are initial design tokens and must be checked for WCAG contrast in their actual foreground/background combinations before release.

## Theme modes
- Support light theme first for the MVP.
- Keep token naming compatible with a future dark theme; do not hard-code colors into component styles.
- If dark theme is introduced, define and test a complete semantic token mapping rather than applying simple color inversion.
- Respect the operating-system preference only when both themes are fully supported.

## Typography
- Use Inter when bundled/licensed appropriately; otherwise use a system sans-serif stack.
- Use a clear hierarchy: page title, section title, field label, body, helper text, metadata.
- Prefer regular (400) and medium (500) weights for body/UI; semibold (600) for headings and important actions.
- Keep body text comfortably readable. Avoid tiny helper text; target 12–14px minimum for secondary UI and 14px or larger for primary form content.
- Use tabular numerals for dates, counts, and other values where alignment matters.

## Layout and spacing
- Design for the constrained width of a Chrome side panel first.
- Use a consistent 4px spacing base, with common spacing steps of 4, 8, 12, 16, 24, and 32px.
- Keep content grouped into clear sections with predictable alignment.
- Prefer a single-column layout in the side panel; avoid dense multi-column forms.
- Use compact but comfortable controls, with clear separation between sections.
- Allow long labels, filenames, company names, and role titles to wrap or truncate accessibly; expose the full value where needed.

## Shape, borders, and elevation
- Use modest corner radii: 6px for compact controls, 8px for inputs/cards, and 12px for larger grouped surfaces.
- Prefer subtle borders over heavy shadows.
- Use elevation sparingly for overlays, menus, and dialogs.
- Avoid excessive pill-shaped controls; reserve pills for compact status tags or filters.

## Components and interaction states
All reusable components must share the same tokens and state conventions.

- **Primary button:** indigo fill, high-contrast text; one dominant primary action per view where possible.
- **Secondary button:** neutral surface with visible border.
- **Destructive action:** danger styling and confirmation for irreversible data deletion.
- **Inputs:** persistent visible labels, clear focus ring, readable placeholder/helper text, and distinct disabled/error states.
- **Cards/sections:** neutral surface, subtle border, consistent padding.
- **Status badges:** use semantic colors sparingly and always include text or an accessible label; never rely on color alone.
- **Confidence indicators:** pair a label (for example, High, Review, No match) with supporting evidence; do not imply certainty.
- **Loading/empty/error states:** explain what is happening and provide a useful next action when possible.
- **Focus:** keyboard focus must be clearly visible and must not be removed for visual reasons.

## Iconography and illustration
- Use one consistent outline icon family (Lucide is the preferred candidate).
- Keep icon stroke weight and sizing consistent.
- Icons supplement labels; do not use ambiguous icon-only actions without accessible names.
- Avoid decorative illustrations that consume valuable side-panel space or distract from the task.

## Accessibility
- Meet WCAG 2.2 AA contrast requirements for text and meaningful UI elements.
- Ensure all actions are keyboard-operable with visible focus.
- Use semantic HTML and accessible names for controls.
- Do not communicate status, errors, or confidence through color alone.
- Support browser zoom and text resizing without clipping essential content.
- Respect reduced-motion preferences; keep animation brief and non-essential.
- Validate focus order, screen-reader announcements, and error identification during component testing.

## Motion
- Use motion only to clarify state changes (for example, opening a panel or confirming a save).
- Keep transitions short and subtle (typically 120–200ms).
- Avoid continuous animation, parallax, and motion that delays interaction.
- Provide reduced-motion behavior.

## Tailwind implementation guidance
- Centralize the palette and semantic tokens in the Tailwind theme/configuration or CSS variables, following the installed Tailwind version's conventions.
- Components should consume semantic tokens, not duplicate arbitrary hex values.
- Keep global CSS limited to resets, font setup, base element styles, and theme variables.
- Use component-level styling for component-specific behavior.
- If CSS Modules or another styling approach is introduced, preserve the same tokens and conventions.
- Add shared primitives only when repeated usage justifies them; do not build a large component library before the MVP needs it.

## Product-specific UX principles
- The side panel must prioritize the current task: detect fields, review suggestions, choose documents, and fill approved fields.
- Make the distinction between detected, suggested, approved, filled, skipped, and failed states visually clear.
- Keep user approval visually explicit; never make a suggestion look like an already-approved action.
- Show evidence for field matches without overwhelming the user.
- Keep privacy and local-storage messaging clear but unobtrusive.
- Destructive actions such as clearing all local data must be visually distinct and confirmed.

## Governance
- This document governs visual decisions for CareerPilot.
- New components must use existing tokens and interaction conventions.
- Any change to the brand palette, typography, or core interaction patterns should update this document.
- Validate tokens in the actual side-panel UI and test contrast before treating the palette as release-ready.
