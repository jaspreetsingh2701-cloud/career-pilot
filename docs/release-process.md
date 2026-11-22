# Release Process

## Continuous integration (GitHub Actions)
On every pull request: install, lint, typecheck, unit tests, extension build. Playwright extension tests run on main and on release branches.

## Release steps
1. Complete the security and privacy release checklist.
2. Bump version in package.json and manifest; update the changelog.
3. Build and zip the extension; review the generated manifest permissions.
4. Load the zip unpacked and run the manual compatibility matrix.
5. Prepare Chrome Web Store listing: description, screenshots, privacy disclosures matching actual behavior, single-purpose statement, justification for each permission.
6. Submit for review; tag the release after approval.

## Housekeeping
Add a license (owner's choice), CONTRIBUTING notes, a repo description and topics on GitHub.
