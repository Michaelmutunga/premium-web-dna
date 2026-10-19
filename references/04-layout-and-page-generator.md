# Layout Grammar and Page Generator

A page is a sequence of surfaces and section types, not a random arrangement of components. Extract the grammar, then generate from it.

## Layout grammar

### Containers

Record the maximum content width and gutters at each breakpoint. Common pattern:

```text
max-w-6xl (72rem / 1152px)
px-5 (20px), sm:px-8 (32px)
```

A narrow reading measure is separate from the container. Record it in characters, not pixels, when possible.

### Vertical rhythm

Record the repeated section padding:

| Pattern | Example | Use |
|---|---|---|
| Standard | `py-14 sm:py-20` | Content chapters |
| Feature | `py-20 sm:py-28` | Moments that need air |
| Shell top | `pt-12 sm:pt-16` | Inner pages |
| Footer | `py-14` | Global footer |

The ratio between steps is part of the DNA. A 1.4x jump feels different from a 2x jump.

### Grids

Record:

- column counts by breakpoint;
- gaps;
- spans and featured items;
- asymmetry;
- order changes;
- whether cards share height.

### Surface sequence

List the page's tonal acts:

```text
night hero -> light marquee -> ivory statement -> sand/40 journeys ->
earth-deep migration -> ivory route -> parchment destinations ->
bark-deep locality -> earth-deep trust -> ivory journal -> night closing
```

Rules to extract:

- Are dark chapters ever adjacent?
- Does the accent appear on every surface?
- Which surface is used for proof, product, place, and invitation?
- Does the header invert over dark heroes?

### Shape and depth

Record the radius scale, border language, shadow language, and whether depth comes from tone or elevation. The same page can feel premium with 2px corners and hairline borders, or generic with 12px corners and layered shadows.

### Header and footer

Record:

- utility bar and main bar;
- sticky behaviour;
- transparent versus solid states;
- height cost on mobile;
- active nav treatment;
- mobile menu pattern;
- footer columns and legal content.

## Page archetypes

Each archetype is a starting grammar. Adapt it to the extracted DNA; do not force sections the brand does not use.

### Landing page

```text
Hero
Proof or trust strip
Offering / product chapters
Differentiation
Process or how it works
Proof (testimonial, case, data)
Objection handling / FAQ
Closing CTA
Footer
```

Goal: move from wonder to understanding to confidence to action. The emotional peak should not be the last section; the invitation should.

### About

```text
Editorial hero
Origin or purpose
Values / principles
People or place
Proof
Related work or journal
CTA
```

Do not invent milestone timelines. Use numbered facts, principles, or places when the evidence supports them.

### Services

```text
Intro
Service cards or chapters
Process
Engagement or pricing model
Proof
FAQ
CTA
```

If pricing is quote-based, say so. Do not invent a starting price.

### Service or tour detail

```text
Breadcrumbs
Editorial hero with key facts
Overview
Structured detail (timeline, inclusions, specs)
Proof or gallery
Related items
CTA
```

### Index or catalogue

```text
Index hero
Filters synced to URL
Result count
Grid
Empty state
Related categories
CTA
```

### Article

```text
Title and metadata
Hero
Body with structured subheads
Pull quote or data
Related articles
CTA
```

### Contact

```text
Intro
Form
Contact details / address
Hours or response expectation
FAQ
```

Use visible labels, real error states, and a success state.

### Pricing

```text
Intro
Plan or tier comparison
What is included
FAQ
CTA
```

Do not invent discounts, countdowns, or scarcity.

### Case study

```text
Client and context
Challenge
Approach
Result with evidence
Quote
Related work
CTA
```

### Authentication

```text
Brand
Form
Error and success states
Recovery
Legal
```

### Portal

```text
Shell
Tabs or nav
Summary
Primary content
Empty and error states
Support
```

### Admin

```text
Operations header
Grouped nav
Dense content
Tables, filters, actions
Dialogs and drawers
Audit and permission states
```

Admin prioritises density and clarity over cinematic motion.

## Page brief template

Before generating, fill:

```json
{
  "page_type": "landing",
  "goal": "request a tailored quote",
  "audience": "high-intent international travellers",
  "commitment_level": "medium",
  "fingerprint": "Explorer-Luxury",
  "required_sections": [
    "hero",
    "trust",
    "offering",
    "process",
    "proof",
    "faq",
    "cta"
  ],
  "constraints": [
    "no invented reviews",
    "no prices",
    "client-supplied photography only"
  ]
}
```

## Generation sequence

1. Read the fingerprint and `ai-rules.json`.
2. Choose the page archetype.
3. List required sections in narrative order.
4. Assign a surface tone to each section.
5. Match each section to a component with confidence `>= 0.50`.
6. Choose the type scale and measure.
7. Choose motion from the extracted primitives only.
8. Write copy slots, not invented facts.
9. Add accessibility notes and states.
10. Validate against the DNA and scorecard.

## Section matching

For each required section:

| Question | If no |
|---|---|
| Is there a direct component? | Compose from primitives |
| Does the variant fit the surface tone? | Use a tone override, not a new component |
| Does it work below `md`? | Recompose, do not hide content |
| Does it have empty/error states? | Add states from the system |
| Does it respect reduced motion? | Provide a still fallback |

## Responsive rules

- Preserve reading order when stacking.
- Do not hide essential content on mobile.
- Do not turn a table into an unreadable horizontal scroll without a caption or alternative.
- Do not use hover to reveal the only copy of an excerpt.
- Preserve the focal point in crops.
- Keep tap targets at least 44x44 CSS pixels where practical.

## Conversion analysis

Phase 8 of the audit answers:

- What are the low, medium, and high commitment actions?
- Is the primary CTA consistent across header, hero, mid-page, and closing?
- Is the secondary action explorative rather than competing?
- Is proof specific and real?
- Is pricing honest about being quote-based?
- Are availability and confirmation language cautious?
- Where does the user have to guess?
- Which forms ask for more than they need?

Record the answers as findings, not as opinions.

## Anti-patterns

- Copying a page section order from a competitor.
- Adding a section because the template has one.
- Using a new surface tone for a single section.
- Hiding the only excerpt behind hover.
- Generating a hero with no evidence for its variant.
- Filling missing proof with invented reviews, awards, or numbers.
- Using urgency devices the brand does not use.
