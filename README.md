# CareerPilot

A local-first Chrome extension (Manifest V3) that reduces repetitive job-application data entry while keeping you in control.

## What it does
- Stores your profile, multiple resumes/cover letters and reusable answers **on your device only**.
- Detects supported form fields after an explicit user action.
- Proposes values with confidence and evidence; **you approve** before anything is filled.
- Preserves existing page values unless you explicitly approve replacement.
- Never submits forms and excludes sensitive fields from the detection/fill workflow.

## Status
M5 — Mapping review and guarded autofill integration is implemented. This hardening slice improves message safety, duplicate-listener protection, phone-number mapping and deterministic CI installs. Radio/checkbox groups, backup restore hardening, browser E2E and real Chrome compatibility checks remain open. See [the roadmap](docs/roadmap.md).

## Stack
WXT, React, TypeScript, Tailwind CSS, chrome.storage.local, IndexedDB and Vitest.

## Getting started
**Requirements:** Node.js 22 or newer and npm.

```bash
npm ci
npm run dev
```

Load the generated `.output/chrome-mv3` directory as an unpacked extension from `chrome://extensions` with Developer mode enabled.

## Local fixture smoke test
```bash
python -m http.server 4173 --directory tests/fixtures/local-page
```
Open `http://localhost:4173`, open the CareerPilot side panel, and select **Detect fields on active tab**. CareerPilot checks local website rules and uses Chrome's temporary `activeTab` access for explicit injection. Use synthetic data only; this fixture does not establish compatibility with third-party job portals.

## Useful commands
| Command | Purpose |
|---|---|
| `npm run dev` | Start WXT development mode |
| `npm run build` | Build the production extension |
| `npm run build:zip` | Package the extension |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript checks |
| `npm test` | Run Vitest once |

## Documentation
See [product requirements](docs/product-requirements.md), [architecture](docs/architecture.md), [data model](docs/data-model.md), [security and privacy](docs/security-privacy.md), [autofill engine](docs/autofill-engine.md), [testing strategy](docs/testing-strategy.md), [release process](docs/release-process.md) and [roadmap](docs/roadmap.md).
