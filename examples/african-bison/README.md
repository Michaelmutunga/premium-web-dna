# African Bison Classic Tours

The worked reference for DNA Audit Framework v1.

| Field | Value |
|---|---|
| Status | Complete |
| Source | `Michaelmutunga/African-Bison-Classic-Tours-` |
| Branch audited | `redesign/cinematic-ui` |
| Audit date | 2026-10-19 |
| Archetype | Explorer / Luxury / Hospitality |
| Fingerprint | `Explorer-Luxury` |
| Premium score | 88 / 100 (`Premium`) |
| Framework | DNA Audit Framework v1 / 1.0.0 |

## Artifacts

| File | Purpose |
|---|---|
| `DESIGN-DNA-AUDIT.md` | The evidence-backed audit narrative |
| `design-dna.json` | The structured source of truth |

## Why it scores 88

Strong visual system, disciplined type and spacing, a memorable Explorer-Luxury posture, honest content, and real trust signals. The deductions are for hover-only excerpts, an inactive-tab contrast failure, and a 9.2 MB hero video that exceeds the performance budget.

## Reproduce the checks

```bash
node scripts/contrast.mjs --fg "#14120f" --bg "#faf7f1"
node scripts/contrast.mjs --fg "#8c3f20" --bg "#faf7f1"
node scripts/scan-design-signals.mjs <path-to-African-Bison-repo> --out examples/african-bison/signals.json
node scripts/scaffold-dna-skill.mjs --slug african-bison --name "African Bison Classic Tours" --dna examples/african-bison/design-dna.json --out generated/african-bison-design-dna
node scripts/validate-dna-skill.mjs generated/african-bison-design-dna
```

## Boundaries

This folder contains design principles and measurements. It does not contain client source code, photography, logos, fonts, or copy. Image credits and licences must be resolved before publication.
