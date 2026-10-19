# Extraction Template

Copy this folder to `examples/<client-slug>/` when an authorised audit begins.

## Files

| File | Use |
|---|---|
| `DESIGN-DNA-AUDIT.md` | The Framework v1 audit report |
| `design-dna.json` | The structured DNA to complete from the audit |

## Workflow

```bash
npm run scan -- <repo> --out examples/<client-slug>/signals.json
node scripts/contrast.mjs --pairs examples/<client-slug>/contrast-pairs.json
node scripts/scaffold-dna-skill.mjs --slug <client-slug> --name "<Client Name>" --dna examples/<client-slug>/design-dna.json --out generated/<client-slug>-design-dna
node scripts/validate-dna-skill.mjs generated/<client-slug>-design-dna
```

Replace every example value with evidence-backed values. Delete keys that start with an underscore. Do not add data that is not supported by a citation.
