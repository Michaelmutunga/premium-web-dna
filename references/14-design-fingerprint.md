# Design Fingerprint

A fingerprint is the smallest set of decisions that makes a brand recognisable. It is not the whole audit and not a substitute for tokens and components.

## Required fields

```json
{
  "archetype": "Explorer-Luxury",
  "density": "spacious",
  "contrast": "high",
  "motion_style": "cinematic",
  "cta_style": "confidence-based",
  "card_style": "elevated",
  "navbar_style": "transparent-blur"
}
```

## Controlled vocabulary

### archetype

`Primary` or `Primary-Secondary` from the twelve archetypes. Example: `Explorer-Luxury`.

### density

| Value | Meaning |
|---|---|
| `compact` | Dense, many elements per viewport |
| `balanced` | Standard editorial density |
| `spacious` | Few elements, generous whitespace |
| `editorial` | Variable density driven by story rhythm |

### contrast

| Value | Meaning |
|---|---|
| `low` | Soft tonal range, low separation |
| `medium` | Clear hierarchy, moderate separation |
| `high` | Strong light/dark or type/surface separation |
| `extreme` | Near-black and near-white, deliberate drama |

### motion_style

| Value | Meaning |
|---|---|
| `static` | Almost no motion |
| `subtle` | Small fades and state changes |
| `smooth` | Consistent transitions and reveals |
| `cinematic` | Choreographed hero, parallax, slow camera moves |
| `expressive` | Experimental or high-energy motion |

### cta_style

| Value | Meaning |
|---|---|
| `direct` | Explicit action and urgency |
| `confidence-based` | Quiet, assured, no pressure |
| `consultative` | Conversation or planning first |
| `urgency` | Time or scarcity pressure; must be honest |
| `minimal` | Text link or single button |

### card_style

| Value | Meaning |
|---|---|
| `flat` | No border or shadow; surface tone only |
| `bordered` | Hairline border, no elevation |
| `elevated` | Restrained shadow or floating surface |
| `editorial` | Type-led, image-led, minimal chrome |
| `immersive` | Full-bleed media with overlay text |

### navbar_style

| Value | Meaning |
|---|---|
| `solid` | Always a solid surface |
| `transparent` | Overlay without blur |
| `transparent-blur` | Overlay with blur |
| `minimal` | Wordmark and few links |
| `masthead` | Oversized brand mark and two-tier header |

## Optional extended fields

Use only when they add decision value:

```json
{
  "surface_rhythm": "alternating",
  "imagery_style": "documentary",
  "typography_voice": "editorial-serif",
  "geometry": "sharp",
  "accent_strategy": "single",
  "type_contrast": "editorial",
  "proof_style": "specific-and-live"
}
```

## Derivation

| Field | Evidence |
|---|---|
| archetype | Archetype fit table, hero, conversion path |
| density | Section padding, elements per viewport, measure |
| contrast | Surface/type pairs, scrim use, accent |
| motion_style | Easing, duration, choreography, scroll effects |
| cta_style | CTA copy, count, urgency, proof |
| card_style | Border/shadow/surface, hover behaviour |
| navbar_style | Header height, transparency, blur, scroll state |

Every field should cite evidence in the audit. If a field is inferred, mark it.

## Variants

Support responsive or thematic variants:

```json
{
  "default": "Explorer-Luxury",
  "fingerprints": {
    "Explorer-Luxury": { "...": "..." },
    "Explorer-Luxury@mobile": {
      "density": "balanced",
      "navbar_style": "minimal"
    },
    "Explorer-Luxury@admin": {
      "density": "compact",
      "motion_style": "static",
      "card_style": "flat"
    }
  }
}
```

Variants inherit unspecified fields from the default.

## Inheritance

When generating a page:

1. Load the default fingerprint.
2. Apply the page-type variant if one exists.
3. Apply the surface variant if one exists.
4. Never override a field without recording why.

## Use in prompts

```text
Generate the homepage using fingerprint Explorer-Luxury.
Use the African Bison DNA. Keep density spacious, contrast high,
motion cinematic, CTAs confidence-based, cards bordered, navbar masthead.
Do not add new colours, fonts, or radii.
```

The fingerprint alone is not enough for a faithful page. Pair it with `design-dna.json`, `ai-rules.json`, and the component inventory.

## Validation

The validator checks:

- required fields exist;
- enums are valid;
- default key exists in `fingerprints.json`;
- component and page references resolve;
- no field contradicts the tokens without a recorded decision.

## Anti-patterns

- Fingerprinting a brand from one page.
- Using the fingerprint to avoid reading the audit.
- Mixing two archetypes into a list of five.
- Encoding implementation details (`navbar-blur-12px`) instead of design posture.
- Changing the fingerprint per page without documenting a variant.
