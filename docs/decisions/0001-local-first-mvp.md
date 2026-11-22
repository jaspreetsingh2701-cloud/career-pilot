# ADR 0001: Local-first MVP

- **Status:** Accepted
- **Date:** 2026-11-22

## Context
CareerPilot handles personal profile information, saved application answers, and resume/cover-letter documents. A cloud service would add cost, operational work, privacy obligations, and complexity before the core workflow is validated.

## Decision
Store MVP data locally:
- chrome.storage.local for small structured profile/preferences data.
- IndexedDB for document Blobs and larger collections.
- No backend, cloud sync, account system, or remote LLM in MVP.

## Consequences

### Benefits
- No server infrastructure or hosting cost.
- Personal data/documents remain on-device.
- Simpler development and faster workflow validation.

### Trade-offs
- No automatic cross-device sync.
- Browser profile reset or extension data deletion can remove local data.
- Backup/export may need a later feature.
- Local storage still needs validation, migration, and deletion safeguards.

## Follow-up
Revisit only if backup or cross-device sync becomes a demonstrated need. Any future sync requires a separate privacy/security review and explicit user opt-in.
