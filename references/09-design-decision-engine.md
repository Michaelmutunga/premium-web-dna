# Design Decision Engine

The decision engine turns an audit into repeatable choices. It answers: given a new page or section, which surface, type scale, component, motion, and content pattern should be used?

## Constraint priority

When rules conflict, resolve in this order:

1. **Legal and accessibility.** Licences, consent, WCAG, privacy.
2. **Brand DNA.** Extracted tokens, archetype, fingerprint, signatures.
3. **System consistency.** Existing components and layout grammar.
4. **Page goal.** Conversion, comprehension, task completion.
5. **Novelty.** Only after the first four are satisfied.

A novel layout never overrides an accessibility failure or a licence restriction.

## Surface selection

Inputs: section role, narrative position, previous surface, fingerprint density, contrast level.

Rules:

- Alternate tonal chapters to mark narrative movement.
- Do not place two dark chapters next to each other unless the source does.
- Use the darkest surface for hero, closing, or a deliberate emotional peak.
- Use light surfaces for reading, catalogues, and forms.
- Keep the accent budget under five appearances per viewport.
- Never introduce a new surface tone for one section.

Decision table:

| Section role | Preferred surface |
|---|---|
| Hero | night or full-bleed media |
| Statement / pause | ivory |
| Product chapter | sand/40, parchment, or ivory |
| Emotional peak | earth-deep or bark-deep |
| Proof / locality | dark chapter |
| Catalogue | ivory or parchment |
| Form | ivory |
| Closing | night |

## Type selection

- Display type names things; sans type explains them.
- Use the display scale for hero, section titles, and large numerals.
- Use body type for reading, never below the extracted minimum.
- Use labels for eyebrows, buttons, and metadata.
- Cap the measure at the extracted value, usually 65-75 characters.
- Do not add a third family.
- Do not use uppercase for body copy.
- Use tabular numerals for prices, dates, and counts.

## Component selection

For each required section:

1. Find direct components by role.
2. Filter by surface and tone support.
3. Filter by responsive behaviour.
4. Filter by accessibility completeness.
5. Rank by confidence and fit.
6. If the best fit is below `0.50` confidence or below 60 percent fit, compose from primitives.
7. Record the choice and any assumption.

Component fit score:

| Criterion | Weight |
|---|---|
| Role | 3 |
| Anatomy | 2 |
| Tone | 2 |
| Responsive | 1 |
| Accessibility | 2 |

## Motion selection

- Use only extracted primitives.
- Use one easing family and the duration steps.
- Reserve choreography for the hero or one signature moment.
- Entrances are slower than hover states.
- Every primitive has a reduced-motion fallback.
- Do not add parallax or cursor effects to app routes.
- Choose stillness when the content is the point.

## Content selection

- Use the extracted voice attributes.
- Prefer concrete nouns and real place names.
- State numbers and durations plainly.
- Use honest hedges when facts are uncertain.
- Do not invent proof, reviews, awards, prices, or availability.
- Use verbs for CTAs.
- Leave content slots explicit when the client has not supplied copy.

## Fallback rules

If evidence is missing:

| Missing | Fallback |
|---|---|
| Colour token | Use the closest existing semantic token; do not create a hue |
| Type size | Use the nearest step in the extracted scale |
| Radius | Use the system default |
| Shadow | Use the system border or surface tone |
| Component | Compose from primitives |
| Motion | Use a simple fade or no motion |
| Image | Use the designed placeholder |
| Proof | Omit the section; do not invent |
| Copy | Write a clearly marked content slot |

Every fallback is recorded in the page brief.

## Conflict resolution

Examples:

- The fingerprint says "spacious" but the page is an admin table. Density wins for the utility surface; the fingerprint applies to the public shell.
- The brand uses a transparent navbar, but the page is a light inner page. Use the solid header; transparent is reserved for dark hero index routes.
- The accent is clay, but the background is night and contrast fails. Use sand for text and clay only for a fill.
- A component has two variants. Choose the one with higher confidence and the one used on the closest page type.

## Decision record

Every non-trivial choice gets a record:

```json
{
  "decision": "hero-variant",
  "choice": "editorial",
  "alternatives": ["full-bleed", "split"],
  "reason": "The source uses type-led heroes on destination pages; full-bleed is reserved for the homepage.",
  "evidence": ["app/destinations/page.tsx:31", "components/hero.tsx:18"],
  "confidence": 0.82
}
```

## Adding to the DNA

If a new token, component, or pattern is genuinely required:

1. Mark it as an extension, not extracted DNA.
2. Reuse existing primitives where possible.
3. Add it to the DNA with evidence and confidence.
4. Increment the DNA version.
5. Re-run validation.
6. Document the change in provenance.

An extension is allowed. Pretending it was always part of the brand is not.

## Anti-patterns

- Choosing a component because it looks impressive.
- Adding a new surface tone for variety.
- Averaging two conflicting tokens.
- Using a low-confidence component as if it were certain.
- Copying a page recipe from another client without adapting the fingerprint.
- Treating the fingerprint as a complete design system.
