# Data Model and Local Persistence

## Storage rules
- Keep all MVP data in the browser profile.
- Use chrome.storage.local for small profile/preferences data.
- Use IndexedDB for document Blobs and larger collections.
- Hide storage APIs behind repositories.
- Version schemas and test migrations.

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
  currentCompensation?: string;
  expectedCompensation?: string;
  noticePeriod?: string;
  currentLocation?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  updatedAt: number;
}
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
  status: "suggested" | "approved" | "skipped" | "needs-review";
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
documents, documentBlobs, savedAnswers, applications. Add indexes for type/default role, answer category/keywords, and application date where useful.

## Data lifecycle
- Validate before create/update.
- Replace Blob and metadata consistently; clean superseded content.
- Handle deleted document references in history without silent dangling links.
- Clear all extension storage and IndexedDB stores/databases; verify deletion.
- Add schema versioning and migration tests.

## Privacy
No cloud sync or external upload. Do not log profile values, documents, saved answers, or full page HTML. Content scripts receive only the values needed for the current approved action.
