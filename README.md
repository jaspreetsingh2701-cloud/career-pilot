# CareerPilot

A local-first Chrome extension (Manifest V3) that reduces repetitive job-application data entry while keeping you in control.

## What it does
- Stores your profile, multiple resumes/cover letters and reusable answers **on your device only**.
- Detects fields on a job application form when you ask.
- Proposes values with confidence and evidence; **you approve** before anything is filled.
- Never submits the form and never touches sensitive fields (passwords, OTPs, payment, work-authorization declarations).

## Status
M1 — Extension foundation. Product workflows are intentionally not implemented yet; see [the roadmap](docs/roadmap.md).

## Stack
WXT, React, TypeScript, Tailwind CSS, chrome.storage.local, IndexedDB, Vitest, Playwright.

## Getting started
**Requirements:** Node.js 22 or newer and npm.

```bash
npm install
npm run dev
```

WXT starts the development build and prints the extension output directory. In Chrome, open `chrome://extensions`, enable **Developer mode**, choose **Load unpacked**, and select the generated `.output/chrome-mv3` directory. Keep the dev process running while developing.

Useful commands:

| Command | Purpose |
|---|---|
| `npm run dev` | Start WXT development mode |
| `npm run build` | Build the production extension |
| `npm run build:zip` | Package the extension |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript checks |
| `npm test` | Run Vitest once |
| `npm run test:watch` | Run Vitest in watch mode |

The M1 content-script messaging smoke test is deliberately restricted to `http://localhost/*` and `http://127.0.0.1/*`. It is not yet enabled on job sites. To test it, serve the fixture in a second terminal with `python -m http.server 4173 --directory tests/fixtures/local-page`, open `http://localhost:4173`, open the CareerPilot side panel, and select **Ping active local page**. Do not add broad host permissions as a shortcut; revisit permission scope alongside the user-initiated detection workflow in M3.

## Documentation
| Doc | Purpose |
|---|---|
| [Product requirements](docs/product-requirements.md) | Scope, FRs, acceptance criteria |
| [UX and screens](docs/ux-screens.md) | Screen list, first-run flow, empty/error states |
| [Design tokens and UI decisions](docs/design-tokens.md) | Colors, type, spacing, UI decisions, mockup link |
| [Mockups](docs/mockups/README.md) | Exported side-panel screens |
| [Architecture](docs/architecture.md) | Components, messaging, pipeline |
| [Data model](docs/data-model.md) | Schemas and persistence |
| [Security and privacy](docs/security-privacy.md) | Privacy promise, checklist |
| [Testing strategy](docs/testing-strategy.md) | Unit, fixture and browser tests |
| [Release process](docs/release-process.md) | CI and Chrome Web Store steps |
| [Roadmap](docs/roadmap.md) | Milestones M1 to M7 |
| [ADR 0001](docs/decisions/0001-local-first-mvp.md) | Local-first decision |
