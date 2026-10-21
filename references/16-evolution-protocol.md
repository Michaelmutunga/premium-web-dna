# Evolution Protocol

`premium-web-dna` is a library, not a one-off audit. This document defines how it grows without losing comparability or provenance.

## Library index

`examples/README.md` is the canonical index:

| Client | Status | Release | Framework | Archetype | Score | Fingerprint | Audited |
|---|---|---|---|---|---|---|---|
| African Bison | Audit complete | Blocked: 2 open P0s | v1 | Explorer / Luxury / Hospitality | 88 | Explorer-Luxury | 2026-10-19 |
| Queensland Nuts | Queued | - | - | - | - | - | - |
| Muta Automations | Queued | - | - | - | - | - | - |
| TCDL | Queued | - | - | - | - | - | - |

Statuses:

- `queued`: source identified, no audit started.
- `in-progress`: evidence collection underway.
- `audit-complete`: the audit and DNA are finished and schema-valid.
- `released`: the generated skill is validated and no P0 finding is open.
- `blocked`: authorisation, access, or licence issue prevents release.
- `superseded`: replaced by a newer version or merge.

Never mark a client `released` without a validated skill and resolved P0 findings. `audit-complete` is not a publication claim.

## Adding a client

1. Copy `examples/_template/` to `examples/<client-slug>/`.
2. Record source and authorisation.
3. Run the framework Phases 0-12.
4. Place the audit and DNA in the client folder.
5. Generate the skill under `generated/<client-slug>-design-dna/`.
6. Validate.
7. Add a row to `examples/README.md`.
8. Do not copy the client's assets into the library.

Suggested folder:

```text
examples/<client-slug>/
├── README.md
├── DESIGN-DNA-AUDIT.md
└── design-dna.json
```

The generated skill can live outside `examples/` to keep the library small.

## Re-audit triggers

Re-audit when:

- the framework version changes;
- the source design changes materially;
- the client rebrands;
- a P0 finding is resolved;
- a new page archetype is required;
- the DNA is merged into a new house system;
- more than 12 months have passed for an active client.

A re-audit produces a new `meta.version`. Do not edit an `audit-complete` or `released` audit silently.

## Versioning

### Framework

`DNA Audit Framework v1` / `1.0.0`.

A framework change that alters phase definitions or score weights requires a new major version. Old audits keep their original version.

### DNA package

- `1.0.0`: first validated audit.
- `1.1.0`: new components or pages, no breaking change.
- `2.0.0`: changed tokens, archetype, or rules that alter generated output.

### Schema

Bump `schema_version` when the JSON contract changes. Provide a migration note.

### Merge release

A merged system is a new package with its own version and provenance. It does not increment the source packages.

## Deprecation

When a token or component is replaced:

- mark it `deprecated` in the DNA;
- keep it for one minor version;
- record the replacement;
- update the AI layer;
- remove it in the next major version.

Do not delete evidence. Keep the audit history.

## Quality gates

A client row can be `audit-complete` when:

- the audit follows Framework v1;
- the score totals 100;
- the fingerprint uses the controlled vocabulary;
- every component has confidence and evidence;
- the DNA passes schema validation;
- provenance and licences are recorded;
- P0 issues are either resolved or explicitly listed as publication blockers.

A client row can be `released` only when the `audit-complete` gates pass, the generated skill validates, and no P0 issue is open.

## Merge cadence

Merge when:

- three or more clients share a pattern worth codifying;
- a house style is requested;
- a new service line needs a common baseline;
- an archetype combination repeats.

Do not merge everything into one system. A library can contain several fingerprints.

## Privacy and permissions

- Keep client audits private unless permitted.
- Redact personal data.
- Do not include assets.
- Record the scope of permission.
- Remove confidential findings before sharing a merged system.

## Maintenance

- Run `npm test` after changing scripts.
- Run the validator on every generated skill.
- Keep the scanner's skip list current for new build tools.
- Re-check contrast tokens when a palette changes.
- Review queued clients quarterly.

## Anti-patterns

- Editing a completed audit without a version bump.
- Adding a client row before validation.
- Merging before the source audits are complete.
- Deleting an old framework version.
- Letting the index drift from the folders.
- Treating a queued client as if it had been audited.
