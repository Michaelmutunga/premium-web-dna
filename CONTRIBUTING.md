# Contributing

## Ground rules

1. Evidence before taste. Every design claim needs a `file:line`, a timestamped
   URL, or a named artefact.
2. Never invent client data. Do not add tokens, components, scores, quotes,
   reviews, awards, prices, or imagery that the source does not support.
3. Do not commit client source code, photography, logos, fonts, or copy.
4. Keep `design-dna.json` as the source of truth. `ai-rules.json` and
   `fingerprints.json` are compiled; do not hand-edit them into disagreement.
5. A client is not `released` while a P0 finding is open.

## Local workflow

```bash
npm ci
npm run check
```

`npm run check` runs Biome, the unit and integration tests, and the repository
verifier. `npm run verify` checks Markdown links, `SKILL.md` frontmatter,
template hygiene, and every example's ability to scaffold and validate.

## Adding or updating an audit

1. Confirm written authorisation.
2. Copy `examples/_template/` to `examples/<client-slug>/`.
3. Complete the audit and `design-dna.json` from evidence.
4. Add the accessibility findings and contrast pairs.
5. Set `provenance.status` to `audit-complete` or `blocked`, and list any
   publication blockers.
6. Run `npm run verify`.
7. Update `examples/README.md`.

## Changing the schema

- Add a migration note when a change is breaking.
- Bump `schema_version` for breaking contract changes.
- Update the template, the example DNA, the validator, and the tests together.
- Keep the runtime scripts dependency-free. Development-only packages belong in
  `devDependencies`.

## Style

- Use plain Node.js ES modules.
- Keep scripts cross-platform: no shell-only path separators or glob handling.
- Prefer clear, specific errors over silent defaults.
- Do not add a dependency when a small local helper is enough.
