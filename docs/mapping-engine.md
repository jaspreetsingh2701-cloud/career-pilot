# Field Mapping Engine (M4)

## Responsibility
The mapping engine is a pure, deterministic suggestion layer. It consumes transient detected-field metadata, normalized profile candidates, and saved answers. It does not access the DOM, storage, browser APIs, or the network, and it never fills or approves fields.

## Matching signals
- Normalize case, whitespace, punctuation, and common Unicode accents.
- Compare field label, name, element ID, placeholder, accessible description, helper text, and example text against standard labels, explicit aliases, custom-field labels/aliases, and saved-answer titles/keywords/categories.
- Prefer exact normalized term matches over phrase/metadata matches.
- Use form section context only as supporting evidence.
- Return a confidence score and human-readable evidence reasons.

The initial deterministic scoring is intentionally conservative and will be tuned against synthetic fixtures. Confidence is heuristic, not a probability or correctness guarantee.

## Native options
For native select and radio fields, map a candidate only when its value uniquely matches an enabled option label or value (normalization allows case and punctuation differences). Never choose disabled, blank, or ambiguous options. If no unique option matches, return `needs-review` without a selected option.

## Ambiguity and safety
- Similar top candidate scores return `ambiguous` with alternatives.
- Weak or absent evidence returns `no-match`.
- Disabled, hidden, and read-only fields are not suggested.
- Existing page values are not changed by M4; current values remain transient scan data.
- Password, OTP, payment, legal/work-authorization and demographic fields remain outside the mapping/fill scope.
- Saved answers are suggestions only and require user review.
- This milestone does not write to the page or submit forms.

## API
`src/features/mapping/match-fields.ts` exports `suggestFieldMappings({ fields, profileValues, savedAnswers })`. Each result contains the detected field ID, candidate source, proposed value, confidence, evidence reasons, and a conservative status (`suggested`, `needs-review`, `ambiguous`, or `no-match`). Native option matches include the exact option label/value.

## Validation
Unit tests cover exact/alias and metadata matching, saved-answer matching, unique and ambiguous native options, no-match, ambiguous candidates, disabled options, and non-editable fields.
