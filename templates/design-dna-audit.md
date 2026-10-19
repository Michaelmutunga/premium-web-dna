---
title: Design DNA Audit - {{CLIENT_NAME}}
framework: DNA Audit Framework v1
framework_version: 1.0.0
client: {{CLIENT_NAME}}
source: {{SOURCE}}
source_commit: {{SOURCE_COMMIT}}
audit_date: {{AUDIT_DATE}}
auditor: {{AUDITOR}}
status: draft
confidence: {{CONFIDENCE}}
---

# Design DNA Audit - {{CLIENT_NAME}}

{{ONE_SENTENCE_SUMMARY}}

## Executive extraction

### The DNA in one sentence

{{DNA_SENTENCE}}

### The ten fingerprints

1. {{FINGERPRINT_1}}
2. {{FINGERPRINT_2}}
3. {{FINGERPRINT_3}}
4. {{FINGERPRINT_4}}
5. {{FINGERPRINT_5}}
6. {{FINGERPRINT_6}}
7. {{FINGERPRINT_7}}
8. {{FINGERPRINT_8}}
9. {{FINGERPRINT_9}}
10. {{FINGERPRINT_10}}

### Archetype

| Rank | Archetype | Fit (0-5) | Evidence |
|---|---|---:|---|
| Primary | {{ARCHETYPE_PRIMARY}} | {{FIT_PRIMARY}} | {{EVIDENCE_PRIMARY}} |
| Secondary | {{ARCHETYPE_SECONDARY}} | {{FIT_SECONDARY}} | {{EVIDENCE_SECONDARY}} |
| Tertiary | {{ARCHETYPE_TERTIARY}} | {{FIT_TERTIARY}} | {{EVIDENCE_TERTIARY}} |

### Design fingerprint

```json
{
  "archetype": "{{FINGERPRINT_ARCHETYPE}}",
  "density": "{{FINGERPRINT_DENSITY}}",
  "contrast": "{{FINGERPRINT_CONTRAST}}",
  "motion_style": "{{FINGERPRINT_MOTION}}",
  "cta_style": "{{FINGERPRINT_CTA}}",
  "card_style": "{{FINGERPRINT_CARD}}",
  "navbar_style": "{{FINGERPRINT_NAVBAR}}"
}
```

### Premium score

| Category | Max | Score | Evidence / deduction |
|---|---:|---:|---|
| Visual System | 20 | {{SCORE_VISUAL}} | {{NOTE_VISUAL}} |
| UX Architecture | 15 | {{SCORE_UX}} | {{NOTE_UX}} |
| Typography | 10 | {{SCORE_TYPE}} | {{NOTE_TYPE}} |
| Spacing | 10 | {{SCORE_SPACING}} | {{NOTE_SPACING}} |
| Brand Distinction | 10 | {{SCORE_BRAND}} | {{NOTE_BRAND}} |
| Trust Signals | 10 | {{SCORE_TRUST}} | {{NOTE_TRUST}} |
| Motion | 10 | {{SCORE_MOTION}} | {{NOTE_MOTION}} |
| Accessibility | 5 | {{SCORE_A11Y}} | {{NOTE_A11Y}} |
| Performance | 5 | {{SCORE_PERF}} | {{NOTE_PERF}} |
| Content Quality | 5 | {{SCORE_CONTENT}} | {{NOTE_CONTENT}} |
| **Total** | **100** | **{{SCORE_TOTAL}}** | **{{SCORE_BAND}}** |

---

## Phase 0 - Intake

### Scope

{{SCOPE}}

### Authorisation and constraints

{{AUTHORISATION}}

### Sources

| Source | Type | Commit / timestamp | Notes |
|---|---|---|---|
| {{SOURCE}} | repository / URL | {{SOURCE_COMMIT}} | {{SOURCE_NOTES}} |

### Known gaps

{{KNOWN_GAPS}}

---

## Phase 1 - Evidence Collection

### Repository and stack

{{STACK}}

### Evidence map

| Area | Primary files |
|---|---|
| Tokens | {{TOKEN_FILES}} |
| Shell | {{SHELL_FILES}} |
| Components | {{COMPONENT_FILES}} |
| Pages | {{PAGE_FILES}} |
| Motion | {{MOTION_FILES}} |
| Imagery | {{IMAGERY_FILES}} |
| Accessibility / performance | {{QUALITY_FILES}} |

### Archetype fit

| Archetype | Score | Positive evidence | Contradictory evidence |
|---|---:|---|---|
| {{ARCHETYPE}} | {{FIT}} | {{POSITIVE}} | {{NEGATIVE}} |

### Confidence

{{CONFIDENCE_NOTES}}

---

## Phase 2 - Token Extraction

### Colour tokens

| Token | Value | Role | Evidence |
|---|---|---|---|
| {{COLOR_TOKEN}} | {{COLOR_VALUE}} | {{COLOR_ROLE}} | {{COLOR_EVIDENCE}} |

### Colour distribution

{{COLOR_DISTRIBUTION}}

### Measured contrast

| Foreground | Background | Ratio | AA normal | AA large | Reading |
|---|---|---:|---|---|---|
| {{FG}} | {{BG}} | {{RATIO}} | {{AA_NORMAL}} | {{AA_LARGE}} | {{CONTRAST_READING}} |

### Alpha hierarchy

| Purpose | Light surface | Dark surface |
|---|---|---|
| Structural border | {{LIGHT_BORDER}} | {{DARK_BORDER}} |
| Form border | {{LIGHT_FORM}} | {{DARK_FORM}} |
| Secondary text | {{LIGHT_TEXT}} | {{DARK_TEXT}} |
| Hover | {{LIGHT_HOVER}} | {{DARK_HOVER}} |
| Quiet fill | {{LIGHT_FILL}} | {{DARK_FILL}} |

### Typography tokens

| Utility | Family | Size | Line height | Tracking | Weight | Use |
|---|---|---|---|---|---|---|
| {{TYPE_UTILITY}} | {{TYPE_FAMILY}} | {{TYPE_SIZE}} | {{TYPE_LH}} | {{TYPE_TRACKING}} | {{TYPE_WEIGHT}} | {{TYPE_USE}} |

### Spacing

{{SPACING}}

### Radii, borders, shadows

{{SHAPE_AND_DEPTH}}

### Motion tokens

| Token | Value | Used by |
|---|---|---|
| {{MOTION_TOKEN}} | {{MOTION_VALUE}} | {{MOTION_USE}} |

### Breakpoints

{{BREAKPOINTS}}

---

## Phase 3 - Component Intelligence

### Inventory

| ID | Component | Variant | Confidence | Evidence |
|---|---|---|---:|---|
| {{COMPONENT_ID}} | {{COMPONENT_NAME}} | {{COMPONENT_VARIANT}} | {{COMPONENT_CONFIDENCE}} | {{COMPONENT_EVIDENCE}} |

### Component details

#### {{COMPONENT_NAME}}

- Anatomy: {{COMPONENT_ANATOMY}}
- States: {{COMPONENT_STATES}}
- Responsive: {{COMPONENT_RESPONSIVE}}
- Tokens: {{COMPONENT_TOKENS}}
- Accessibility: {{COMPONENT_A11Y}}
- Motion: {{COMPONENT_MOTION}}
- Confidence: {{COMPONENT_CONFIDENCE}}
- Evidence: {{COMPONENT_EVIDENCE}}

---

## Phase 4 - Layout Grammar

### Containers and gutters

{{CONTAINERS}}

### Vertical rhythm

{{RHYTHM}}

### Grids

{{GRIDS}}

### Surface sequence

```text
{{SURFACE_SEQUENCE}}
```

### Header and footer

{{HEADER_FOOTER}}

### Responsive recomposition

{{RESPONSIVE}}

---

## Phase 5 - Motion and Interaction

### Motion laws

{{MOTION_LAWS}}

### Primitive inventory

| Primitive | Trigger | Motion | Timing | Fallback |
|---|---|---|---|---|
| {{PRIMITIVE}} | {{TRIGGER}} | {{MOTION}} | {{TIMING}} | {{FALLBACK}} |

### Choreography

{{CHOREOGRAPHY}}

### Reduced motion and calm mode

{{REDUCED_MOTION}}

### Interaction states

{{INTERACTION_STATES}}

---

## Phase 6 - Content and Imagery

### Art direction

{{ART_DIRECTION}}

### Source and licences

| Asset group | Source | Licence | Credit | Status |
|---|---|---|---|---|
| {{ASSET_GROUP}} | {{ASSET_SOURCE}} | {{ASSET_LICENCE}} | {{ASSET_CREDIT}} | {{ASSET_STATUS}} |

### Placeholders and alt text

{{PLACEHOLDERS}}

### Voice

{{VOICE}}

### Trust mechanics

{{TRUST_MECHANICS}}

### Conversion copy

{{CONVERSION_COPY}}

---

## Phase 7 - Accessibility and Quality

### Strengths

{{A11Y_STRENGTHS}}

### Issues

{{A11Y_ISSUES}}

### Performance

{{PERFORMANCE}}

### SEO

{{SEO}}

### Severity

| Level | Finding | Action |
|---|---|---|
| P0 | {{P0_FINDING}} | {{P0_ACTION}} |
| P1 | {{P1_FINDING}} | {{P1_ACTION}} |
| P2 | {{P2_FINDING}} | {{P2_ACTION}} |

---

## Phase 8 - Conversion Analysis

### Commitment ladder

| Level | Action | Evidence | Friction |
|---|---|---|---|
| Low | {{LOW_COMMITMENT}} | {{LOW_EVIDENCE}} | {{LOW_FRICTION}} |
| Medium | {{MED_COMMITMENT}} | {{MED_EVIDENCE}} | {{MED_FRICTION}} |
| High | {{HIGH_COMMITMENT}} | {{HIGH_EVIDENCE}} | {{HIGH_FRICTION}} |

### CTA hierarchy

{{CTA_HIERARCHY}}

### Proof and friction

{{PROOF_AND_FRICTION}}

### Honesty

{{HONESTY}}

---

## Phase 9 - Premium Scoring

{{SCORE_DISCUSSION}}

---

## Phase 10 - Decision Engine

### Surface rules

{{SURFACE_RULES}}

### Type rules

{{TYPE_RULES}}

### Component selection rules

{{COMPONENT_RULES}}

### Motion rules

{{MOTION_RULES}}

### Content rules

{{CONTENT_RULES}}

### Fallbacks

{{FALLBACKS}}

### Conflict priority

{{CONFLICT_PRIORITY}}

### Anti-patterns

{{ANTI_PATTERNS}}

---

## Phase 11 - Skill Generation

### Generated files

| File | Purpose |
|---|---|
| `SKILL.md` | Agent workflow |
| `design-dna.json` | Source of truth |
| `ai-rules.json` | Compressed agent rules |
| `fingerprints.json` | Named fingerprint map |
| `references/` | Detailed client DNA |
| `templates/` | Token, page, and component templates |

### Generation command

```bash
node scripts/scaffold-dna-skill.mjs \
  --slug {{SLUG}} \
  --name "{{CLIENT_NAME}}" \
  --dna design-dna.json \
  --out generated/{{SLUG}}-design-dna
```

### Assumptions

{{ASSUMPTIONS}}

---

## Phase 12 - Validation and Provenance

### Validation

```bash
node scripts/validate-dna-skill.mjs generated/{{SLUG}}-design-dna
```

Result: {{VALIDATION_RESULT}}

### Provenance

| Field | Value |
|---|---|
| Source | {{SOURCE}} |
| Commit / capture | {{SOURCE_COMMIT}} |
| Audit date | {{AUDIT_DATE}} |
| Framework | DNA Audit Framework v1 |
| Framework version | 1.0.0 |
| Licence | {{LICENCE}} |
| Restrictions | {{RESTRICTIONS}} |
| Evidence count | {{EVIDENCE_COUNT}} |

### Limitations

{{LIMITATIONS}}

---

## Appendix A - Evidence map

| Area | Primary files |
|---|---|
| {{AREA}} | {{FILES}} |

## Appendix B - Scorecard

{{SCORECARD}}

## Appendix C - Audit limits

{{AUDIT_LIMITS}}
