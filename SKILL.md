---
name: premium-web-dna
description: Extracts a client website's design DNA from source code and optional runtime evidence into a reusable, versioned design-intelligence skill. Produces a DNA Audit Framework v1 report, a 100-point premium scorecard, a design fingerprint, AI rules, component confidence records, and mergeable design-DNA packages. Use when auditing a site's visual system, preserving brand DNA for new pages, scoring premium quality, generating a design skill, or merging multiple client design systems.
---

# Premium Web DNA - Global Skill Creator

## What this skill does

Turn an existing website into a portable design system. The output is not a clone and not a mood board. It is an evidence-backed package that another agent can use to build new pages in the same visual language.

Two outputs:

1. **Audit:** `DESIGN-DNA-AUDIT.md`, following **DNA Audit Framework v1**.
2. **Skill:** a generated `<slug>-design-dna/` package with `SKILL.md`, `design-dna.json`, `ai-rules.json`, `fingerprints.json`, references, and templates.

Read [references/01-extraction-protocol.md](references/01-extraction-protocol.md) first. It defines the phase contracts, evidence rules, and confidence model.

## Inputs

- A repository (preferred) or an authorised live URL.
- Optional brand guidelines, asset licences, analytics, and conversion data.
- The target stack for future pages, if known.
- Explicit permission to inspect the site.

If authorisation is unclear, stop and ask. Do not download or redistribute client assets.

## Output contract

```text
<slug>-design-dna/
├── SKILL.md
├── design-dna.json       # full machine-readable source of truth
├── ai-rules.json         # compressed agent instructions
├── fingerprints.json     # named fingerprints and variants
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

`design-dna.json` is the source of truth. `ai-rules.json` and `fingerprints.json` are compiled from it; never hand-edit them into disagreement.

## Operating principles

1. **Evidence over taste.** Every claim cites `path:line`, a URL plus capture time, or a named artefact.
2. **Preserve the brand.** Extract decisions, not pixels. Never copy source code, photography, logos, fonts, illustrations, or marketing copy.
3. **Confidence is explicit.** Components below `0.50` are assumptions and must be labelled. Missing evidence stays missing.
4. **Accessibility outranks novelty.** A beautiful pattern that fails WCAG is a finding, not a recommendation.
5. **One system.** One accent, one motion family, one type system, and one geometry unless the evidence proves otherwise.
6. **No invention.** Do not add a colour, radius, font, section, or trust claim that the source does not support.
7. **Comparable.** Every audit records the framework version and scores the same ten categories.
8. **Provenance.** Record source, licence, restrictions, and evidence count.
9. **Designed absence.** Missing imagery or data becomes a deliberate placeholder, not a broken asset or a fabricated fact.
10. **Legal first.** No-clone rule. See [references/11-legal-and-ethics.md](references/11-legal-and-ethics.md).

## DNA Audit Framework v1

Every audit follows these phases in order. Do not skip Phase 0 or Phase 12.

| Phase | Name | Required output |
|---|---|---|
| 0 | Intake | Scope, authorisation, sources, constraints, confidence |
| 1 | Evidence Collection | Repo map, runtime evidence, archetype signals, evidence log |
| 2 | Token Extraction | Colour, type, spacing, radius, border, shadow, motion, breakpoints |
| 3 | Component Intelligence | Inventory with anatomy, variants, states, confidence, evidence |
| 4 | Layout Grammar | Containers, rhythm, grids, surface sequence, responsive rules |
| 5 | Motion & Interaction | Motion laws, primitives, choreography, fallbacks |
| 6 | Content & Imagery | Art direction, assets, alt text, voice, trust mechanics |
| 7 | Accessibility & Quality | WCAG, semantics, keyboard, performance, SEO |
| 8 | Conversion Analysis | CTA hierarchy, commitment path, friction, proof |
| 9 | Premium Scoring | 100-point scorecard and band |
| 10 | Decision Engine | Fingerprint, selection rules, do/don't constraints |
| 11 | Skill Generation | Audit, DNA JSON, AI layer, generated skill |
| 12 | Validation & Provenance | Validator pass, limits, licences, handoff |

The full phase contract is in [references/01-extraction-protocol.md](references/01-extraction-protocol.md).

## Workflow

### Phase 0 - Intake

Record:

- client, source repository, branch, commit or URL;
- audit date and auditor;
- permission and licence constraints;
- pages and flows in scope;
- known gaps or pages that need authentication;
- target stack and output location.

Set `framework` and `framework_version` in the audit and DNA files; record audit status in provenance notes. If the source is a live site, capture a timestamp. If it is a repo, record the commit.

### Phase 1 - Evidence collection

Build a source map before forming opinions:

- token files: `globals.css`, `theme.css`, Tailwind config, SCSS variables, design-token JSON;
- layout and shell files: root layout, header, footer, navigation;
- primitives: buttons, fields, cards, dialogs, tables, tabs;
- page compositions and route files;
- motion primitives and animation CSS;
- image manifests, alt text, credits;
- accessibility, performance, and security configuration.

Run the scanner:

```bash
node scripts/scan-design-signals.mjs <repo> --out signals.json
```

Use runtime capture only when authorised and when static evidence is insufficient.

Detect the design archetype using [references/12-design-archetypes.md](references/12-design-archetypes.md). Record primary, secondary, and tertiary with evidence and a `0-5` fit score.

### Phase 2 - Token extraction

Extract the closed vocabulary:

- colour tokens and alpha hierarchy;
- font families, loading, scale, weights, tracking, and measure;
- spacing base and scale;
- radii and shape language;
- borders, shadows, and elevation;
- motion easings and durations;
- breakpoints;
- z-index layers.

Compute contrast with:

```bash
node scripts/contrast.mjs --fg "#14120f" --bg "#faf7f1"
```

Do not silently invent missing tokens. Mark them `inferred` or omit them.

Read [references/02-token-extraction.md](references/02-token-extraction.md).

### Phase 3 - Component intelligence

Inventory every reusable component. For each record:

```json
{
  "id": "hero-editorial",
  "component": "Hero",
  "variant": "editorial",
  "confidence": 0.95,
  "evidence": ["app/page.tsx:23", "components/hero.tsx:11"],
  "anatomy": ["eyebrow", "headline", "lede", "cta", "media"],
  "states": ["default", "loading", "reduced-motion"],
  "responsive": "stacked below md, bottom-aligned at lg",
  "tokens": ["ink", "ivory", "sand", "type-mega"]
}
```

Confidence rubric:

| Score | Meaning |
|---|---|
| `0.90-1.00` | Multiple direct evidence points |
| `0.70-0.89` | One direct evidence point plus corroboration |
| `0.50-0.69` | Inferred from related patterns |
| `<0.50` | Assumption; label or omit |

Use [references/03-component-intelligence.md](references/03-component-intelligence.md) for the full taxonomy.

### Phase 4 - Layout grammar

Record containers, gutters, vertical rhythm, grid patterns, surface sequence, shape language, depth language, and responsive recomposition. A page must be describable as a sequence of surfaces and section types, not a pile of components.

Read [references/04-layout-and-page-generator.md](references/04-layout-and-page-generator.md).

### Phase 5 - Motion and interaction

Extract the motion family, durations, primitives, triggers, choreography, hover and focus states, reduced-motion fallback, and performance cost. Motion must describe space, hierarchy, or progress. It must not decorate idle elements.

Read [references/05-motion-and-interaction.md](references/05-motion-and-interaction.md).

### Phase 6 - Content and imagery

Record the art direction, sourcing policy, focal points, crops, placeholders, alt text, credits, voice, sentence patterns, trust mechanics, and prohibited claims.

Read [references/06-imagery-and-content-voice.md](references/06-imagery-and-content-voice.md).

### Phase 7 - Accessibility and quality

Check landmarks, headings, focus, keyboard paths, forms, dialogs, tables, tabs, reduced motion, contrast, performance, and SEO. Report strengths and failures separately. Never let a score hide a launch blocker.

Read [references/07-accessibility-and-quality.md](references/07-accessibility-and-quality.md).

### Phase 8 - Conversion analysis

Map the commitment ladder and the CTA hierarchy. Identify friction, missing proof, and empty states. Distinguish low, medium, and high commitment. Record what the site does not promise, as well as what it does.

Read [references/04-layout-and-page-generator.md](references/04-layout-and-page-generator.md) and [references/09-design-decision-engine.md](references/09-design-decision-engine.md).

### Phase 9 - Premium scoring

Score exactly these categories:

| Category | Points |
|---|---|
| Visual System | 20 |
| UX Architecture | 15 |
| Typography | 10 |
| Spacing | 10 |
| Brand Distinction | 10 |
| Trust Signals | 10 |
| Motion | 10 |
| Accessibility | 5 |
| Performance | 5 |
| Content Quality | 5 |
| **Total** | **100** |

Bands:

| Score | Band |
|---|---|
| 90-100 | Exceptional |
| 80-89 | Premium |
| 70-79 | Professional |
| 60-69 | Functional |
| `<60` | Weak |

Every deduction needs evidence. P0 legal, accessibility, or security findings are reported as launch blockers but are not folded into the numeric score. Use [templates/scorecard.md](templates/scorecard.md) and [references/08-premium-scoring.md](references/08-premium-scoring.md).

### Phase 10 - Decision engine and fingerprint

Convert the audit into rules:

- surface selection;
- type-scale selection;
- component matching;
- motion selection;
- content voice;
- fallback when evidence is missing;
- conflict priority: legal and accessibility, then brand DNA, then consistency, then page goal, then novelty.

Create the fingerprint:

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

Read [references/09-design-decision-engine.md](references/09-design-decision-engine.md) and [references/14-design-fingerprint.md](references/14-design-fingerprint.md).

### Phase 11 - Skill generation

1. Copy the audit template and complete every phase.
2. Copy [templates/design-dna.json](templates/design-dna.json) and replace every placeholder. The template is not valid DNA until provenance, accessibility, rules, and evidence are real. Set `provenance.status` to `audit-complete` or `blocked`; a blocked audit must list `publication_blockers`.
3. Scaffold the generated skill (this compiles the AI layer):

```bash
node scripts/scaffold-dna-skill.mjs \
  --slug client-slug \
  --name "Client Name" \
  --dna design-dna.json \
  --out generated/client-slug-design-dna
```

4. Verify that `ai-rules.json` and `fingerprints.json` match `design-dna.json`:

```bash
node scripts/compile-ai-layer.mjs \
  --dna generated/client-slug-design-dna/design-dna.json \
  --out generated/client-slug-design-dna \
  --check
```

Read [references/10-skill-generation-spec.md](references/10-skill-generation-spec.md) and [references/15-ai-consumption.md](references/15-ai-consumption.md).

### Phase 12 - Validation and provenance

Run:

```bash
node scripts/validate-dna-skill.mjs generated/client-slug-design-dna
```

The validator checks:

- frontmatter and SKILL.md length;
- required files and links;
- fingerprint vocabulary;
- component confidence and evidence;
- score totals;
- AI-layer consistency;
- unresolved placeholders;
- provenance.

Record source, licence, restrictions, evidence count, known gaps, and audit limits. An audit may be `audit-complete` with open P0 findings, but it must list them as `publication_blockers` and cannot be `released` until they are resolved.

## Design archetypes

Detect one primary, one secondary, and one tertiary from:

`Luxury`, `Explorer`, `Authority`, `Craftsmanship`, `Technology`, `Innovation`, `Industrial`, `Institutional`, `Hospitality`, `Community`, `Minimal`, `Editorial`.

Example, African Bison Classic Tours:

```text
Primary:   Explorer
Secondary: Luxury
Tertiary:  Hospitality
```

Read [references/12-design-archetypes.md](references/12-design-archetypes.md).

## Component matching and page generation

When asked to generate a page:

1. Read the fingerprint and `ai-rules.json`.
2. Select a page archetype from the generated skill's `references/page-recipes.md`, or this package's [references/04-layout-and-page-generator.md](references/04-layout-and-page-generator.md).
3. Match each required section to the closest component in `design-dna.json`.
4. Prefer the highest-confidence variant. If confidence is below `0.50`, compose from primitives or ask.
5. Never introduce a new colour, font, radius, shadow, or motion curve.
6. Record any assumption in the page brief.

If a required component does not exist, compose it from existing primitives and log the addition as an extension, not as extracted DNA.

## Design merge engine

Merge client systems without overwriting them:

```bash
node scripts/merge-dna.mjs \
  --base base/design-dna.json \
  --other other/design-dna.json \
  --mode blend \
  --name "Premium Web DNA" \
  --slug premium-web-dna \
  --version 2.0.0 \
  --out generated/premium-web-dna-v2.json
```

The merge engine preserves sources, records conflicts, merges surfaces and accessibility evidence, combines corroborated component confidence, and emits a merge report plus provenance with release status and blockers.

Read [references/13-dna-merge-engine.md](references/13-dna-merge-engine.md).

## Evolution

The repository is a design-intelligence library, not a one-off deliverable.

- Audit-complete and blocked audits live in `examples/<client>/`.
- Queued clients are listed without invented data.
- New audits use `examples/_template/`.
- Re-audit when the source changes materially, the framework version changes, or a P0 finding is resolved.
- Version the framework and each DNA package independently.

Read [references/16-evolution-protocol.md](references/16-evolution-protocol.md).

## Anti-patterns

- Inventing a token, component, metric, review, award, or photograph.
- Copying source code or assets into the generated skill.
- Treating a fingerprint as the whole audit.
- Adding a third font, a second accent, or a decorative gradient because a page feels empty.
- Using clay or another accent as body text on a dark surface without checking contrast.
- Hiding critical content behind hover on touch devices.
- Reporting a score without evidence.
- Letting `ai-rules.json` drift from `design-dna.json`.
- Calling a generated page "on brand" when it uses a component with confidence below `0.50`.
- Publishing a client audit without resolving licences and credits.

## Reference map

| Reference | Use |
|---|---|
| [01-extraction-protocol](references/01-extraction-protocol.md) | Phase contracts, evidence, confidence |
| [02-token-extraction](references/02-token-extraction.md) | Colour, type, spacing, shape, motion |
| [03-component-intelligence](references/03-component-intelligence.md) | Component taxonomy and inventory |
| [04-layout-and-page-generator](references/04-layout-and-page-generator.md) | Layout grammar and page recipes |
| [05-motion-and-interaction](references/05-motion-and-interaction.md) | Motion laws, primitives, budgets |
| [06-imagery-and-content-voice](references/06-imagery-and-content-voice.md) | Art direction, assets, copy |
| [07-accessibility-and-quality](references/07-accessibility-and-quality.md) | WCAG, performance, SEO |
| [08-premium-scoring](references/08-premium-scoring.md) | The 100-point rubric |
| [09-design-decision-engine](references/09-design-decision-engine.md) | Selection and conflict rules |
| [10-skill-generation-spec](references/10-skill-generation-spec.md) | Generated-skill contract |
| [11-legal-and-ethics](references/11-legal-and-ethics.md) | Authorisation, copyright, provenance |
| [12-design-archetypes](references/12-design-archetypes.md) | Twelve archetypes |
| [13-dna-merge-engine](references/13-dna-merge-engine.md) | Merge algorithm |
| [14-design-fingerprint](references/14-design-fingerprint.md) | Fingerprint vocabulary |
| [15-ai-consumption](references/15-ai-consumption.md) | Agent-readable JSON |
| [16-evolution-protocol](references/16-evolution-protocol.md) | Library growth and versioning |

## Completion checklist

- [ ] Phase 0 authorisation and source metadata recorded
- [ ] Evidence log contains `file:line` or timestamped URL citations
- [ ] Archetype primary, secondary, and tertiary selected
- [ ] Tokens extracted with confidence and contrast checks
- [ ] Components inventoried with anatomy, states, confidence, evidence
- [ ] Layout grammar and surface sequence documented
- [ ] Motion family and fallbacks documented
- [ ] Imagery, alt text, and licences documented
- [ ] Accessibility, performance, and SEO findings separated from scores
- [ ] Conversion ladder and CTA hierarchy documented
- [ ] Premium score totals exactly 100 and band assigned
- [ ] Fingerprint fields use the controlled vocabulary
- [ ] `design-dna.json` is schema-valid and its release status and blockers are recorded
- [ ] `ai-rules.json` and `fingerprints.json` match the DNA
- [ ] Generated skill passes `validate-dna-skill.mjs`
- [ ] Provenance and limitations recorded
- [ ] No invented facts, assets, or trust signals
