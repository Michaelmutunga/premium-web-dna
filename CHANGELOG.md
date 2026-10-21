# Changelog

All notable changes to this project are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project follows
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- JSON Schema validation for `design-dna.json`, `ai-rules.json`, and
  `fingerprints.json`.
- `accessibility` and `provenance.status` contracts, including publication
  blockers and open P0 checks.
- Structured evidence counting and validation.
- `npm run verify` repository checks for links, frontmatter, template hygiene,
  and example scaffolding.
- Cross-platform CI matrix for Node 20 and 22 on Ubuntu and Windows.
- Biome linting and an Ajv schema oracle in the test suite.
- MIT and CC BY 4.0 licence files with a client-content exclusion notice.
- `SECURITY.md` and `CONTRIBUTING.md`.

### Changed

- `templates/` and `examples/_template/` no longer contain client-specific
  tokens, scores, components, or evidence.
- `scaffold-dna-skill.mjs` no longer invents provenance, confidence, hero rules,
  accent budgets, or motion values.
- Existing 1.0 DNA must add an `accessibility` object and a
  `provenance.status`; blocked audits must list `publication_blockers`.
- African Bison is recorded as `Audit complete` with release blocked by two open
  P0 findings.
- The test command now uses `node --test` for Windows and POSIX parity.
- The merge engine now emits `surfaces`, `accessibility`, release status,
  publication blockers, and a recomputed evidence count.

### Security

- Capture rejects credential-bearing, private, loopback, link-local, and
  reserved targets by default.
- Capture validates redirects, caps response and HTML size, and redacts
  sensitive response headers.
- Capture validates viewport, timeout, byte, and redirect limits.

### Fixed

- Evidence count mismatch in the African Bison example.
- Missing accessibility findings in the structured DNA.
- Merged DNA omitted `surfaces`, accessibility, release status, and blocker
  provenance.
- Scanner evidence line lookup is now logarithmic instead of quadratic.

## [1.0.0] - 2026-10-19

### Added

- DNA Audit Framework v1.
- Premium scorecard, fingerprint vocabulary, merge engine, and generated-skill
  contract.
- Zero-dependency scanner, contrast checker, scaffolder, compiler, merge tool,
  validator, and optional runtime capture.
- African Bison worked reference.
