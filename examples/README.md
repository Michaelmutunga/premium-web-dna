# Examples

The examples directory is the library of completed and queued design-DNA extractions.

| Client | Status | Release | Archetype | Score | Fingerprint |
|---|---|---|---|---|---|
| [African Bison Classic Tours](./african-bison/) | Audit complete | Blocked: 2 open P0s | Explorer / Luxury / Hospitality | 88 | `Explorer-Luxury` |
| [Queensland Nuts](./queensland-nuts/) | Queued | - | - | - | - |
| [Muta Automations](./muta-automations/) | Queued | - | - | - | - |
| [TCDL](./tcdl/) | Queued | - | - | - | - |

`Audit complete` means the audit and DNA are finished. `Release` means the generated skill may be published. A client is not released while any P0 finding is open.

Queued folders contain no invented DNA. They are placeholders until an authorised extraction runs.

## Add an extraction

1. Copy `_template/` to a new folder named after the client slug.
2. Capture evidence and complete `DESIGN-DNA-AUDIT.md`.
3. Build `design-dna.json` from the audit, with `file:line` citations.
4. Run the scanner and contrast checks.
5. Scaffold the generated skill and validate it.
6. Update this index and the client README.

Never copy client source code, photography, logos, fonts, or copy into the library. The example folder stores the audit and the structured DNA, not client assets.
