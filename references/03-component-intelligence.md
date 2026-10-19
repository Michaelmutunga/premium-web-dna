# Component Intelligence

Components are the vocabulary of the design system. A page audit that lists screenshots without naming components cannot generate a new page in the same language.

## Inventory rules

- Inventory components that repeat or establish a pattern.
- Name components by role, not by page position (`Hero`, `SectionHeading`, `JourneyCard`, not `HomeTop`).
- Record variants separately only when they change anatomy, tone, or behaviour.
- Record states for every interactive component.
- Record responsive recomposition.
- Cite evidence for every entry.
- Do not invent a component to fill a taxonomy slot.

## Component record

```json
{
  "id": "journey-card-image",
  "component": "JourneyCard",
  "variant": "image",
  "confidence": 0.95,
  "evidence": [
    "components/cards.tsx:44",
    "app/page.tsx:118"
  ],
  "anatomy": ["media", "category", "title", "excerpt", "meta", "link"],
  "states": ["default", "hover", "focus-within", "loading"],
  "responsive": "one column, two at sm, three at lg",
  "tokens": ["ivory", "ink", "ink/15", "type-h3", "type-small"],
  "accessibility": "entire card is not a link; the title link is the target",
  "motion": "no lift; hover changes border and reveals excerpt"
}
```

## Confidence rubric

| Score | Meaning | Allowed use |
|---|---|---|
| `0.90-1.00` | Multiple direct sources | Default generation |
| `0.70-0.89` | Direct source plus corroboration | Generate with minor care |
| `0.50-0.69` | Inferred from related patterns | Generate only with a note |
| `<0.50` | Assumption | Do not generate; ask or compose |

Confidence is not a quality score. A low-quality button can be `1.00` confident. Confidence measures how sure we are that the component belongs to the DNA.

## Taxonomy

### Shell

| Component | Anatomy | States |
|---|---|---|
| AnnouncementBar | message, link, dismiss | default, hidden |
| Header | utility bar, brand, nav, account, CTA | transparent, solid, scrolled, mobile |
| Navigation | links, active marker, overflow | default, active, focus, mobile |
| MobileMenu | dialog, links, close, contact | closed, open, reduced-motion |
| Breadcrumbs | list, separator, current page | default |
| Footer | brand, columns, contact, legal | default |
| SkipLink | target, label | hidden until focus |

### Hero

| Variant | Anatomy | When it fits |
|---|---|---|
| Full-bleed | media, scrim, eyebrow, headline, lede, CTAs, scroll cue | Photography is the primary emotional carrier |
| Split | media one side, text one side | Brand needs equal image and explanation |
| Editorial | type-led, small media or rule | Authority or minimal brands |
| Video | video, poster, scrim, pause control | Motion is part of the promise |
| Index | oversized word, supporting sentence, filter | Catalogue and archive pages |

Record alignment (centre, bottom, left), height (`svh` or fixed), scrim stops, headline line count, CTA count, and mobile crop.

### Section header

The most repeated composition:

1. eyebrow;
2. display heading;
3. lede;
4. optional quiet link.

Record whether it is left-aligned or centred, max measure, and spacing to content.

### Cards

| Card | Key decision |
|---|---|
| Editorial card | Border or surface, image ratio, excerpt clamp |
| Feature card | Light or dark, split ratio, content padding |
| Destination tile | Scrim, label placement, hover excerpt |
| Article card | Category, title, date, reading time |
| Pricing card | Price, unit, inclusions, CTA, emphasis |
| Stat card | Number, label, source |
| Quote card | Quote, attribution, role |
| Team card | Portrait, name, role, link |

Record whether hover changes geometry, colour, or only content. A card that lifts and scales is a different DNA from a card that changes border colour.

### Lists and timelines

- icon feature list;
- numbered process;
- vertical timeline with rail, dots, day label;
- horizontal steps;
- FAQ list or accordion;
- logo or trust row;
- stats row.

For timelines, record the rail, dot, label, media ratio, and whether mobile preserves the rail.

### Data

- table with caption, head, numeric alignment, hover;
- definition list or spec grid;
- comparison table;
- filter bar and active filter state;
- pagination or load more;
- empty result state.

### Forms

- input, textarea, select, checkbox, radio, file, search;
- label, hint, error, success;
- validation timing;
- submit states: idle, sending, sent, error;
- multi-step progress;
- consent and privacy copy;
- honeypot or anti-spam, if visible.

Record whether labels are always visible. Placeholder-only labels are an accessibility finding.

### Overlays

- modal dialog;
- drawer;
- popover;
- tooltip;
- toast;
- command palette.

Record focus trap, Escape, focus return, backdrop, scroll lock, and motion.

### Feedback

- skeleton;
- spinner;
- empty state;
- error state;
- success state;
- 404 and offline states.

A skeleton should match the final layout. A centred spinner that replaces a whole section is a different UX decision.

### Media

- image with focal point;
- responsive `<picture>` crop;
- gallery;
- video with poster and pause;
- map;
- before/after;
- logo mark and orbital lockup.

### Commerce and booking

- price display;
- availability;
- date picker;
- traveller selector;
- cart or summary;
- checkout step;
- payment state;
- confirmation.

Record the honesty of availability and pricing language. A false green light is a trust finding.

### App surfaces

- portal shell and tabs;
- admin shell and grouped nav;
- dashboard widgets;
- data table with actions;
- settings form;
- role or permission state.

App surfaces often reuse public tokens with less motion. Record that difference.

## Anatomy template

For each component answer:

1. What is the outer container?
2. What is the visual anchor?
3. What is optional?
4. What is the reading order?
5. What changes on hover, focus, active, disabled, loading, empty, error?
6. What changes below `md`?
7. What tokens does it consume?
8. What accessibility behaviour is required?
9. What motion does it use, and what is the still fallback?

## Component matching

Given a required section, score candidate components:

| Criterion | Weight |
|---|---|
| Role match | 3 |
| Anatomy match | 2 |
| Tone/surface match | 2 |
| Responsive match | 1 |
| Accessibility fit | 2 |

Choose the highest total. If the best score is below 6 of 10, compose from primitives instead of forcing an unsuitable component.

## Anti-patterns

- Naming a component after a client page.
- Recording only the default state.
- Treating a one-off layout as a reusable component.
- Assigning confidence without evidence.
- Inventing a component because a page recipe expects one.
- Describing hover as "animation" without saying what moves.
- Ignoring the mobile recomposition.
