# Token Extraction

A token is a decision that repeats. Extract tokens only when the source declares or consistently applies them. A single hard-coded value is a usage, not necessarily a token.

## Source order

1. Design-token JSON or YAML.
2. CSS custom properties, usually `:root` or `@theme`.
3. Tailwind config or `@theme` block.
4. SCSS/Less variables and mixins.
5. Component-level styles that repeat across files.
6. Runtime computed styles, when static sources are insufficient.

Record the source for every token as `file:line`.

## Colour

### What to capture

- token name, value, colour space, alpha;
- semantic role: surface, text, border, accent, state;
- usage count and representative evidence;
- foreground/background pairs actually used;
- aliases and deprecated tokens;
- scrims and overlays, which are media-only unless proven otherwise.

### Alpha hierarchy

Prefer deriving hierarchy from one ink and one light token rather than adding grey tokens:

| Purpose | Light surface | Dark surface |
|---|---|---|
| Structural border | `ink/10`, `ink/15` | `ivory/10`, `ivory/15` |
| Form border | `ink/20` | `ivory/30`, `ivory/40` |
| Secondary text | `ink/60`, `ink/70` | `ivory/65`, `ivory/70`, `ivory/75` |
| Hover border | `ink/40`, `ink` | `ivory/60`, `ivory` |
| Quiet fill | `ink/5` | `ivory/10` |

### Contrast

Compute every pair that carries text or a meaningful icon:

```bash
node scripts/contrast.mjs --fg "#14120f" --bg "#faf7f1"
```

Rules:

- normal text: `>= 4.5:1`;
- large text: `>= 3:1`;
- UI boundaries and focus indicators: `>= 3:1`;
- do not treat a barely passing ratio as safe across photography or opacity stacks.

Store the result as:

```json
{
  "foreground": "ink",
  "background": "ivory",
  "ratio": 17.49,
  "aa_normal": true,
  "aa_large": true,
  "aaa_normal": true
}
```

### Colour distribution

Record whether the palette is balanced or tonal. For tonal systems, estimate the surface share:

- light surfaces;
- mid-tone or dark chapters;
- type and accent.

An accent budget is a useful rule: count how many times the accent appears per viewport. If it exceeds five, the accent is no longer an accent.

## Typography

### What to capture

- families, roles, and loading method;
- variable axes and fallbacks;
- full scale: utility, family, size, line height, tracking, weight, use;
- responsive behaviour of the scale;
- measure in characters;
- uppercase rules, italic rules, numeral rules;
- link and underline treatment.

### Scale table

```json
{
  "name": "type-h1",
  "family": "display",
  "size": "clamp(2rem, 4vw, 3.25rem)",
  "line_height": 1.08,
  "tracking": "-0.01em",
  "weight": 560,
  "use": "page and feature titles"
}
```

### Checks

- Is there more than one display family? If so, find the reason.
- Are body sizes below 16px? Flag iOS zoom and readability risk.
- Is uppercase used for more than labels and display? Flag it.
- Is the measure wider than about 75 characters? Flag readability.
- Are numerals tabular where prices, dates, or counts align?

## Spacing

Capture the base unit and the working set. A 4px base with a small set of steps is common:

```text
4, 8, 12, 16, 20, 24, 32, 40, 56, 80, 112
```

Record:

- section padding;
- feature-section padding;
- container gutters;
- grid gaps;
- stack gaps;
- component padding.

Do not enumerate every arbitrary Tailwind value. Sample the repeated rhythm and note exceptions.

## Shape

Record radii by element class:

| Element | Radius |
|---|---|
| Buttons, cards, inputs, dialogs, media | - |
| Badges, chips | - |
| Avatars, marks | - |

A single sharp radius on rectangles and full pills on badges is a strong signature. If the site mixes 2px, 8px, and 16px without a rule, flag it as inconsistency.

## Borders and shadows

- Record border widths, colours, and alpha.
- Record whether depth comes from borders, surface tone, or shadows.
- Count box shadows. A system with one restrained interaction shadow is different from a card system with layered shadows.
- Note focus rings separately: they are accessibility, not decoration.

## Motion tokens

Capture:

- easing functions and names;
- duration steps;
- delays and staggers;
- spring values;
- scroll interpolation;
- exceptions such as Ken Burns, orbital rotation, or header transitions.

```json
{
  "easings": {
    "expo": "cubic-bezier(0.16, 1, 0.3, 1)"
  },
  "durations": {
    "quick": "0.35s",
    "base": "0.7s",
    "slow": "1.1s"
  }
}
```

## Breakpoints

Record declared breakpoints and how the layout recomposes. Do not assume a framework's defaults are the design's breakpoints. Note:

- navigation collapse;
- grid column changes;
- type-scale changes;
- image crop changes;
- motion changes.

## Z-index

Record named layers and their order. An ad hoc `z-index: 9999` is a finding.

## Token output contract

```json
{
  "colors": {
    "ink": { "value": "#14120f", "role": "text", "evidence": ["app/globals.css:10"] }
  },
  "typography": {
    "families": [],
    "scale": []
  },
  "spacing": {
    "base": "4px",
    "scale": []
  },
  "radii": {},
  "borders": {},
  "shadows": {},
  "motion": {
    "easings": {},
    "durations": {}
  },
  "breakpoints": {},
  "z_index": {}
}
```

## Anti-patterns

- Naming a token after a colour value (`--blue-500`) when the source uses a semantic name.
- Adding a new token because a generated page needs one.
- Treating a gradient scrim as a brand gradient.
- Averaging colours across light and dark chapters.
- Reporting contrast from a token pair that never appears together.
- Ignoring opacity stacks over photography.
