import { describe, expect, it } from 'vitest';
import { suggestFieldMappings } from './match-fields';
import type { DetectedField } from '../detection/detect-fields';
import type { ProfileCandidateValue } from '../profile/utils/profile-field-mapper';
import type { SavedAnswer } from '../library/types';

const profile: ProfileCandidateValue[] = [
  { key: 'email', label: 'Email', value: 'asha@example.com', aliases: ['email address', 'e-mail'], source: 'standard', section: 'Contact' },
  { key: 'currentDesignation', label: 'Current designation', value: 'Frontend Engineer', aliases: ['job title', 'current role'], source: 'standard', section: 'Employment' },
  { key: 'skills', label: 'Skills', value: 'React', aliases: ['primary technology'], source: 'standard', section: 'Skills' },
];
const answers: SavedAnswer[] = [{
  id: 'answer-1', title: 'Why are you interested in this role?', answer: 'I enjoy building accessible products.',
  keywords: ['motivation', 'interest in role'], createdAt: 1, updatedAt: 1,
}];
const field = (overrides: Partial<DetectedField>): DetectedField => ({
  id: 'field-1', index: 0, tagName: 'input', controlType: 'text', label: '', currentValue: '',
  required: false, disabled: false, readOnly: false, hidden: false, ...overrides,
});

describe('suggestFieldMappings', () => {
  it('matches exact labels and aliases with high confidence', () => {
    const [result] = suggestFieldMappings({ fields: [field({ label: 'Email address' })], profileValues: profile, savedAnswers: [] });
    expect(result.status).toBe('suggested');
    expect(result.candidate).toMatchObject({ kind: 'profile', key: 'email' });
    expect(result.proposedValue).toBe('asha@example.com');
  });

  it('uses metadata such as name and placeholder', () => {
    const [result] = suggestFieldMappings({ fields: [field({ label: '', name: 'current_role', placeholder: 'Current role' })], profileValues: profile, savedAnswers: [] });
    expect(result.candidate).toMatchObject({ kind: 'profile', key: 'currentDesignation' });
  });

  it('does not map a plain Address field to the Email profile value', () => {
    const [result] = suggestFieldMappings({ fields: [field({ label: 'Address', name: 'address' })], profileValues: profile, savedAnswers: [] });
    expect(result.candidate.kind).toBe('profile');
    if (result.candidate.kind === 'profile') expect(result.candidate.key).not.toBe('email');
    expect(result.status).toBe('no-match');
  });

  it('still maps Email address to the Email profile value', () => {
    const [result] = suggestFieldMappings({ fields: [field({ label: 'Email address', name: 'email' })], profileValues: profile, savedAnswers: [] });
    expect(result.candidate).toMatchObject({ kind: 'profile', key: 'email' });
    expect(result.proposedValue).toBe('asha@example.com');
  });

  it('matches saved answers using question title and keywords', () => {
    const [result] = suggestFieldMappings({ fields: [field({ tagName: 'textarea', controlType: 'textarea', label: 'Why are you interested in this role?' })], profileValues: [], savedAnswers: answers });
    expect(result.candidate).toMatchObject({ kind: 'saved-answer', id: 'answer-1' });
    expect(result.proposedValue).toContain('accessible products');
  });

  it('matches a native select only to a unique enabled option', () => {
    const [result] = suggestFieldMappings({ fields: [field({ controlType: 'select', label: 'Primary technology', options: [
      { label: 'Choose one', value: '', selected: true, disabled: false },
      { label: 'React', value: 'react', selected: false, disabled: false },
      { label: 'Angular', value: 'angular', selected: false, disabled: false },
      { label: 'Vue', value: 'vue', selected: false, disabled: true },
    ] })], profileValues: profile, savedAnswers: [] });
    expect(result.status).toBe('suggested');
    expect(result.selectedOption).toEqual({ label: 'React', value: 'react' });
  });

  it('requires review when multiple native options match', () => {
    const [result] = suggestFieldMappings({ fields: [field({ controlType: 'select', label: 'Primary technology', options: [
      { label: 'React', value: 'react', selected: false, disabled: false },
      { label: 'React.js', value: 'reactjs', selected: false, disabled: false },
    ] })], profileValues: profile, savedAnswers: [] });
    expect(result.status).toBe('needs-review');
    expect(result.selectedOption).toBeUndefined();
  });

  it('marks close candidate scores ambiguous instead of choosing silently', () => {
    const values: ProfileCandidateValue[] = [
      { key: 'currentDesignation', label: 'Job title', value: 'Engineer', aliases: ['role'], source: 'standard' },
      { key: 'preferredRole', label: 'Preferred role', value: 'Lead', aliases: ['job title'], source: 'standard' },
    ];
    const [result] = suggestFieldMappings({ fields: [field({ label: 'Job title' })], profileValues: values, savedAnswers: [] });
    expect(result.status).toBe('ambiguous');
    expect(result.alternatives).toHaveLength(2);
  });

  it('returns no-match when no reliable evidence exists', () => {
    const [result] = suggestFieldMappings({ fields: [field({ label: 'Tell us about yourself' })], profileValues: profile, savedAnswers: [] });
    expect(result.status).toBe('no-match');
  });

  it('never suggests disabled, hidden or read-only fields', () => {
    const results = suggestFieldMappings({ fields: [field({ label: 'Email', disabled: true }), field({ id: 'hidden', label: 'Email', hidden: true }), field({ id: 'readonly', label: 'Email', readOnly: true })], profileValues: profile, savedAnswers: [] });
    expect(results.every(result => result.status === 'no-match')).toBe(true);
  });

  it('does not select disabled native options', () => {
    const [result] = suggestFieldMappings({ fields: [field({ controlType: 'select', label: 'Primary technology', options: [
      { label: 'React', value: 'react', selected: false, disabled: true },
    ] })], profileValues: profile, savedAnswers: [] });
    expect(result.status).toBe('needs-review');
  });

  it('prefers an exact custom field label over a built-in alias', () => {
    const values: ProfileCandidateValue[] = [
      {
        key: 'currentLocation',
        label: 'Current location',
        value: 'Noida',
        aliases: ['city', 'location', 'current city'],
        source: 'standard',
        section: 'Contact',
      },
      {
        key: 'custom_city',
        label: 'City',
        value: 'Delhi',
        aliases: [],
        source: 'custom',
        section: 'Additional',
      },
    ];
    const [result] = suggestFieldMappings({
      fields: [field({ label: 'City' })],
      profileValues: values,
      savedAnswers: [],
    });

    expect(result.status).toBe('suggested');
    expect(result.proposedValue).toBe('Delhi');
    expect(result.candidate).toMatchObject({ kind: 'profile', key: 'custom_city' });
  });
});
