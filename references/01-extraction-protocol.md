# DNA Audit Framework v1 - Extraction Protocol

Framework version: `1.0.0`
Status: stable

This document is the contract for every audit produced by `premium-web-dna`. Follow the phases in order. Each phase has a required output and a gate. An audit that skips a gate is incomplete, even if the document looks finished.

## Why version the framework

A design audit is only useful if it can be compared with other audits. Fixed phases, fixed scoring, and fixed fingerprint vocabulary make comparison possible. If the framework changes, publish a new version and record it in every audit. Never silently reinterpret an old phase.

## Phase contracts

### Phase 0 - Intake

**Purpose:** establish scope and permission before touching the site.

**Collect:**

- client name, source repository, branch, commit, or live URL;
- audit date, auditor, and review owner;
- authorisation and licence constraints;
- pages, flows, and breakpoints in scope;
- authenticated areas and how they were accessed;
- known gaps, unavailable assets, and site limitations;
- target stack and destination for the generated skill;
- output language and naming conventions.

**Gate:** a written scope and authorisation statement. If authorisation is absent, stop.

### Phase 1 - Evidence Collection

**Purpose:** build a source map before forming opinions.

**Collect:**

- repo structure and framework;
- token files, theme files, Tailwind config, SCSS variables, token JSON;
- shell: layout, header, footer, navigation, mobile menu;
- primitives: button, card, badge, field, select, dialog, drawer, tabs, table, timeline, states;
- page routes and composition files;
- motion primitives, animation CSS, scroll libraries;
- imagery manifest, alt text, credits, licences;
- accessibility, performance, security, and SEO configuration;
- runtime evidence when authorised: screenshots, computed styles, fonts, animation durations.

**Produce:** an evidence log with file paths and line numbers, plus the archetype fit table.

**Gate:** every later claim can be traced to an entry in the evidence log.

### Phase 2 - Token Extraction

**Purpose:** recover the closed design vocabulary.

**Extract:** colour, typography, spacing, radii, borders, shadows, motion, breakpoints, z-index, and alpha hierarchy.

**Produce:** a token table with value, role, usage, evidence, and confidence. Compute contrast for every real foreground/background pair.

**Gate:** no token is invented. Missing tokens are labelled `inferred` or omitted.

### Phase 3 - Component Intelligence

**Purpose:** map the reusable interface, not just the pages.

**For every component record:**

- id, component name, variant;
- confidence and evidence;
- anatomy;
- states;
- responsive behaviour;
- tokens consumed;
- accessibility notes;
- motion notes.

**Gate:** every component has at least one evidence citation. Confidence below `0.50` is labelled as an assumption.

### Phase 4 - Layout Grammar

**Purpose:** describe how the site composes space.

**Extract:** containers, gutters, vertical rhythm, grid patterns, surface sequence, shape language, depth language, header and footer behaviour, responsive recomposition.

**Produce:** a surface map for each audited page and a page skeleton that can be reused.

**Gate:** a reader can reconstruct a page's order and spacing without seeing a screenshot.

### Phase 5 - Motion and Interaction

**Purpose:** recover the motion system and its fallbacks.

**Extract:** easing family, durations, primitives, triggers, choreography, hover and focus states, reduced-motion behaviour, calm-mode behaviour, performance cost.

**Gate:** every motion primitive has a still fallback and a reduced-motion rule.

### Phase 6 - Content and Imagery

**Purpose:** recover the art direction and the voice.

**Extract:** imagery sources, crops, focal points, placeholders, alt text, credits, licences; headline and body patterns; trust mechanics; prohibited claims; conversion copy.

**Gate:** no unlicensed asset is recommended or copied. Missing imagery becomes a designed placeholder.

### Phase 7 - Accessibility and Quality

**Purpose:** establish whether the visual system is usable.

**Check:** landmarks, heading order, focus, keyboard paths, forms, dialogs, tables, tabs, contrast, reduced motion, performance, SEO.

**Gate:** strengths and failures are reported separately. A high score never suppresses a P0 finding.

### Phase 8 - Conversion Analysis

**Purpose:** explain how the design moves a visitor toward commitment.

**Map:** low, medium, and high commitment paths; CTA hierarchy; proof; friction; empty and error states; pricing and availability honesty.

**Gate:** the conversion ladder is explicit and tied to evidence.

### Phase 9 - Premium Scoring

**Purpose:** produce a comparable score.

**Score exactly:** Visual System 20, UX Architecture 15, Typography 10, Spacing 10, Brand Distinction 10, Trust Signals 10, Motion 10, Accessibility 5, Performance 5, Content Quality 5.

**Gate:** each category has a score, a deduction note, and evidence. The total is exactly 100.

### Phase 10 - Decision Engine

**Purpose:** turn the audit into rules a future agent can apply.

**Produce:** fingerprint, surface rules, type rules, component matching rules, motion rules, content rules, fallback rules, and conflict priority.

**Gate:** every rule is derived from evidence or explicitly marked as a design decision.

### Phase 11 - Skill Generation

**Purpose:** package the DNA so it can be reused.

**Produce:** the audit, `design-dna.json`, `ai-rules.json`, `fingerprints.json`, references, templates, and a generated `SKILL.md`.

**Gate:** the generated skill passes validation and the AI layer matches the DNA.

### Phase 12 - Validation and Provenance

**Purpose:** make the result trustworthy.

**Record:** source, commit, audit date, licences, restrictions, evidence count, confidence, known gaps, and audit limits.

**Gate:** validation passes. P0 licence or accessibility issues are recorded as unresolved blockers.

## Evidence rules

### Citation format

Use one of:

- `path/to/file.tsx:42`
- `https://example.com/page` with capture date and time
- `computed style: body > header` with browser and viewport
- `design file: Brand Guide v3, page 12`

Never cite a directory when a file and line are available.

### Evidence strength

| Strength | Example |
|---|---|
| Direct | A token declaration, a component source, a rendered computed style |
| Corroborated | Two independent files or a static declaration plus runtime observation |
| Inferred | A repeated pattern without a declared token |
| Assumed | A design decision made by the auditor to fill a gap |

### Confidence

Use `0.00-1.00`:

```text
0.90-1.00  direct, multiple sources
0.70-0.89  direct, one source plus corroboration
0.50-0.69  inferred from related patterns
<0.50      assumption, must be labelled and must not drive generation
```

### What not to cite

- a screenshot alone when source is available;
- a design system the client does not use;
- a competitor's site;
- a stock template that merely resembles the client;
- a guess presented as a token.

## Static and runtime evidence

Static source is the default because it is reproducible and cheap. Runtime evidence is optional and should be used when:

- colours or typography are computed at runtime;
- motion is orchestrated by JavaScript;
- responsive behaviour cannot be inferred from CSS;
- a page is only available through a browser;
- the audit needs screenshots for a stakeholder.

Use `scripts/capture-site.mjs` only with authorisation. Record the browser, viewport, date, and URL.

## Audit limits

State the limits explicitly:

- static audit, no browser session;
- no Lighthouse, screen-reader, or device-lab pass;
- contrast computed from declared values before compositing;
- ad hoc utilities sampled, not exhaustively enumerated;
- authenticated or gated pages not reviewed;
- third-party embeds not inspected;
- source brief truncated or incomplete.

Limits do not invalidate the audit. Hiding them does.

## Required audit frontmatter

```yaml
---
title: Design DNA Audit - Client Name
framework: DNA Audit Framework v1
framework_version: 1.0.0
client: Client Name
source: https://github.com/org/repo
source_commit: abc1234
audit_date: 2026-10-19
auditor: Name
status: complete
confidence: 0.90
---
```
