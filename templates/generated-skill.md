---
name: {{SKILL_NAME}}
description: Applies the {{DISPLAY_NAME}} design DNA to new pages and sections. Use when building or extending {{DISPLAY_NAME}} interfaces, generating page blueprints, matching components, or checking an implementation against the extracted tokens, fingerprint, motion rules, and accessibility constraints.
---

# {{DISPLAY_NAME}} - Design DNA

Fingerprint: `{{ARCHETYPE}}`
Framework: `{{FRAMEWORK}}` / `{{FRAMEWORK_VERSION}}`
DNA version: `{{DNA_VERSION}}`
Audited: `{{AUDIT_DATE}}`

## When to use this skill

Use it to:

- generate a new page in the {{DISPLAY_NAME}} visual system;
- extend an existing page with a section that belongs to the brand;
- match a required section to an existing component;
- check a build against the tokens, fingerprint, and motion rules;
- explain why a proposed design does or does not fit.

Do not use it to clone an existing page or to invent facts about the client.

## Read order

1. `fingerprints.json` - choose the posture.
2. `ai-rules.json` - the compressed decisions.
3. `design-dna.json` - the source of truth when evidence is needed.
4. `references/` - detail for the specific page or component.

## Page generation workflow

1. Read the page brief.
2. Load the default fingerprint and any page variant.
3. Choose a page type from `references/page-recipes.md`.
4. List sections in narrative order.
5. Match each section to a component with confidence `>= 0.50`.
6. Compose from primitives if no fit exists; record the assumption.
7. Use only tokens from `references/design-tokens.md`.
8. Use only motion primitives from `references/motion.md`.
9. Add all states: loading, empty, error, success, disabled.
10. Add accessibility notes and a reduced-motion fallback.
11. Validate the result against the DNA.

## Hard rules

- Never add a colour, font, radius, shadow, or motion curve that is not in the DNA.
- Never copy client assets, source code, or copy.
- Never invent reviews, awards, prices, availability, or guarantees.
- Keep the accent budget at or below `{{ACCENT_BUDGET}}` appearances per viewport.
- Use at most `{{MAX_FAMILIES}}` font families.
- Use the extracted corner radius: `{{CORNER_RADIUS}}`.
- Use the extracted easing: `{{MOTION_EASING}}`.
- Every generated section needs a still fallback.

## Fingerprint summary

```json
{{FINGERPRINT_JSON}}
```

## Reference map

| File | Use |
|---|---|
| `references/design-tokens.md` | Colours, spacing, radii, borders, motion |
| `references/typography.md` | Families, scale, measure |
| `references/layout.md` | Containers, rhythm, grids, surfaces |
| `references/components.md` | Inventory, anatomy, states, confidence |
| `references/motion.md` | Primitives, choreography, fallbacks |
| `references/imagery.md` | Art direction, assets, alt text |
| `references/content-voice.md` | Voice and copy rules |
| `references/accessibility.md` | WCAG and quality gates |
| `references/page-recipes.md` | Page types and section order |
| `references/decision-rules.md` | Selection and conflict rules |
| `references/provenance.md` | Source, licence, limits, release status, blockers |

## Validation

Run the Premium Web DNA validator from the meta-skill package against this directory:

```bash
node scripts/validate-dna-skill.mjs <path-to-this-skill>
```

A page is not on brand if it uses a component with confidence below `0.50` without recording the assumption.

## Provenance

See `references/provenance.md`. This skill contains design principles and measurements, not client assets.
