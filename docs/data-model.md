# Data Model and Local Persistence

## Storage rules
- chrome.storage.local: profile and small preferences.
- IndexedDB: document Blobs, document metadata, saved answers and message snippets.
- Keep storage behind repositories and version schemas.

## Candidate profile
The runtime UserProfile type is in `src/features/profile/types.ts`. It includes optional phoneCountryCode, total experience, compensation, notice period, links, skills, languages, education, employment and custom fields. Built-in candidates are defined in `src/features/profile/schema/standard-fields.ts`; standard/custom values are normalized by `src/features/profile/utils/profile-field-mapper.ts`. The phone candidate combines the selected calling code and local number once.

## IndexedDB
Database: `career-pilot-local`, version 1. Stores: `documents`, `documentBlobs`, `savedAnswers`, `messageSnippets`. Runtime record types are in `src/features/library/types.ts`.

## Backup file — schema version 1
The current serializer in `src/features/backup/backup.ts` writes:
```ts
interface BackupFile {
  schemaVersion: 1;
  exportedAt: number;
  profile: UserProfile;
  answers: SavedAnswer[];
  snippets: MessageSnippet[];
  documents: Array<{ metadata: CareerDocument; contentBase64: string }>;
}
```
These are the actual serialized property names. Application history is not included. Import validation and coordinated rollback across chrome.storage.local and IndexedDB are still open; restore is not atomic.

## Detection and mapping
Scan results are transient in-memory snapshots, not extension storage records. Current implementation supports input, textarea and select elements. Radio/checkbox group semantics, richer accessible-name resolution and placeholder/prefilled classification remain incomplete.

## Privacy
No cloud sync or external upload. Do not log profile values, documents, saved answers, scan snapshots or full page HTML.
