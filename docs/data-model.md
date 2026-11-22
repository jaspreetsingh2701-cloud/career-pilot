# Data Model and Local Persistence

## Storage rules
- Keep all MVP data in the browser profile.
- Use chrome.storage.local for small profile/preferences data.
- Use IndexedDB for document Blobs and larger collections.
- Hide storage APIs behind repositories.
- Version schemas and test migrations.

## Appearance preference

`careerPilot.theme` in `chrome.storage.local` stores `light`, `dark`, or `system`. Missing or invalid values resolve to `system`. System mode follows the browser/OS `prefers-color-scheme` media query.

## Candidate profile
```ts
interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  totalExperienceYears?: number;
  currentDesignation?: string;
  currentCompany?: string;
  phoneCountryCode?: string;
  currentCompensation?: string;
  expectedCompensation?: string;
  compensationCurrency?: string;
  noticePeriod?: string;
  noticePeriodNegotiable?: boolean;
  preferredRole?: string;
  workMode?: "onsite" | "hybrid" | "remote";
  willingToRelocate?: boolean;
  skills?: string[];
  languages?: string[];
  education?: EducationEntry[];
  employment?: EmploymentEntry[];
  currentLocation?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  updatedAt: number;
}
```
```ts
interface EducationEntry { institution: string; degree?: string; field?: string; startYear?: number; endYear?: number; }
interface EmploymentEntry { company: string; title: string; startDate?: string; endDate?: string; current?: boolean; summary?: string; }
```
Keep optional values optional. Preserve user-entered units and wording for compensation and notice period; do not infer missing values.

## Documents
```ts
type DocumentType = "resume" | "cover-letter" | "other";

interface CareerDocument {
  id: string;
  name: string;
  type: DocumentType;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  isDefault: boolean;
  targetRole?: string;
  createdAt: number;
  updatedAt: number;
}
```
Store the actual Blob in IndexedDB, keyed by document ID or a related blob key. Keep metadata and Blob operations consistent. Only one default resume and one default cover letter may be active. Applications store selected document IDs rather than duplicate files.

## Saved answers
```ts
interface SavedAnswer {
  id: string;
  title: string;
  answer: string;
  category?: string;
  keywords: string[];
  createdAt: number;
  updatedAt: number;
}
```
Answers may be sensitive personal statements; keep local and allow review and deletion.

## Message snippets
```ts
interface MessageSnippet {
  id: string;
  title: string;
  body: string;            // plain text; \n line breaks preserved exactly
  category?: string;       // e.g. "linkedin-connection", "referral", "follow-up"
  maxLength?: number;      // optional, user-editable
  createdAt: number;
  updatedAt: number;
}
```
Placeholders use {{name}} syntax and are resolved at copy time; unresolved placeholders are flagged, never silently removed. Store as plain text, never HTML.

## Detected fields and mappings
```ts
type SupportedControl =
  | "text" | "email" | "tel" | "url" | "number"
  | "textarea" | "select" | "radio" | "checkbox" | "file" | "other";

interface DetectedOption {
  label: string;
  value: string;
  selected: boolean;
  disabled: boolean;
}

interface DetectedField {
  id: string;
  tagName: string;
  controlType: SupportedControl;
  name?: string;
  elementId?: string;
  label: string;
  placeholder?: string;
  accessibleDescription?: string;
  helperText?: string;
  exampleText?: string;
  groupContext?: string;
  currentValue?: string;       // in-memory snapshot only; never logged or persisted
  hasFile?: boolean;           // file inputs: a file is already attached
  prefilled: boolean;          // non-empty and not a placeholder
  required: boolean;
  disabled: boolean;
  readOnly: boolean;
  hidden: boolean;
  options?: DetectedOption[];
}
```
Detected fields are transient scan results; avoid persisting page selectors or unrelated page data.

```ts
interface FieldMapping {
  detectedFieldId: string;
  target:
    | { kind: "profile"; profileKey: string }
    | { kind: "saved-answer"; answerId: string }
    | { kind: "manual"; value: string };
  proposedValue?: string;
  selectedOption?: { label: string; value: string };
  confidence: number;
  reasons: string[];
  existingValue?: string;      // value the site already holds (conflict display)
  overwriteApproved?: boolean; // per-field opt-in, never set by bulk approval
  status: "suggested" | "approved" | "skipped" | "needs-review" | "already-filled" | "conflict";
}
```
Confidence is heuristic, not a correctness guarantee. Always require user approval.

## Application history
```ts
interface ApplicationRecord {
  id: string;
  companyName?: string;
  roleTitle?: string;
  applicationUrl?: string;
  recordedAt: number;
  selectedResumeId?: string;
  selectedCoverLetterId?: string;
  notes?: string;
  status: "draft" | "submitted" | "unknown";
}
```
Only mark submitted after explicit user confirmation.

## Suggested IndexedDB stores
documents, documentBlobs, savedAnswers, messageSnippets, applications. Add indexes for type/default role, answer category/keywords, and application date where useful.

## Data lifecycle
- Validate before create/update.
- Replace Blob and metadata consistently; clean superseded content.
- Handle deleted document references in history without silent dangling links.
- Clear all extension storage and IndexedDB stores/databases; verify deletion.
- Add schema versioning and migration tests.

## Backup file
```ts
interface BackupFile {
  schemaVersion: number;
  exportedAt: number;
  profile?: UserProfile;
  savedAnswers: SavedAnswer[];
  messageSnippets: MessageSnippet[];
  applications: ApplicationRecord[];
  documents: Array<{ meta: CareerDocument; contentBase64: string }>;
}
```
Validate version and contents on import; migrate older versions; confirm before overwrite.

## Privacy
No cloud sync or external upload. Do not log profile values, documents, saved answers, or full page HTML. Content scripts receive only the values needed for the current approved action.
