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
  updatedAt: number;
}
export interface EducationEntry { institution: string; degree?: string; field?: string; startYear?: number; endYear?: number; }
export interface EmploymentEntry { company: string; title: string; startDate?: string; endDate?: string; current?: boolean; summary?: string; }
export const emptyProfile = (): UserProfile => ({
  id: crypto.randomUUID(), firstName: '', lastName: '', email: '', skills: [], languages: [], education: [], employment: [], updatedAt: Date.now(),
});
