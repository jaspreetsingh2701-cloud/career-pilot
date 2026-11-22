import type { UserProfile } from '../types';
import { standardProfileFields } from '../schema/standard-fields';
export interface ProfileCandidateValue { key: string; label: string; value: string; aliases: string[]; source: 'standard' | 'custom'; section?: string; }
/** Normalizes built-in and user-defined values into one mapping input. */
export function getProfileCandidateValues(profile: UserProfile): ProfileCandidateValue[] {
 const standard = standardProfileFields.flatMap(field => { const raw = profile[field.key]; if (raw === undefined || raw === null || raw === '' || typeof raw === 'object') return []; return [{ key: String(field.key), label: field.label, value: String(raw), aliases: field.aliases, source: 'standard' as const, section: field.section }]; });
 const custom = (profile.customFields ?? []).filter(field => field.value.trim()).map(field => ({ key: field.key, label: field.label, value: field.value, aliases: field.aliases, source: 'custom' as const, section: field.section }));
 return [...standard, ...custom];
}
