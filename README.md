# Premium Web DNA

**Global Skill Creator** turns a client website into a reusable, versioned design-intelligence skill.

It does not clone a site. It extracts the decisions behind the site: tokens, components, layout grammar, motion, imagery rules, content voice, conversion logic, accessibility, and the fingerprint that makes the brand recognisable. Those decisions become a portable skill that a coding agent can apply to new pages without rereading a 50-page audit.

## What it produces

1. A **DNA Audit Framework v1** report, with evidence cited as `file:line`.
2. A **Premium Score** out of 100, comparable across audits.
3. A **design fingerprint** such as `Explorer-Luxury`.
4. A generated skill package:

```text
<slug>-design-dna/
├── SKILL.md
├── design-dna.json
├── ai-rules.json
├── fingerprints.json
├── references/
└── templates/
```

## Framework v1

```text
Phase 0   Intake
Phase 1   Evidence Collection
Phase 2   Token Extraction
Phase 3   Component Intelligence
Phase 4   Layout Grammar
Phase 5   Motion & Interaction
Phase 6   Content & Imagery
Phase 7   Accessibility & Quality
Phase 8   Conversion Analysis
Phase 9   Premium Scoring
Phase 10  Decision Engine
Phase 11  Skill Generation
Phase 12  Validation & Provenance
```

Every audit records `framework: DNA Audit Framework v1` and `framework_version: 1.0.0`, so results stay comparable as the library grows.

## Premium scoring

```text
Visual System        20
UX Architecture      15
Typography           10
Spacing              10
Brand Distinction    10
Trust Signals        10
Motion               10
Accessibility         5
Performance           5
Content Quality       5
-----------------------
TOTAL               100
```

```text
90-100  Exceptional
80-89   Premium
70-79   Professional
60-69   Functional
<60     Weak
```

## Quick start

```bash
# 0. Install development dependencies (Biome and Ajv)
npm ci

# 1. Scan a repository for design signals
node scripts/scan-design-signals.mjs ../client-site --out signals.json

# 2. Compute contrast ratios
node scripts/contrast.mjs --fg "#14120f" --bg "#faf7f1"
node scripts/contrast.mjs --pairs contrast-pairs.json

# 3. Scaffold a generated skill from a completed design-dna.json
node scripts/scaffold-dna-skill.mjs \
  --slug client-name \
  --name "Client Name" \
  --dna examples/african-bison/design-dna.json \
  --out generated/client-name-design-dna

# 4. Compile the AI layer after editing design-dna.json
node scripts/compile-ai-layer.mjs \
  --dna generated/client-name-design-dna/design-dna.json \
  --out generated/client-name-design-dna

# 5. Merge design systems without overwriting the sources
node scripts/merge-dna.mjs \
  --base examples/african-bison/design-dna.json \
  --other path/to/another/design-dna.json \
  --mode blend \
  --name "Premium Web DNA" \
  --slug premium-web-dna \
  --version 2.0.0 \
  --out generated/premium-web-dna-v2.json

# 6. Scaffold the merged DNA into a skill
node scripts/scaffold-dna-skill.mjs \
  --slug premium-web-dna-v2 \
  --name "Premium Web DNA" \
  --dna generated/premium-web-dna-v2.json \
  --out generated/premium-web-dna-v2

# 7. Validate any generated skill
node scripts/validate-dna-skill.mjs generated/client-name-design-dna
node scripts/validate-dna-skill.mjs generated/premium-web-dna-v2

# 8. Run the repository checks
npm run check
```

Optional runtime capture:

```bash
npm install --no-save playwright
npx playwright install chromium
node scripts/capture-site.mjs --url https://example.com --out runtime/example
```

Capture refuses private, loopback, link-local, and credential-bearing URLs by default. It caps response size, validates redirects, and redacts `set-cookie`, `authorization`, and related headers. Use `--allow-private-network` only for an intentional local audit. Playwright can still follow subresource requests inside the browser; the private-network check covers the initial navigation.

Only capture sites you are authorised to audit.

## Repository map

| Path | Purpose |
|---|---|
| `SKILL.md` | The agent workflow |
| `references/01-extraction-protocol.md` | Phase contracts and evidence rules |
| `references/02-token-extraction.md` | Tokens, type, spacing, motion |
| `references/03-component-intelligence.md` | Component taxonomy and confidence |
| `references/04-layout-and-page-generator.md` | Layout grammar and page recipes |
| `references/05-motion-and-interaction.md` | Motion laws and budgets |
| `references/06-imagery-and-content-voice.md` | Art direction and copy |
| `references/07-accessibility-and-quality.md` | WCAG, performance and SEO |
| `references/08-premium-scoring.md` | The 100-point rubric |
| `references/09-design-decision-engine.md` | Rules for choosing components |
| `references/10-skill-generation-spec.md` | Generated-skill contract |
| `references/11-legal-and-ethics.md` | Authorisation, copyright, provenance |
| `references/12-design-archetypes.md` | Twelve archetypes |
| `references/13-dna-merge-engine.md` | Merge algorithm |
| `references/14-design-fingerprint.md` | Fingerprint vocabulary |
| `references/15-ai-consumption.md` | Agent-readable JSON layer |
| `references/16-evolution-protocol.md` | Library growth and versioning |
| `templates/` | Placeholder audit, DNA, rules, fingerprints, scorecard, and JSON Schemas |
| `scripts/` | Zero-dependency runtime audit and validation tools |
| `scripts/lib/` | Schema, evidence-count, and merge helpers |
| `scripts/verify-repo.mjs` | Link, frontmatter, template, and example verification |
| `examples/` | Audit-complete, blocked, and queued client audits |
| `tests/` | Unit, integration, schema, and validator tests |

## Examples

| Client | Status | Release | Archetype | Score | Fingerprint |
|---|---|---|---|---|---|
| African Bison Classic Tours | Audit complete | Blocked: 2 open P0s | Explorer / Luxury / Hospitality | 88 | Explorer-Luxury |
| Queensland Nuts | Queued | - | - | - | - |
| Muta Automations | Queued | - | - | - | - |
| TCDL | Queued | - | - | - | - |

Queued examples contain no invented DNA. They are placeholders until a real extraction runs.

## Install as an agent skill

Copy the package into the personal skills directory:

```powershell
$dest = "$env:USERPROFILE\.agents\skills\web-design\premium-web-dna"
New-Item -ItemType Directory -Force -Path $dest | Out-Null
robocopy . $dest /E /XD .git .github node_modules generated capture runtime tests coverage
```

The skill is self-contained. It needs Node 20+ for the scripts and no runtime dependencies. Development checks use Ajv and Biome as `devDependencies`.

## Design principles

- Evidence before taste. Every claim cites a source.
- Preserve the brand, not the pixels.
- Accessibility outranks novelty.
- One accent, one motion family, one type system unless the evidence says otherwise.
- A fingerprint is a decision aid, not a substitute for the full audit.
- Never copy code, photography, logos, fonts, or copy without a licence.
- Never fabricate a client audit.

## Legal

Use this framework only on sites and repositories you are authorised to inspect. Generated skills contain design principles and measurements, not source assets. Read `references/11-legal-and-ethics.md` before publishing or redistributing anything derived from a client.

## Licence

- Scripts and tooling: MIT. See `LICENSE-MIT`.
- Framework documentation, references, and templates: CC BY 4.0. See `LICENSE-CC-BY-4.0`.
- Client audits, client assets, and generated client skills: not licensed by this repository. See `NOTICE`.

If a file contains a different licence notice, that notice takes precedence.
