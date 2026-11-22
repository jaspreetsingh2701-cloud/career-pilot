import { describe, expect, it } from 'vitest';
import { emptyProfile } from '../types';
import { getProfileCandidateValues } from './profile-field-mapper';

describe('getProfileCandidateValues', () => {
  it('normalizes standard and custom profile values into one candidate list', () => {
    const profile = { ...emptyProfile(), firstName: 'Asha', currentCompensation: '₹20 LPA', customFields: [{ id: '1', key: 'custom_notice', label: 'Availability to join', value: 'Immediate', type: 'text' as const, section: 'Additional', aliases: ['joining availability', 'join date'] }] };
    expect(getProfileCandidateValues(profile)).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: 'firstName', value: 'Asha', source: 'standard' }),
      expect.objectContaining({ key: 'currentCompensation', value: '₹20 LPA', aliases: expect.arrayContaining(['current ctc']), source: 'standard' }),
      expect.objectContaining({ key: 'custom_notice', value: 'Immediate', aliases: ['joining availability', 'join date'], source: 'custom' }),
    ]));
  });
  it('supports older profiles without customFields', () => {
    const profile = emptyProfile(); delete profile.customFields;
    expect(getProfileCandidateValues(profile)).toEqual([]);
  });
});
