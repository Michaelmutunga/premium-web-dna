# Repository instructions

## Commands

- Install: `npm ci`
- Full check: `npm run check`
- Lint only: `npm run lint`
- Tests only: `npm test`
- Repository verification: `npm run verify`

Run `npm run check` before committing. The project requires Node 22 or newer.

## Conventions

- Runtime scripts must stay dependency-free.
- Keep the DNA Audit Framework v1 field names and `schema_version: "1.0"`.
- Do not add client-specific content to `templates/` or `examples/_template/`.
- African Bison is a blocked worked reference. Do not mark it `released` without rights clearance, a compliant hero video, and a new audit version.
- Captured sites and client assets are not committed.
- Keep evidence citations as `file:line`.
