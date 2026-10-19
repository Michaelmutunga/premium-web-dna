# AI Consumption Layer

Coding agents read small, structured files more reliably than a long audit. The AI layer is a compressed, deterministic view of the DNA.

## File roles

| File | Audience | Purpose |
|---|---|---|
| `SKILL.md` | Agent | Workflow and reference map |
| `design-dna.json` | Agents and tools | Source of truth |
| `ai-rules.json` | Coding agents | Fast decisions |
| `fingerprints.json` | Agents and prompts | Named posture presets |
| `references/*.md` | Humans and agents | Detail on demand |

## Load order

1. `SKILL.md`
2. `fingerprints.json` (default)
3. `ai-rules.json`
4. `design-dna.json` when a rule needs evidence
5. `references/*.md` only for the section being built

This keeps context small while preserving traceability.

## ai-rules.json contract

```json
{
  "schema_version": "1.0",
  "framework": "DNA Audit Framework v1",
  "framework_version": "1.0.0",
  "source": {
    "name": "African Bison Classic Tours",
    "slug": "african-bison",
    "version": "1.0.0"
  },
  "archetype": "Explorer-Luxury",
  "fingerprint": {
    "archetype": "Explorer-Luxury",
    "density": "spacious",
    "contrast": "high",
    "motion_style": "cinematic",
    "cta_style": "confidence-based",
    "card_style": "elevated",
    "navbar_style": "transparent-blur"
  },
  "global": {
    "max_font_families": 2,
    "accent_budget_per_viewport": 5,
    "corner_radius": "2px",
    "motion_easing": "cubic-bezier(0.16, 1, 0.3, 1)",
    "forbidden": [
      "glassmorphism on content",
      "decorative gradients",
      "third font family"
    ]
  },
  "tokens": {
    "colors": {},
    "typography": {},
    "spacing": {},
    "radii": {},
    "motion": {}
  },
  "hero": {
    "preferred_variant": "editorial",
    "headline_length": "8-16 words",
    "cta_count": 2
  },
  "components": [
    {
      "id": "hero-editorial",
      "component": "Hero",
      "variant": "editorial",
      "confidence": 0.95
    }
  ],
  "pages": [],
  "rules": {
    "do": [],
    "dont": []
  }
}
```

## Compilation

Generate the AI layer from the DNA:

```bash
node scripts/compile-ai-layer.mjs --dna design-dna.json --out .
```

Check for drift:

```bash
node scripts/compile-ai-layer.mjs --dna design-dna.json --out . --check
```

The validator also compares the files. Drift is an error, not a warning.

## Agent prompt pattern

```text
Read fingerprints.json and select Explorer-Luxury.
Read ai-rules.json.
Build the page using only the listed components and tokens.
If a required component is below confidence 0.50, compose from primitives
and record the assumption. Do not add new colours, fonts, radii, or motion.
Validate the output against design-dna.json.
```

## Token budget

Keep `ai-rules.json` under roughly 200 lines. It should contain decisions, not prose. Put explanations in references.

Compress by:

- listing component IDs and confidence, not full anatomy;
- using token names and values, not rationale;
- keeping page recipes to section order;
- moving evidence to `design-dna.json`.

## Evidence pointers

When an agent needs to justify a choice, it can read:

```json
{
  "component": "hero-editorial",
  "evidence": ["app/page.tsx:23", "components/hero.tsx:11"]
}
```

Do not duplicate evidence arrays into the AI layer; point to the DNA.

## Consistency rules

- `ai-rules.json.source.slug` must equal `design-dna.json.meta.slug`.
- `ai-rules.json.archetype` must equal the fingerprint archetype.
- `fingerprint` must be deep-equal.
- Component IDs must exist in the DNA.
- Page types must exist in the DNA.
- `forbidden` must come from `rules.dont`.

## Anti-patterns

- Hand-editing `ai-rules.json`.
- Putting a 2,000-word rationale in a JSON value.
- Omitting confidence to make the file smaller.
- Using the AI layer as the only source and ignoring the DNA.
- Letting generated files disagree.
