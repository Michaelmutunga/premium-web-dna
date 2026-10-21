# Skill Generation Specification

The generated skill is the reusable product. It must be small enough for an agent to load, detailed enough to preserve the brand, and honest about what was not known.

## Folder contract

```text
<slug>-design-dna/
├── SKILL.md
├── design-dna.json
├── ai-rules.json
├── fingerprints.json
├── references/
│   ├── design-tokens.md
│   ├── typography.md
│   ├── layout.md
│   ├── components.md
│   ├── motion.md
│   ├── imagery.md
│   ├── content-voice.md
│   ├── accessibility.md
│   ├── page-recipes.md
│   ├── decision-rules.md
│   └── provenance.md
└── templates/
    ├── design-tokens.css
    ├── page-brief.md
    └── component-spec.md
```

## SKILL.md

The generated `SKILL.md` must:

- have YAML frontmatter with `name` and `description`;
- stay under 500 lines;
- state the fingerprint and archetype;
- explain when to use the skill;
- describe the page generation workflow;
- link to every reference one level deep;
- include the no-invention and no-clone rules;
- include the validation command;
- not duplicate the full audit.

## design-dna.json

This is the source of truth. Required top-level fields:

| Field | Purpose |
|---|---|
| `schema_version` | JSON contract version |
| `framework` | `DNA Audit Framework v1` |
| `framework_version` | `1.0.0` |
| `meta` | name, slug, version, date, source, confidence, licence |
| `archetype` | primary, secondary, tertiary, confidence, evidence |
| `fingerprint` | controlled fingerprint fields |
| `tokens` | colour, typography, spacing, radii, borders, shadows, motion, breakpoints |
| `surfaces` | named surfaces and text tokens |
| `components` | inventory with confidence and evidence |
| `pages` | supported page types and section order |
| `rules` | do, don't, limits, hero rules |
| `scores` | 100-point scorecard |
| `provenance` | source, licence, restrictions, evidence count, status, publication blockers |

## ai-rules.json

Compiled from `design-dna.json`. It is a compressed decision layer for coding agents.

Required fields:

- `schema_version`, `framework`, `framework_version`;
- `source` (name, slug, version);
- `archetype` and `fingerprint`;
- `global` constraints;
- `tokens` summary;
- `hero` rules;
- `components` with confidence;
- `pages`;
- `rules`;
- `forbidden`.

Never hand-edit it into disagreement with the DNA. Recompile:

```bash
node scripts/compile-ai-layer.mjs --dna design-dna.json --out .
```

## fingerprints.json

A named map of fingerprints. The default key must match `fingerprint.archetype`.

```json
{
  "schema_version": "1.0",
  "framework": "DNA Audit Framework v1",
  "default": "Explorer-Luxury",
  "fingerprints": {
    "Explorer-Luxury": {
      "archetype": "Explorer-Luxury",
      "density": "spacious",
      "contrast": "high",
      "motion_style": "cinematic",
      "cta_style": "confidence-based",
      "card_style": "elevated",
      "navbar_style": "transparent-blur"
    }
  }
}
```

Support variants such as `Explorer-Luxury@mobile` with only the fields that change.

## References

Each generated reference should be specific to the client:

| File | Contents |
|---|---|
| `design-tokens.md` | Token tables with values, roles, evidence |
| `typography.md` | Families, scale, measure, rules |
| `layout.md` | Containers, rhythm, grids, surface sequence |
| `components.md` | Inventory with anatomy and confidence |
| `motion.md` | Tokens, primitives, fallbacks |
| `imagery.md` | Art direction, sources, placeholders, alt text |
| `content-voice.md` | Voice, sentence patterns, trust rules |
| `accessibility.md` | Strengths, issues, test commands |
| `page-recipes.md` | Page types and section order |
| `decision-rules.md` | Fingerprint, selection rules, fallbacks |
| `provenance.md` | Source, licence, limitations, release status, blockers |

## Templates

- `design-tokens.css`: a usable token block.
- `page-brief.md`: the input to page generation.
- `component-spec.md`: the anatomy and states of one component.

## Generation steps

1. Complete the audit.
2. Write `design-dna.json`.
3. Run `compile-ai-layer.mjs`.
4. Run `scaffold-dna-skill.mjs`.
5. Inspect the generated references for empty or generic sections.
6. Run `validate-dna-skill.mjs`.
7. Fix every error.
8. Record the output path and version.

## Versioning

- DNA package version: semantic (`1.0.0`).
- Framework version: independent (`1.0.0`).
- Schema version: independent (`1.0`).
- A material change to tokens, components, or rules bumps the DNA minor or major version.
- A framework change bumps the framework version and requires a re-audit note.

## Validation requirements

The validator checks:

- required files;
- frontmatter and line count;
- no unresolved placeholders;
- relative links;
- fingerprint vocabulary;
- component confidence and evidence;
- score totals;
- AI-layer consistency;
- provenance.

A generated skill is not complete until validation passes.

## Anti-patterns

- A 2,000-line SKILL.md.
- Copying the audit into the references without adapting it.
- Hand-maintaining `ai-rules.json`.
- Emitting a fingerprint that the DNA does not support.
- Leaving queue placeholders in a completed skill.
- Including client assets.
- Omitting provenance because the source is obvious.
