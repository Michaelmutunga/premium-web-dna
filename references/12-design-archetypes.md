# Design Archetypes

Industry is a weak signal. Two safari operators can need completely different visual systems. Archetype describes the brand's posture, which travels across industries and makes the DNA reusable.

## The twelve archetypes

| Archetype | Core promise | Typical signals |
|---|---|---|
| Luxury | Rare, quiet, assured | Restraint, generous space, fine detail, low colour count |
| Explorer | Discovery, ground knowledge | Full-bleed landscape, documentary photography, maps, field notes |
| Authority | Expertise, certainty | Strong hierarchy, data, credentials, editorial serif, structured proof |
| Craftsmanship | Made by hand, made well | Material texture, process, detail crops, warm neutrals |
| Technology | Capability, precision | Grid, mono accents, product UI, data density, cool neutrals |
| Innovation | New possibility | Asymmetry, motion, experimental type, bold contrast |
| Industrial | Scale, utility, resilience | Dense layout, strong grids, functional type, raw materials |
| Institutional | Trust, continuity | Conservative palette, formal type, governance, accessibility |
| Hospitality | Welcome, care, place | Warm palette, people, interiors, generous imagery, soft rhythm |
| Community | Belonging, shared voice | Portraits, testimonials, round shapes, conversational copy |
| Minimal | Clarity, reduction | White space, few elements, precise type, restrained motion |
| Editorial | Story, point of view | Strong serif, rules, captions, long-form rhythm, authorial voice |

## Detection method

For each archetype, score fit `0-5` using evidence:

| Score | Meaning |
|---|---|
| 5 | Defining signal, repeated across the site |
| 4 | Strong signal in several places |
| 3 | Present but not dominant |
| 2 | Weak or isolated signal |
| 1 | Trace amount |
| 0 | Absent or contradicted |

Score these dimensions:

1. Photography and art direction.
2. Typography.
3. Colour and material.
4. Layout and density.
5. Motion.
6. Copy and voice.
7. Proof and trust.
8. Interaction patterns.

Select:

- **Primary:** highest score, must be `>= 3`.
- **Secondary:** next distinct highest, must be `>= 2`.
- **Tertiary:** optional, must be `>= 2`.

If two archetypes tie, choose the one that better explains the hero and the primary conversion path. Record the tie and the decision.

## African Bison example

```text
Primary:   Explorer   (5)
Secondary: Luxury     (4)
Tertiary:  Hospitality (3)
```

Evidence:

- Explorer: full-bleed East African landscapes, documentary safari vehicles, route line, place-specific itineraries.
- Luxury: generous spacing, restrained palette, editorial serif, quiet CTAs, no discounts or urgency.
- Hospitality: people and lodge interiors, "planned around you", local Nairobi base, contact-first closing.

Fingerprint: `Explorer-Luxury`.

## Archetype profiles

### Luxury

- Palette: low count, deep neutrals, one metallic or earth accent.
- Type: high-contrast serif or refined sans, generous tracking on labels.
- Space: spacious, slow rhythm, few elements per viewport.
- Motion: slow, controlled, minimal.
- Imagery: large, art-directed, few but excellent.
- Risk: coldness, exclusion, empty luxury with no proof.

### Explorer

- Palette: earth, sand, sky, deep green.
- Type: editorial serif plus humanist sans.
- Space: cinematic full-bleed chapters, maps, route lines.
- Motion: parallax, Ken Burns, draw paths.
- Imagery: documentary, real guides, vehicles, weather.
- Risk: cliché safari tropes, fake maps, romanticised claims.

### Authority

- Palette: ink, paper, one signal colour.
- Type: serif headlines, structured sans body.
- Space: strong grids, data tables, footnotes.
- Motion: restrained, functional.
- Imagery: evidence, diagrams, portraits.
- Risk: dryness, over-density, credentials without warmth.

### Craftsmanship

- Palette: warm neutrals, material tones.
- Type: humanist or transitional serif.
- Space: detail crops, process sequences.
- Motion: tactile, slow reveals.
- Imagery: hands, tools, texture, making.
- Risk: nostalgia, roughness without clarity.

### Technology

- Palette: cool neutrals, one electric accent.
- Type: geometric sans, mono for data.
- Space: precise grid, product UI.
- Motion: fast, functional, state-driven.
- Imagery: product screenshots, diagrams.
- Risk: generic SaaS, gradient clutter, feature soup.

### Innovation

- Palette: high contrast, unexpected accent.
- Type: expressive, variable, large.
- Space: asymmetry, broken grid.
- Motion: experimental, but bounded.
- Imagery: abstract or generative.
- Risk: novelty without usability, motion sickness.

### Industrial

- Palette: steel, rust, concrete, safety colours.
- Type: condensed or grotesque.
- Space: dense, modular, utilitarian.
- Motion: minimal, mechanical.
- Imagery: scale, process, infrastructure.
- Risk: aggression, poor readability.

### Institutional

- Palette: navy, grey, restrained accent.
- Type: formal serif or neutral sans.
- Space: conservative grid, high legibility.
- Motion: minimal.
- Imagery: people, facilities, governance.
- Risk: anonymity, bureaucracy, low distinction.

### Hospitality

- Palette: warm neutrals, food and place tones.
- Type: friendly serif or rounded sans.
- Space: generous, image-led, human.
- Motion: soft, welcoming.
- Imagery: people, rooms, meals, place.
- Risk: generic warmth, stock smiles, no specificity.

### Community

- Palette: warm, accessible, varied.
- Type: humanist, readable.
- Space: portraits, quotes, conversation.
- Motion: gentle, social.
- Imagery: real members, gatherings.
- Risk: cluttered, informal to the point of low trust.

### Minimal

- Palette: monochrome plus one accent.
- Type: precise sans or restrained serif.
- Space: white space as the main material.
- Motion: subtle, quick.
- Imagery: sparse, essential.
- Risk: emptiness, low information scent, fragile hierarchy.

### Editorial

- Palette: paper, ink, one accent.
- Type: strong serif, clear sans, captions.
- Space: rules, columns, long-form rhythm.
- Motion: page-turn or reveal, restrained.
- Imagery: commissioned, captioned, credited.
- Risk: slow task flows, decoration over utility.

## Output record

```json
{
  "primary": "Explorer",
  "secondary": "Luxury",
  "tertiary": "Hospitality",
  "confidence": 0.9,
  "scores": {
    "Explorer": 5,
    "Luxury": 4,
    "Hospitality": 3,
    "Editorial": 2
  },
  "evidence": [
    "app/page.tsx:44 full-bleed hero",
    "app/globals.css:8 earth palette",
    "components/motion/draw-path.tsx:12 route drawing"
  ]
}
```

## Using archetypes

- The fingerprint uses the primary-secondary pair.
- The decision engine uses the archetype to resolve ambiguous surface, type, and motion choices.
- The page generator uses the archetype to choose section order and proof style.
- The score uses Brand Distinction to ask whether the archetype is actually expressed, not merely named.

## Anti-patterns

- Choosing an archetype from the industry alone.
- Selecting five archetypes.
- Naming "Luxury" because the palette is beige.
- Ignoring contradictory evidence.
- Using the archetype to justify a pattern the site does not contain.
