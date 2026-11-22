export type CustomProfileFieldType = 'text' | 'number' | 'date' | 'url' | 'textarea';
export interface CustomProfileField { id: string; key: string; label: string; value: string; type: CustomProfileFieldType; section?: string; aliases: string[]; description?: string; }
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  phoneCountryCode?: string;
  totalExperienceYears?: number;
  currentDesignation?: string;
  currentCompany?: string;
  currentCompensation?: string;
  expectedCompensation?: string;
  compensationCurrency?: string;
  noticePeriod?: string;
  currentLocation?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  preferredRole?: string;
  workMode?: 'onsite' | 'hybrid' | 'remote';
  willingToRelocate?: boolean;
  skills: string[];
  languages: string[];
  education: EducationEntry[];
  employment: EmploymentEntry[];
  customFields?: CustomProfileField[];
  updatedAt: number;
}
export interface EducationEntry { institution: string; degree?: string; field?: string; startYear?: number; endYear?: number; }
export interface EmploymentEntry { company: string; title: string; startDate?: string; endDate?: string; current?: boolean; summary?: string; }
export const emptyProfile = (): UserProfile => ({
  id: crypto.randomUUID(), firstName: '', lastName: '', email: '', skills: [], languages: [], education: [], employment: [], customFields: [], updatedAt: Date.now(),
});
