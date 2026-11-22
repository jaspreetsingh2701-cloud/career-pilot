import type { UserProfile } from '../types';
export interface StandardProfileFieldDefinition { key: keyof UserProfile; label: string; section: string; aliases: string[]; }
// Edit this catalogue to add or tune built-in profile field labels and matching aliases.
export const standardProfileFields: StandardProfileFieldDefinition[] = [
{ key: 'firstName', label: 'First name', section: 'Contact', aliases: ['given name', 'forename'] },
{ key: 'lastName', label: 'Last name', section: 'Contact', aliases: ['surname', 'family name'] },
{ key: 'email', label: 'Email', section: 'Contact', aliases: ['email address', 'e-mail'] },
{ key: 'phone', label: 'Phone', section: 'Contact', aliases: ['mobile', 'telephone', 'phone number'] },
{ key: 'currentLocation', label: 'Current location', section: 'Contact', aliases: ['city', 'location', 'current city'] },
{ key: 'currentDesignation', label: 'Current designation', section: 'Employment', aliases: ['job title', 'current role', 'present designation'] },
{ key: 'currentCompany', label: 'Current company', section: 'Employment', aliases: ['employer', 'organization'] },
{ key: 'currentCompensation', label: 'Current compensation', section: 'Compensation', aliases: ['current ctc', 'current salary', 'present ctc'] },
{ key: 'expectedCompensation', label: 'Expected compensation', section: 'Compensation', aliases: ['expected ctc', 'expected salary'] },
{ key: 'noticePeriod', label: 'Notice period', section: 'Preferences', aliases: ['availability', 'joining time'] },
{ key: 'preferredRole', label: 'Preferred role', section: 'Preferences', aliases: ['desired role', 'target position'] },
{ key: 'linkedinUrl', label: 'LinkedIn URL', section: 'Links', aliases: ['linkedin profile'] },
{ key: 'githubUrl', label: 'GitHub URL', section: 'Links', aliases: ['github profile'] },
{ key: 'portfolioUrl', label: 'Portfolio URL', section: 'Links', aliases: ['personal website', 'website'] },
];
