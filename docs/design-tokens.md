# Design Tokens and UI Decisions

Source: side-panel mockup (Mapping review and Document library screens). Treat these values as the starting point and adjust during M1.

## Color
| Token | Value | Use |
|---|---|---|
| surface-page | #F4F6F9 | Panel background |
| surface-card | #FFFFFF | Cards, footer |
| surface-muted | #EEF0F4 | Excluded or inactive blocks |
| border | #E1E5EB | Card and divider borders |
| border-dashed | #98A2B3 | Excluded-field outline |
| text-primary | #14213D | Headings, values |
| text-secondary | #4B5565 | Labels, helper text |
| accent | #0F766E | Primary buttons, active tab |
| success-text / bg | #0B5D3B / #DDF3E7 | High confidence, default badge |
| warning-text / bg | #7A4A00 / #FFF0CC | Medium confidence, needs review |
| danger | #B42318 | Clear all data |
| surface-section | #E9EDF2 | Section header bars in long lists |
| surface-selected | #F0FAF7 | Approved or selected row/card |
| surface-disabled | #E7EAF0 | Neutral badges, disabled controls |
| border-input | #CBD2DC | Secondary buttons, inputs, unchecked chips |
| progress-track | #E1E5EB | Progress bar background |
| warning-border | #B7791F | Conflict card outline |

Text pairs are chosen for at least 4.5:1 contrast. Confidence is always shown as a text label, never by color alone.

## Typography
Inter (fallback: system sans-serif). Panel title 17px/700; card value 15px/600; labels and buttons 12px; helper text 11px.

## Shape and spacing
Card radius 10px, button radius 8px, badge radius pill. Card padding 12px, panel padding 16px, gap 10px. Minimum touch target 44px.

## Design decisions
1. **Side panel, not popup**: stays open while the user interacts with the form.
2. **Suggest, then approve**: every value has Approve/Skip; the primary button reads "Fill N approved fields".
3. **Show evidence**: each card shows the source (profile key or matched option) and a confidence label.
4. **Excluded fields are visible**: sensitive fields appear as a dashed notice and are never filled.
5. **No-submit reminder** is permanent in the footer.
6. **Local-only cue** is shown in the header and in the Documents footer, next to Clear all data.
7. **Conflicts use the warning tokens** (amber badge) with Keep as the default and Replace as a secondary action.
8. **Destructive action** (Clear all data) uses danger color and sits apart from primary actions.

## Components (as drawn in the mockups)
- **Field row (compact):** 44px checkbox area, 11px label, 14px/600 value truncated with an ellipsis, status badge on the right. Min height 52px. Tap expands evidence, options or conflict choices.
- **Status badge:** pill with a text label; Ready/Selected/Approved (success), Review/Conflict (warning), Filled/No match/Excluded/Choose (neutral). Never color alone.
- **Section header:** 12px/700 title with count, optional text action ("Approve ready (N)") on the right.
- **Progress bar:** 6px track, accent fill, with "N of M approved" text.
- **Filter chips:** pill buttons with counts, horizontally scrollable, active = filled accent.
- **Notice banner:** warning background, 12px text (pre-filled form, limits).
- **Conflict block:** shows "Site has" vs "Your profile has"; primary action Keep site value, secondary Replace.
- **Segmented switch:** Documents / Saved answers / Messages; active = accent outline.
- **Inputs:** 44px high, 1px border-input, 8px radius, label above.
- **Preview box:** page-surface background, 13px text, preserves line breaks (pre-wrap).
- **Success banner:** "Copied" confirmation in success colors.
- **Footer bar:** fixed, white, top border; primary and secondary actions side by side.

## Layout
380px side panel. Fixed header and footer; the list scrolls in between. Designed for long forms (dozens of fields).

## Not yet specified
Hover, focus, disabled and loading states per component; dark theme; icon set; focus ring style; extension icon and store assets.

## Mockup
Exported screens are in `docs/mockups/` (see its README). The editable source lives in a private Claude canvas and is not part of the repo.
