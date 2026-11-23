import type { DetectedField, DetectedOption } from '../detection/detect-fields';
import type { ProfileCandidateValue } from '../profile/utils/profile-field-mapper';
import type { SavedAnswer } from '../library/types';

export type MappingCandidate =
  | { kind: 'profile'; key: string; label: string; value: string; aliases: string[]; source: 'standard' | 'custom'; section?: string }
  | { kind: 'saved-answer'; id: string; label: string; value: string; keywords: string[]; category?: string };

export interface MappingSuggestion {
  detectedFieldId: string;
  candidate: MappingCandidate;
  proposedValue: string;
  confidence: number;
  reasons: string[];
  status: 'suggested' | 'needs-review' | 'no-match' | 'ambiguous';
  selectedOption?: { label: string; value: string };
  alternatives?: Array<{ candidate: MappingCandidate; confidence: number }>;
}

export interface MappingInput {
  fields: DetectedField[];
  profileValues: ProfileCandidateValue[];
  savedAnswers: SavedAnswer[];
}

const normalize = (value: string): string =>
  value.toLocaleLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

const words = (value: string): string[] => normalize(value).split(/\s+/).filter(Boolean);
const includesPhrase = (haystack: string, needle: string): boolean => {
  const h = ' ' + normalize(haystack) + ' ';
  const n = ' ' + normalize(needle) + ' ';
  return n.trim().length > 0 && h.includes(n);
};

function profileCandidates(values: ProfileCandidateValue[]): MappingCandidate[] {
  return values.map(value => ({
    kind: 'profile',
    key: value.key,
    label: value.label,
    value: value.value,
    aliases: value.aliases,
    source: value.source,
    section: value.section,
  }));
}
function answerCandidates(values: SavedAnswer[]): MappingCandidate[] {
  return values.filter(value => value.answer.trim()).map(value => ({
    kind: 'saved-answer', id: value.id, label: value.title, value: value.answer,
    keywords: value.keywords ?? [], category: value.category,
  }));
}

function candidateScore(field: DetectedField, candidate: MappingCandidate): { score: number; reasons: string[] } {
  const signals = [field.label, field.name ?? '', field.elementId ?? '', field.placeholder ?? '', field.accessibleDescription ?? '', field.helperText ?? '', field.exampleText ?? ''];
  const candidateTerms = candidate.kind === 'profile'
    ? [candidate.label, ...candidate.aliases]
    : [candidate.label, ...candidate.keywords, candidate.category ?? ''];
  let score = 0;
  const reasons: string[] = [];
  const normalizedLabel = normalize(candidate.label);
  const normalizedAliases = candidate.kind === 'profile'
    ? candidate.aliases.map(normalize).filter(Boolean)
    : [...candidate.keywords, candidate.category ?? ''].map(normalize).filter(Boolean);

  const exactLabelMatch = signals.some(
    signal => normalize(signal) === normalizedLabel && normalizedLabel,
  );
  const exactAliasMatch = signals.some(
    signal => normalizedAliases.includes(normalize(signal)) && normalize(signal),
  );
  const customLabelPhraseMatch =
    candidate.kind === 'profile' &&
    candidate.source === 'custom' &&
    signals.some(signal => includesPhrase(signal, candidate.label));

  if (exactLabelMatch) {
    score += candidate.kind === 'profile' && candidate.source === 'custom' ? 100 : 65;
    reasons.push(
      candidate.kind === 'profile' && candidate.source === 'custom'
        ? 'Exact custom profile label match'
        : 'Exact label match',
    );
  } else if (customLabelPhraseMatch) {
    score += 80;
    reasons.push('Custom profile label found in field metadata');
  } else if (exactAliasMatch) {
    score += 65;
    reasons.push('Exact alias or saved-answer keyword match');
  } else if (signals.some(signal => candidateTerms.some(term => includesPhrase(signal, term)))) {
    score += 45;
    reasons.push('Label or metadata contains a known field term');
  }
  const labelWords = new Set(words(field.label));
  const overlap = candidateTerms.some(term => words(term).filter(word => labelWords.has(word)).length >= 2);
  if (overlap && score < 45) { score += 25; reasons.push('Multiple meaningful words overlap'); }
  return { score: Math.min(score, 100), reasons };
}

function matchOption(value: string, options: DetectedOption[] | undefined): DetectedOption | undefined {
  if (!options?.length) return undefined;
  const target = normalize(value);
  if (!target) return undefined;
  const enabled = options.filter(option => !option.disabled && normalize(option.label) && normalize(option.value));
  const matches = enabled.filter(option =>
    normalize(option.label) === target ||
    normalize(option.value) === target ||
    includesPhrase(option.label, value) ||
    includesPhrase(value, option.label)
  );
  return matches.length === 1 ? matches[0] : undefined;
}

/** Deterministic suggestions only. This function never changes page elements or approves a mapping. */
export function suggestFieldMappings(input: MappingInput): MappingSuggestion[] {
  const candidates = [...profileCandidates(input.profileValues), ...answerCandidates(input.savedAnswers)];
  return input.fields.map(field => {
    if (field.disabled || field.readOnly || field.hidden) {
      return { detectedFieldId: field.id, candidate: { kind: 'profile', key: '', label: '', value: '', aliases: [], source: 'standard' }, proposedValue: '', confidence: 0, reasons: ['Field is not editable'], status: 'no-match' };
    }
    const ranked = candidates.map(candidate => ({ candidate, ...candidateScore(field, candidate) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);
    if (!ranked.length || ranked[0].score < 45) {
      return { detectedFieldId: field.id, candidate: { kind: 'profile', key: '', label: '', value: '', aliases: [], source: 'standard' }, proposedValue: '', confidence: 0, reasons: ['No sufficiently strong metadata match'], status: 'no-match' };
    }
    const top = ranked[0];
    const tied = ranked.filter(item => top.score - item.score < 15);
    if (tied.length > 1) {
      return { detectedFieldId: field.id, candidate: top.candidate, proposedValue: '', confidence: top.score, reasons: ['Multiple candidate sources have similar evidence'], status: 'ambiguous', alternatives: tied.map(item => ({ candidate: item.candidate, confidence: item.score })) };
    }
    const option = field.controlType === 'select' || field.controlType === 'radio' ? matchOption(top.candidate.value, field.options) : undefined;
    if ((field.controlType === 'select' || field.controlType === 'radio') && !option) {
      return { detectedFieldId: field.id, candidate: top.candidate, proposedValue: '', confidence: top.score, reasons: [...top.reasons, 'No unique enabled native option matches the saved value'], status: 'needs-review' };
    }
    return {
      detectedFieldId: field.id, candidate: top.candidate,
      proposedValue: option?.label ?? top.candidate.value,
      confidence: top.score, reasons: top.reasons,
      status: top.score >= 65 ? 'suggested' : 'needs-review',
      ...(option ? { selectedOption: { label: option.label, value: option.value } } : {}),
    };
  });
}
