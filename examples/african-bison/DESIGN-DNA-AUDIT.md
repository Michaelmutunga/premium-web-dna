# Design DNA Extraction Audit

African Bison Classic Tours, cinematic revamp

| Field | Value |
|---|---|
| Repository | `Michaelmutunga/African-Bison-Classic-Tours-` |
| Branch audited | `redesign/cinematic-ui` |
| Audit date | 19 October 2026 |
| Method | Static source review of tokens, primitives, pages and motion; contrast ratios computed from declared hex values |
| Source brief | `DESIGN DNA EXTRACTION AUDIT.txt` (available to Phase 5 only; later phases below are reconstructed and labelled as extensions) |
| Code changes | None. This is a documentation audit |

The brief text ends mid Phase 5 at "Animations: Duration / Easing / Delay patterns". Phases 1 to 5 are answered directly. The sections after Phase 5 are an extension built from the same evidence so the extraction remains usable as a complete system document.

---

## 0. Executive extraction

### The DNA in one sentence

A quiet, editorial safari house: full-bleed East African photography, a warm earth palette, a single high-contrast serif, hairline rules, square corners and one slow camera-like motion curve.

### The ten fingerprints

1. **Photography carries emotion, typography carries authority.** Images are full-bleed or large, text sits directly on them behind a scrim, and the serif does the naming.
2. **One accent only.** Terracotta clay is the sole action and emphasis colour. Everything else is ink, ivory, sand, earth or bark.
3. **Material contrast instead of decoration.** The page alternates ivory, parchment, sand, earth-deep, bark-deep and night. Depth comes from section tone, not shadows.
4. **Rectilinear geometry.** Cards, buttons, inputs and dialogs use `rounded-[2px]` or no radius. Pills appear only for badges and small nav chips.
5. **Hairline structure.** `border-ink/10`, `border-ink/15`, `border-ink/20` on light surfaces and `border-ivory/10` to `/25` on dark. Almost no box shadows.
6. **Editorial type contrast.** Fraunces at 350 or 560 for display, Inter at 400 to 650 for facts and UI. Uppercase 12px labels with 0.18em to 0.22em tracking.
7. **One motion family.** `cubic-bezier(0.16, 1, 0.3, 1)` at 0.35s, 0.7s or 1.1s. Even spring-driven cursor and magnetic buttons read as controlled, not playful.
8. **Camera motion, not interface motion.** Masked line reveals, scroll-word opacity, parallax, slow Ken Burns, a route line drawing itself. Nothing bounces for its own sake.
9. **Honest cartography.** The route is explicitly labelled schematic, not to scale, with no invented distances or drive times.
10. **Designed absence.** Missing photography becomes a toned, seeded placeholder rather than a broken image or a borrowed park photo.

### Premium perception formula

The site earns its premium feel through restraint, not ornament:

```
premium = (photographic scale x typographic discipline x material contrast x motion control)
          / (visual noise + rounded containers + gradient effects + colour count)
```

Every choice in the codebase raises the numerator or lowers the denominator. That is the repeatable recipe.

---

## Phase 1: Design philosophy and core visual identity

### Archetype

**The quiet guide.** Not a luxury resort, not an adventure broker, not a booking marketplace. The brand behaves like an independent operator who has walked the ground for years and does not need to raise its voice.

Supporting evidence:

- Hero eyebrow: "Private - Independent - Kenya and Tanzania".
- Statement: "Private journeys, planned by people who know the ground. No queues, no scripts, no rushing."
- Trust strip: "JKIA, Nairobi", "Private", and a live count of published itineraries.
- Footer: "East African safaris, planned around you. Nairobi, Kenya."
- No awards, ratings, review counts, certifications or guarantee language anywhere in the public shell.

### Audience posture

International, high-intent travellers who are comparing specialist operators. The design assumes they value judgment, privacy and specificity over discounts. It avoids hard-sell badges and countdowns, and uses plain, declarative copy.

### Visual identity principles extracted

| Principle | Implementation |
|---|---|
| Let the land set the palette | 13 tokens sampled from savannah, bark, earth, ivory and night |
| Keep the frame sharp | 2px corners, 1px rules, no floating cards |
| Use one voice for display | Fraunces with optical size axis, weights 350 and 560 |
| Keep facts in sans | Inter for body, labels, controls, tables and prices |
| Make one colour act | Clay and clay-deep for calls to action, active states and emphasis |
| Alternate light and dark acts | Section background changes mark narrative chapters |
| Move like a camera | Slow expo easing, masked reveals, parallax and Ken Burns |
| Never fake certainty | Schematic route, "or similar" accommodation language, no sighting promises |
| Design the empty state | Toned placeholders with seed labels |
| Respect the reader's settings | Reduced motion, data saver and 2g/3g fallbacks |

### Signature moves

- The 112px orbital brand mark: static buffalo logo at centre, business name rotating slowly around it.
- The 100svh hero with a bottom-weighted information stack and a spinning scroll cue.
- The `type-mega` headline, uppercase at 350 weight, with the final line in sand.
- The 0.5px clay scroll progress line.
- Alternating ivory, sand, earth-deep, bark-deep and night chapters.
- The route line that draws on scroll and is explicitly not to scale.
- The closing section built around the phone number in `type-mega`.
- Image reveals that start pixelated and resolve, or parallax gently inside a crop.

### Anti-signatures, things the design deliberately refuses

- No glassmorphism, no frosted cards, no `backdrop-blur` on content.
- No decorative gradients. Gradients exist only as media scrims.
- No neon, no purple SaaS palette, no blue links.
- No heavy drop shadows or floating cards.
- No animal silhouettes, tribal pattern wallpaper, excessive gold or safari clip art.
- No fake reviews, awards, certifications or urgency devices.
- No generic "Welcome to" hero copy.
- No emoji in UI copy.

### Voice and content DNA

- Short declarative sentences. Specific nouns. No filler.
- Concrete place names: JKIA, Amboseli, Mara, Serengeti, Ngorongoro.
- Honest hedges: "Typically", "photo pending", "schematic route", "availability needs confirmation".
- Numerals and durations stated plainly: "12 days", "2 travellers", "6 published itineraries".
- Calls to action are verbs: "Design your safari", "Explore safaris", "View itinerary", "Start planning".

---

## Phase 2: Colour system

### Token inventory

Defined once in `app/globals.css` inside Tailwind's `@theme`.

| Token | Hex | Role | Typical use |
|---|---|---|---|
| `ink` | `#14120f` | Primary text, dark fill | Body copy, solid buttons, header text |
| `ink-soft` | `#2a2620` | Secondary dark | Rare, softer dark text |
| `ivory` | `#faf7f1` | Primary surface | Page background, light cards, light text on dark |
| `parchment` | `#f3ede1` | Alternate light surface | Destination section, table head |
| `sand` | `#e4d9c4` | Warm light surface and light accent | Badges, eyebrows on dark, hero highlight text |
| `sand-deep` | `#cbb995` | Deeper warm neutral | Support tone, rarely used directly |
| `earth` | `#5c6650` | Muted green | Quiet accent, rarely used |
| `earth-deep` | `#3d4436` | Dark green surface | Migration and trust chapters |
| `bark` | `#6b4f35` | Warm brown | Support tone |
| `bark-deep` | `#3a2a1c` | Deep brown surface | Nairobi in a day chapter |
| `night` | `#0e0d0b` | Near-black surface | Hero, footer, closing, dark cards, overlays |
| `clay` | `#b4552d` | Action accent | Primary accent button, focus ring, progress bar, active tab |
| `clay-deep` | `#8c3f20` | Darker accent | Small labels on light, links on hover, error borders |

### Distribution

The site is not colour-balanced in the SaaS sense. It is tonal:

- **60 percent:** ivory and parchment surfaces.
- **30 percent:** sand, earth-deep, bark-deep and night chapters.
- **10 percent or less:** ink type and clay accents.

Clay never becomes a background for large areas. It appears as a button fill, a 2px tab rule, a 0.5px progress line, a bullet, a focus ring or a small label.

### Measured contrast

Ratios computed from the declared hex values using WCAG relative luminance.

| Foreground | Background | Ratio | Reading |
|---|---|---|---|
| ink | ivory | 17.49 | Excellent |
| ink | parchment | 16.04 | Excellent |
| ink | sand | 13.37 | Excellent |
| ivory | night | 18.17 | Excellent |
| ivory | earth-deep | 9.45 | Excellent |
| ivory | bark-deep | 12.85 | Excellent |
| sand | night | 13.89 | Excellent |
| sand | earth-deep | 7.23 | Excellent |
| sand | bark-deep | 9.83 | Excellent |
| sand | bark | 5.37 | Passes normal text |
| clay | ivory | 4.59 | Passes normal text, barely |
| ivory on clay fill | clay | 4.59 | Passes normal text, barely |
| clay-deep | ivory | 6.90 | Comfortable |
| clay-deep | sand | 5.28 | Passes normal text |
| clay | night | 3.96 | Fails normal text |
| ink at 70% | ivory | 6.74 | Passes |
| ink at 60% | ivory | 4.76 | Passes normal text, barely |
| ink at 55% | ivory | 4.06 | Fails normal text |
| ivory at 70% | night | 9.07 | Passes comfortably |
| ivory at 75% | earth-deep | 6.14 | Passes |
| ivory at 65% | night | 7.90 | Passes |

Practical rules derived from this:

- Body copy on light uses `ink`, `ink/70` or `ink/60`. Do not go below `/60` for reading text.
- `ink/55` appears on inactive tabs at 12px. This is below 4.5:1. Raise to `ink/65` or `ink/70`.
- Clay is safe as a fill with ivory text and as text on ivory, but only just. Do not reduce it.
- Never use clay for normal-size text on night. Use sand or ivory instead.
- `clay-deep` is the correct accent for small text on light surfaces.

### Alpha hierarchy

Instead of adding grey tokens, the system derives hierarchy from ink and ivory alpha:

| Purpose | Light surface | Dark surface |
|---|---|---|
| Structural border | `ink/10`, `ink/15` | `ivory/10`, `ivory/15` |
| Form border | `ink/20` | `ivory/30`, `ivory/40` |
| Secondary text | `ink/60`, `ink/70` | `ivory/65`, `ivory/70`, `ivory/75` |
| Hover border | `ink/40`, `ink` | `ivory/60`, `ivory` |
| Quiet fill | `ink/5` | `ivory/10` |

This keeps the palette closed and makes dark and light chapters behave as inversions of one material.

### Scrims

Scrims are permitted only over photography and video.

Global token:

```css
--scrim: linear-gradient(
  to bottom,
  rgb(14 13 11 / 0.55),
  rgb(14 13 11 / 0.15) 40%,
  rgb(14 13 11 / 0.15) 60%,
  rgb(14 13 11 / 0.65)
);
```

Hero-specific scrim, weighted for the header at top and the headline at bottom:

```css
linear-gradient(
  to bottom,
  rgb(14 13 11 / 0.62) 0%,
  rgb(14 13 11 / 0.18) 30%,
  rgb(14 13 11 / 0.08) 48%,
  rgb(14 13 11 / 0.42) 68%,
  rgb(14 13 11 / 0.82) 100%
)
```

### Missing colour semantics

There are no dedicated success, warning or danger tokens. Forms use `aria-invalid:border-clay-deep`, and state components use ink and clay. This is coherent for the editorial brand but weak for payments and booking confirmation, where green or amber would normally aid scanning. Recommendation: add semantic tokens that alias the existing palette rather than introducing new hues, for example `--color-positive: var(--color-earth)`, `--color-attention: var(--color-sand-deep)`, `--color-danger: var(--color-clay-deep)`.

---

## Phase 3: Typography

### Families

| Family | Variable | Role | Loading |
|---|---|---|---|
| Fraunces | `--font-display` | Display, headlines, brand, large numerals | `next/font/google`, Latin subset, `display: swap`, `opsz` axis |
| Inter | `--font-sans` | Body, labels, controls, tables, UI | `next/font/google`, Latin subset, `display: swap` |

No third family. Icons are text glyphs or SVG strokes, not an icon font.

### Type scale

| Utility | Family | Size | Line height | Tracking | Weight | Use |
|---|---|---|---|---|---|---|
| `type-mega` | Fraunces | `clamp(3.5rem, 11vw, 10rem)` | 0.95 | -0.02em | 350 | Hero headline, closing phone number |
| `type-display` | Fraunces | `clamp(2.75rem, 6vw, 5rem)` | 1.02 | -0.015em | 560 | Large editorial statements |
| `type-h1` | Fraunces | `clamp(2rem, 4vw, 3.25rem)` | 1.08 | -0.01em | 560 | Page and feature titles |
| `type-h2` | Fraunces | `clamp(1.5rem, 2.6vw, 2.25rem)` | 1.15 | normal | 560 | Section titles |
| `type-h3` | Inter | 1.125rem / 18px | 1.4 | normal | 650 | Card titles, subheads |
| `type-body` | Inter | 1.0625rem / 17px | 1.7 | normal | 400 | Reading copy, max 68ch |
| `type-small` | Inter | 0.9375rem / 15px | 1.6 | normal | 400 | UI copy, metadata, links |
| `type-caption` | Inter | 0.8125rem / 13px | 1.5 | normal | 400 | Captions, fine print |
| `type-label` | Inter | 0.75rem / 12px | 1.4 | 0.18em | 650 | Uppercase labels, buttons |
| `type-eyebrow` | Inter | 0.75rem / 12px | 1.4 | 0.22em | 650 | Hero eyebrow, cinematic labels |
| `type-numeric` | Inter | inherited | inherited | 0 | tabular | Prices, counts, dates |

Additional display sizes are used ad hoc with Tailwind: `text-4xl` for trust facts and mobile menu links, `text-[1.65rem]` for the header wordmark, `text-3xl sm:text-5xl` for the scroll statement.

### Scale behaviour

- The hero headline is 56px at 375px wide, about 158px at 1440px, and capped at 160px.
- `type-h1` is 32px at mobile and 52px at desktop.
- `type-body` never drops below 17px. `type-small` never drops below 15px. The 12px label is reserved for uppercase, tracked, bold text.
- Body measure is capped at 68ch; hero body is capped at 672px.

### Typesetting rules

- Uppercase is reserved for labels, eyebrows and the hero headline. The hero heading still carries a sentence-case accessible name.
- The serif is set tight: negative tracking and line heights from 0.95 to 1.15.
- The sans is set loose enough to read: 1.6 to 1.7.
- Display copy uses `text-balance` where headlines wrap.
- Metadata uses middle dots: "12 days - Private & tailor-made" style separators.
- Numerals in financial and trust contexts use `tabular-nums`.
- There is no italic body copy. Fraunces italic is used only in the orbital ring.
- Links on light are underlined with `underline-offset-4`; on dark they are sand or ivory with the same underline treatment.

### Typographic hierarchy pattern

The recurring block is:

1. 12px uppercase tracked eyebrow, sand on dark or clay-deep on light.
2. Fraunces headline, sentence case, tight.
3. 17px lede at `ink/70` or `ivory/75`, capped near 68ch.
4. Content.
5. A quiet underlined text link, often with an arrow.

This is the single most repeated composition in the product. It appears in `SectionHeading`, `MarketingShell`, tour detail sections, destination pages and the admin shell.

---

## Phase 4: Layout and spacing system

### Base unit

4px. All spacing resolves to Tailwind's 4px scale. The working set is deliberately small:

`1 = 4`, `1.5 = 6`, `2 = 8`, `3 = 12`, `4 = 16`, `5 = 20`, `6 = 24`, `8 = 32`, `10 = 40`, `14 = 56`, `20 = 80`, `28 = 112`.

### Containers and gutters

| Context | Width | Gutter |
|---|---|---|
| Standard content | `max-w-6xl` (72rem / 1152px) | `px-5` (20px), `sm:px-8` (32px) |
| Hero content | `max-w-6xl` | `px-5`, `sm:px-10` (40px) |
| Header bar | `max-w-6xl` via Container | 20px / 32px |
| Reading copy | `type-body` max 68ch | inherited |
| Hero lede | `max-w-2xl` (672px) | inherited |

### Vertical rhythm

| Pattern | Padding | Where |
|---|---|---|
| Standard section | `py-14 sm:py-20` (56 / 80px) | Journeys, destinations, route, Nairobi, journal |
| Feature section | `py-20 sm:py-28` (80 / 112px) | Scroll statement, closing CTA |
| Marketing shell | `pt-12 pb-20 sm:pt-16` (48 / 64 top, 80 bottom) | Inner pages |
| Footer | `py-14` | Global footer |
| Admin shell | `py-8` | Operations console |
| Customer portal | `py-10` | Portal shell |

The ratio is consistent: 56/80 for content chapters, 80/112 for moments that need air. The jump between them is roughly 1.4x, matching the type scale's restraint.

### Grids

- Journeys: 1 column, `sm:grid-cols-2`, `lg:grid-cols-3`, gap 24px.
- Featured journey: 2 columns at `md`, image and text split 50/50.
- Destinations: 1 column, `sm:grid-cols-2`, `lg:grid-cols-4`, gap 16px, first item spans 2x2.
- Nairobi experiences: 1, 2, 3 columns, gap 16px.
- Journal: 1 column, 3 columns at `md`, gap 16px.
- Footer: 1 column, 2 at `sm`, 4 at `lg`, gap 40px.
- Contact: `lg:grid-cols-[1fr_22rem]`, form plus a fixed-width address card.
- Admin: `lg:grid-cols-[16rem_1fr]`, 256px nav plus content.
- Builder: step rail plus panel, recomposed on mobile.

### Shape language

| Element | Radius |
|---|---|
| Buttons, cards, inputs, selects, dialogs, drawer, tables, media | `2px` |
| Badges, filter chips, portal nav chips | `rounded-full` |
| Avatars and brand orbit | circle |
| Images | inherit the container, usually square |

There is no 8px, 12px or 16px radius anywhere in the core system. This single decision does most of the work in separating the brand from generic SaaS and WordPress safari templates.

### Depth language

- Borders, not shadows.
- Overlays use `ink/60` backdrops.
- The only persistent shadow is on the primary magnetic CTA, and it is restrained.
- Sticky elements appear on flat backgrounds: header ivory at 95 percent, admin nav sticky at 24px.
- No layered card stacks, no floating action buttons.

### Light and dark chapter rhythm

The homepage reads as a sequence of tonal acts:

| Act | Surface | Text |
|---|---|---|
| Hero | night with photograph | ivory, sand |
| Marquee | inherited light | ink |
| Statement | ivory | ink |
| Signature journeys | `sand/40` | ink |
| Migration | earth-deep | ivory |
| Route | ivory | ink |
| Destinations | parchment | ink |
| Nairobi | bark-deep | ivory |
| Trust | earth-deep | ivory |
| Journal | ivory | ink |
| Closing | night | ivory |

The dark chapters are never adjacent except migration to route to destinations, which alternates back to light. This prevents the site from becoming a dark-mode template and gives the scroll a chapter structure.

### Header DNA

- Two tiers at the top: a 32px utility bar on night with location and contact, then the main bar.
- Main bar includes a 112px orbital brand mark, the stacked wordmark, six nav links, account, staff and the accent CTA.
- Transparent over the five dark hero index routes; solid ivory elsewhere.
- On scroll, the utility bar collapses to zero height with a 300ms transition; the main bar remains.
- The mobile menu is a full-screen native `<dialog>` on night, with 36px Fraunces links staggered by 45ms and a 80px orbital mark.
- Active nav uses a 1px underline and a 4px dot, both sand on dark and clay-deep on light.

The header is intentionally oversized. The 112px orbit gives the site a masthead rather than an app-bar feel. The trade-off is vertical cost, discussed under gaps.

### Footer DNA

- Night surface, ivory text.
- Four columns: brand and statement, safaris, company, contact.
- Labels in sand `type-label`; links in `type-small` at `ivory/80`.
- Bottom bar separated by `border-ivory/15`, copyright in `type-caption` at `ivory/60`.
- No newsletter form, social strip, payment badges or app links.

---

## Phase 5: Motion system

### Motion laws

1. One easing family: `cubic-bezier(0.16, 1, 0.3, 1)`, named `--ease-expo`.
2. Three durations: `--duration-quick: 0.35s`, `--duration-base: 0.7s`, `--duration-slow: 1.1s`.
3. Motion describes space, hierarchy or progress. It does not decorate idle elements.
4. Entrances are slower than exits. Hover states are quick.
5. Reveals happen once, on entry, and do not replay on scroll back.
6. Every primitive degrades to a still composition under reduced motion, save-data or 2g/3g.
7. The hero is the only place with a choreographed sequence.

### Token table

| Token | Value | Used by |
|---|---|---|
| `--ease-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | All entrances, hero, Lenis, cursor, magnetic buttons |
| `--duration-quick` | 0.35s | Small transitions, hover, menu |
| `--duration-base` | 0.7s | Reveals, masked text |
| `--duration-slow` | 1.1s | Lenis smooth scroll, larger camera moves |

Notable exceptions, all intentional:

- Hero line reveal: 0.9s.
- Welcome overlay lift: 0.55s after a 0.6s hold, about 1.2s total.
- Ken Burns: 24s.
- Orbital ring: 22s linear.
- Header colour transition: 300ms.
- Mobile menu link stagger: 45ms per item, 0.5s transition.
- Spring values: magnetic 160/14/0.4, cursor 260/26/0.5, scroll progress 120/28.

### Primitive inventory

| Primitive | File | Trigger | Motion | Timing | Fallback |
|---|---|---|---|---|---|
| `Reveal` | `components/motion/reveal.tsx` | Enters viewport, once | Opacity 0 to 1, y 28 to 0 | 0.7s expo | Still, no offset |
| `RevealText` | `reveal-text.tsx` | Enters viewport | Words rise from 110% inside masks | 0.7s, 0.06 stagger | Static words |
| `ScrollWords` | `scroll-words.tsx` | Scroll progress | Word opacity 0.22 to 1 | Scroll-linked | Full opacity |
| `Parallax` | `parallax.tsx` | Scroll | y -6% to 6%, scale 1.08 to 1 | Scroll-linked | Still image |
| `DiaReveal` | `dia-reveal.tsx` | In view, once | Lines rise 112%, drift -3.5% x, rotate 1.6deg | 0.9s, 0.12 stagger | Plain lines |
| `HyperText` | `hyper-text.tsx` | Hover, focus, touch | Glyph scramble resolves to label | Short, event-driven | Plain label |
| `MagneticCta` | `magnetic-button.tsx` | Fine pointer movement | Button follows cursor within bounds | Spring 160/14/0.4 | Static button |
| `SpinningText` | `spinning-text.tsx` | Always | Ring rotates 360deg | 22s linear | Static ring |
| `DrawPath` | `draw-path.tsx` | Scroll progress | SVG path length 0 to 1 | Scroll-linked | Full path |
| `ScrollProgress` | `scroll-progress.tsx` | Page scroll | 0.5px clay bar scales x | Spring 120/28 | Hidden or still |
| `WelcomeIntro` | `welcome-intro.tsx` | First visit, once per session | Night curtain lifts, mark fades, ring draws | 0.55s + 0.6s delay | Skipped |
| `MigrationScene` | `migration-scene.tsx` | Near viewport | 52svh video, play or pause | Native video | Poster image |
| `PixelImage` | `pixel-image.tsx` | Load or view | Low-res pixel layer resolves | Short | Sharp image |
| `SmoothScroll` | `smooth-scroll.tsx` | Global | Lenis interpolation | 1.1s | Native smooth scroll |
| `SmoothCursor` | `smooth-cursor.tsx` | Fine pointer only | Custom cursor follows | Spring 260/26/0.5 | Native cursor |
| `VelocityMarquee` | `velocity-marquee.tsx` | Constant scroll | Row drifts at 0.55, skews with velocity | Continuous, scroll-boosted | Static row |
| `Ken Burns` | `globals.css` | Hero load | Scale 1 to 1.08 | 24s expo | Still image |
| Menu stagger | `globals.css` | Dialog open | Opacity and 14px rise | 0.5s, 45ms stagger | Instant |

### Hero choreography

The hero is the only scored sequence:

1. Server paints the dark hero and image immediately. The image is `priority` and `fetchPriority="high"`.
2. `WelcomeIntro` mounts after hydration, only on a first visit in the session, and only if motion is allowed. It holds a night overlay for 0.6s, then lifts for 0.55s, about 1.15s total.
3. `DescentHero` reads the same session state. First visit sets headline delay to 1.0s; repeat visits use 0.15s. Reduced-motion users skip the overlay and receive the headline immediately because `DiaReveal` returns a static render.
4. Four lines of `type-mega` rise at 0.12s intervals over 0.9s, with the last line in sand.
5. Magnetic CTAs and the spinning scroll cue are available immediately.
6. On scroll, the utility bar collapses and the header turns solid at 90 percent of viewport height on the homepage.

This sequencing is coherent: the wordmark curtain clears just as the headline begins.

### Scroll behaviour

- Lenis is enabled globally at 1.1s, except on `CALM_ROUTES`, which include admin, dashboard, builder and auth surfaces.
- The scroll progress bar is fixed at the top, 0.5px, clay.
- `ScrollWords` sets reading pace on the statement section.
- `DrawPath` draws the schematic route as it enters view.
- `Parallax` is reserved for destination tiles.
- Reveals use a -12% viewport margin, so content animates after it is meaningfully on screen.

### Reduced motion and calm mode

- CSS clamps all animation and transition durations to 0.01ms under `prefers-reduced-motion`.
- JavaScript primitives check the same query and return static output.
- `useCalmExperience` checks `navigator.connection.saveData` and effective type 2g/3g. When calm, video is not preloaded, marquee and cursor are skipped, and motion primitives stand still.
- The welcome overlay is skipped entirely for reduced motion. The session key is never set in that case, but this is harmless because the overlay is also gated by the same query.
- `content-visibility` and dynamic imports keep below-fold client code out of the initial bundle.

---

## Extension A: Component DNA

### Buttons

`components/ui/button.tsx`

| Variant | Light surface | Dark surface |
|---|---|---|
| `primary` | `bg-ink`, ivory text, hover `bg-ink-soft` | Same, still reads |
| `accent` | `bg-clay`, ivory text, hover `bg-clay-deep` | Same |
| `secondary` | Transparent, `border-ink/25`, hover `border-ink`, `bg-ink/5` | Override with `border-ivory/40`, hover ivory |
| `ghost` | Transparent, hover `bg-ink/5` | Override text and hover |

Sizes: `sm` (`px-4 py-2`), `md` (`px-5 py-3`), `lg` (`px-6 py-3.5`). All use `type-label`, uppercase, 2px radius, inline-flex, no shadow except the magnetic hero variant.

Link flavour: underlined 15px text with `underline-offset-4`, no button chrome. Arrows are literal `->`.

### Cards

`components/ui/card.tsx` and `components/cards.tsx`

- Base: `rounded-[2px] border border-ink/15 bg-ivory`, body `p-5 sm:p-6`.
- Image card: image at `aspect-[16/10]` or `aspect-[4/3]`, content `p-5`, title `type-h3`, excerpt `type-small line-clamp-2`, footer link pinned with `mt-auto`.
- Featured dark card: night background, 50/50 split at `md`, image at least 352px tall, content `p-8 sm:p-10`.
- Destination tile: image with scrim, label and name at bottom left, excerpt revealed on hover and focus-within.
- There are no shadows, no lift-on-hover, no rounded image masks. Hover changes colour and reveals text, not geometry.

### Badges and chips

`components/ui/badge.tsx`

- Tones: neutral, sand, earth, clay, ink.
- Shape: `rounded-full border px-3 py-1`, `type-caption` or `type-label`.
- Use: route stops, status, filters. Not for prices or marketing claims.

Filter chips use the same pill language, with active state `bg-ink text-ivory` and inactive `border-ink/25`.

### Forms

`components/ui/field.tsx`, `select.tsx`

- Control: full width, `rounded-[2px]`, `border-ink/20`, `bg-ivory`, `px-3.5 py-2.5`, 16px text to avoid iOS zoom.
- Focus: global 2px clay outline with 2px offset.
- Invalid: `aria-invalid:border-clay-deep`.
- Labels: `type-label` or `type-small`, always visible. Hints and errors are separate components, not placeholder-only.
- Select: native element with `appearance-none` and an inline SVG chevron, so keyboard behaviour stays native.
- The inquiry form has explicit idle, sending, sent and error states, and marks readiness with `data-ready` for tests.

### Navigation

- Primary nav: 15px Inter, active semibold plus underline and dot.
- Header CTA: accent small button.
- Mobile: full-screen native dialog, 36px Fraunces links, sand for current page.
- Portal: pill tabs with active ink fill.
- Admin: grouped vertical nav, active ink fill with a 6px ivory dot, mobile drawer.
- Breadcrumbs on detail pages: small text with slashes or chevrons, current page in ink.

### Timeline

`components/ui/timeline.tsx`

- Ordered list with a left rail (`border-l`), clay dots, day label in `type-label`.
- Each day supports an image at 16:9, a title, description and metadata.
- On mobile the rail stays left; content does not collapse into cards.
- This is the visual backbone of tour detail pages and the itinerary builder preview.

### Data tables

`components/ui/table.tsx`

- Wrapper: `overflow-x-auto`, 2px border, `type-small`.
- Head: parchment background, `type-label`, semibold, nowrap.
- Body: divided by `ink/10`.
- Numeric cells: right aligned, tabular numerals.
- Caption is screen-reader only.
- No zebra striping, no sticky header by default.

### Dialog and drawer

- Native `<dialog>` with `showModal`, giving Escape, focus trap and focus return for free.
- Backdrop `bg-ink/60`.
- Panel: ivory, 2px radius, max width constrained, header with title and close.
- Drawer reuses the dialog, full height, 26rem max width, left or right.
- Motion is a simple fade and rise, not a bounce.

### Tabs

- Roving tabindex, left and right arrow keys, labelled panels.
- Active tab: clay 2px bottom border and ink text.
- Inactive: `ink/55`, which is the one contrast failure noted above.
- No sliding indicator animation; state changes by colour and border.

### States

`components/ui/states.tsx`

- Spinner: thin clay ring.
- Skeleton: `bg-ink/10` blocks, sized to the final layout.
- Empty state: short heading, one sentence, one action.
- Error state: plain language, retry action, no stack traces.
- Loading sections on the homepage use full section skeletons rather than a centred spinner.

---

## Extension B: Imagery and art direction

### Source policy

- All photography is client-supplied. No stock, no hotlinking, no remote hosts.
- 95 source files, 92 processed to `public/images/`, max 1800px long edge, EXIF and GPS stripped, quality 82 JPEG, about 14.8 MB total.
- Brand logo is a transparent PNG with alpha preserved.
- Every image is registered in `lib/imagery.ts` with src, alt, width, height, focal point, orientation, slots and credit.
- Missing slots render a designed placeholder, never a broken image.

### Art direction

- Warm, low-sun, golden-hour bias.
- Real vehicles, real guides, real guests. Not isolated animal cutouts.
- Wide landscapes for hero and chapters; portrait crops for cards and route tiles.
- Focal points are stored per image so crops keep the subject.
- People appear as participants, not models.
- No image is used to imply a park it does not show. Generic images never name a location.

### Treatment

- Full-bleed or large-format.
- Scrim only when text sits on the image.
- No duotone, no heavy filters, no borders around photos.
- Hover reveals text through opacity, not zoom.
- The pixel-image reveal is the only stylised transition, and it resolves to the real photograph.
- Hero has a dedicated mobile crop via `<picture>` and a `50% 60%` focal point.

### Placeholders

`SafariImage` uses a seeded tone palette, a label and a ratio. The placeholder is part of the composition, so replacing it with photography does not require a redesign. Alt text falls back to "<name> - photo pending", which is honest and testable.

### Credit hygiene

Most entries carry "African Bison Classic Tours // TODO confirm credit"; one carries "Cem Sural // TODO confirm licence". These are development placeholders and must be resolved before launch. The imagery doc explicitly flags third-party marks and watermarks.

---

## Extension C: Page composition and content hierarchy

### Homepage: ten acts

1. **Hero.** 100svh, full-bleed image, orbital brand in header, eyebrow, four-line mega headline, lede, two CTAs, scroll cue. Bottom-aligned, not centred.
2. **Marquee.** A thin band of destination names moving with scroll velocity. Establishes range without a map.
3. **Statement.** One large Fraunces sentence whose words illuminate with scroll. A pause after the hero.
4. **Signature journeys.** Eyebrow, H2, lede, one dark featured card, then a 3-column grid. Ends with category links and a pricing honesty line: "Pricing is quoted per trip".
5. **Migration scene.** Earth-deep full-width video chapter with pause control and poster fallback. Emotional peak.
6. **Route line.** Ivory chapter with a drawn schematic path, badge stops, an explicit "not to scale" note, and a builder CTA.
7. **Destinations.** Parchment chapter, 4-column mosaic with the first tile spanning 2x2, parallax, scrim and hover excerpt.
8. **Nairobi in a day.** Bark-deep chapter, six experience tiles. Gives the airport-based operator a local story.
9. **Trust strip.** Earth-deep, three facts: JKIA base, private operation, live itinerary count. No logos or awards.
10. **Journal and closing.** Three latest articles on ivory, then a night closing act with the phone number in mega type, address, email and two CTAs.

The order follows a deliberate emotional arc: wonder, range, pause, proof of product, emotion, clarity, place, locality, trust, utility, invitation.

### Tours index

- Masked video-style hero with the word "JOURNEYS" and a screen-reader sentence.
- Explorer with category filter synced to the URL.
- Grid of tour cards with imagery, category, title, duration and excerpt.
- No prices on cards, consistent with quote-based pricing.
- Empty state when a filter has no results.

### Tour detail

- Breadcrumbs.
- Editorial hero with title, duration, category and image.
- Overview and structured day-by-day timeline.
- Accommodation, meals, activities, transport, inclusions and exclusions as labelled sections.
- Related tours.
- Inquiry or builder CTA.
- The layout avoids one giant HTML blob; content is structured data rendered into repeating patterns.

### Destinations

- Cinematic index with a drift wall and region filter.
- Detail page with hero, overview, related tours and cross-links.
- Destination cards never promise sightings; they describe what the area is known for.

### Experiences, blog, about, contact, FAQ, travel information

- All use `MarketingShell`: 48/64px top, 80px bottom, eyebrow, H1, lede, 40px gap to content.
- Experiences and blog use the same card and grid language.
- About uses numbered facts in cards, not a timeline of invented milestones.
- Contact pairs the inquiry form with an address card in a 1fr/22rem split.
- FAQ uses a card list with structured data.
- Travel information uses labelled sections, not accordions that hide critical facts.

### Builder

- Step rail with numbered steps and labels.
- The builder is a utility surface, so it uses the same tokens but less cinema: clear controls, visible progress, a sticky summary on desktop.
- It is excluded from Lenis and heavy motion.
- Availability language is cautious: "Availability needs confirmation" rather than a false green light.

### Portal and admin

- Portal: 40px top padding, a row of pill tabs, then content. Light, quiet, customer-facing.
- Admin: operations header with label, H2, signed-in identity, currency toggle and sign out; 256px grouped nav; mobile drawer.
- Both reuse the public tokens, so internal tools feel part of the same brand rather than a separate bootstrap dashboard.
- Admin prioritises density and clarity over cinematic motion.

---

## Extension D: Interaction and UX behaviour

### Navigation model

- Six public destinations in the primary nav: Safaris, Destinations, Experiences, Journal, About, Contact.
- Two account entries: My safari and Staff. Staff is visually quieter.
- One persistent commercial action: Design your safari.
- Detail pages always get a solid header; only index routes with dark heroes get the transparent overlay. This avoids ivory-on-ivory nav failures.
- Mobile menu is a modal experience with large target text and no nested accordions.

### Progressive disclosure

- Tour cards reveal a short excerpt; the detail page reveals the full itinerary.
- Destination tiles reveal a sentence on hover or focus.
- FAQ answers are visible in a list rather than hidden behind hover.
- The builder advances step by step and keeps a summary visible.
- Accommodation alternatives and upgrades appear only where a stay is being configured.

### Trust mechanics

- Real address, phone and email in the header, footer, contact page and closing section.
- Live counts from the database, not marketing numbers.
- Explicit "pricing is quoted per trip" instead of a fake starting price.
- "Photo pending" and "schematic route" instead of false precision.
- No fake scarcity, no countdown timers, no invented reviews.

### Conversion path

The site offers three depths of commitment:

1. Low: explore tours and destinations.
2. Medium: send an inquiry or use the builder.
3. High: reserve and pay through the portal.

The primary CTA is consistently the builder, the secondary is explore, and the tertiary is contact. This hierarchy is stable across header, hero, route section and closing.

### Error and empty behaviour

- Inquiry form has a real error state and a success state.
- Loading sections use skeletons sized to the final layout.
- Empty filters show a message, not a blank grid.
- Missing images show a designed placeholder.
- Payment and availability errors are worded cautiously in the booking flow, without promising inventory.

---

## Extension E: Accessibility, performance and SEO signals

### Accessibility strengths

- Semantic landmarks: header, nav with labels, main, footer, address.
- Skip link to `#content`, plus a hero-level "Skip to safaris" link.
- Visible 2px clay focus ring everywhere, with a sand variant on dark.
- Native dialog for menu and drawer, with focus management and Escape.
- Screen-reader-only full sentence behind the split hero headline.
- Decorative images use empty alt; meaningful images carry specific alt text.
- Reduced motion handled in both CSS and JavaScript.
- Form labels are visible and associated; errors use `aria-invalid`.
- Tables have captions and scoped headers.
- Tabs implement roving tabindex and arrow keys.
- Route information is presented as text, not only as a drawing.

### Accessibility issues found

1. **Inactive tab text at `ink/55` on ivory is 4.06:1.** It is 12px uppercase bold, so it fails WCAG AA normal text. Raise to `ink/65` (about 5.7:1) or `ink/70` (6.7:1).
2. **Clay on night is 3.96:1.** It is currently not used for body text, but it is a latent trap. Ban clay text on night in the design rules.
3. **The header is very tall.** The 112px orbital mark plus padding produces a main bar around 136px, before the 32px utility bar. On a 375x812 phone that is roughly 17 percent of the viewport, and more with the utility bar. It is a deliberate masthead choice, but sticky inner-page headers will feel heavy. Consider scaling the orbit down to 72 to 80px below `md`.
4. **Hover-only excerpts.** Destination and experience excerpts appear on hover or focus-within. On touch they may never appear before navigation. The name remains visible, so this is not blocking, but the excerpt is effectively decorative on mobile.
5. **Hero headline delay for reduced motion is irrelevant, but the session key is not set.** This is harmless today because the overlay is independently gated, but the two components share state implicitly. Document the contract or centralise it.

### Performance strengths

- Hero paints from the imagery manifest without waiting for the database.
- Catalogue sections stream below with Suspense and section-shaped skeletons.
- Below-fold client code is dynamically imported: marquee, migration video, cursor.
- `next/image` with AVIF and WebP, explicit sizes and priority only on the hero.
- Self-hosted video, `media-src 'self'`, no third-party embeds.
- Lenis is disabled on app routes.
- Fonts use `next/font` with `display: swap` and Latin subsets.
- No analytics or tracker scripts in the CSP.
- The CSP is strict: no third-party script, style, frame or connect origins.

### Performance risks

- The hero image is large and eagerly fetched; that is correct for LCP but must stay compressed.
- The 112px header orbit and spinning SVG run on every page.
- The hero video is 9.2 MB, above the documented 5 MB budget, and is deferred but still heavy on mobile networks.
- The custom cursor and scroll progress add continuous work on desktop. Both are skipped on coarse pointers and calm mode.
- Lenis plus scroll-linked words, parallax and draw path can produce many scroll listeners. They are isolated, but worth profiling on low-end Android.

### SEO signals

- Metadata template with brand suffix and a site description.
- Organization JSON-LD in the root layout.
- FAQ structured data.
- Clean URLs and slug-based routing.
- Semantic headings and breadcrumbs on detail pages.
- Image alt text is stored with each asset.
- No keyword stuffing observed in the shell or homepage copy.

### SEO gaps to verify outside this audit

- Per-page canonical URLs and Open Graph images were not exhaustively read in this pass.
- Sitemap and robots output were not executed here.
- Ensure every tour, destination and post generates its own title, description and social image.

---

## Extension F: The reusable design recipe

If this DNA must be reproduced elsewhere, copy these decisions in this order.

### 1. Tokens

```css
--color-ink: #14120f;
--color-ivory: #faf7f1;
--color-parchment: #f3ede1;
--color-sand: #e4d9c4;
--color-earth-deep: #3d4436;
--color-bark-deep: #3a2a1c;
--color-night: #0e0d0b;
--color-clay: #b4552d;
--color-clay-deep: #8c3f20;

--font-display: "Fraunces", Georgia, serif;
--font-sans: "Inter", system-ui, sans-serif;

--ease-expo: cubic-bezier(0.16, 1, 0.3, 1);
--duration-quick: 0.35s;
--duration-base: 0.7s;
--duration-slow: 1.1s;
```

### 2. Ten rules

1. One serif, one sans. No third family.
2. One accent. Clay acts, everything else supports.
3. 2px corners on rectangles, full pills only for badges and chips.
4. 1px borders instead of shadows.
5. 56/80px section rhythm, 80/112px for feature moments.
6. 1152px container, 20/32px gutters, 68ch reading measure.
7. Uppercase 12px labels with 0.18em to 0.22em tracking.
8. Photography full-bleed; scrims only over media.
9. One easing curve; entrances 0.7s, hovers 0.35s, camera moves 1.1s.
10. Every animation has a still fallback and respects reduced motion.

### 3. Page skeleton

```
Transparent or solid header
Full-bleed hero or MarketingShell
Eyebrow / Fraunces H1 / 17px lede
Structured content sections on alternating tones
Quiet underlined links
Night closing CTA
Night footer
```

### 4. Quality test

A page passes the DNA test if:

- It reads correctly in greyscale.
- It still looks composed with all motion disabled.
- Removing the photography leaves a strong typographic page.
- Adding a new section requires no new colour or radius.
- The accent colour appears fewer than five times per viewport.
- No element floats on a shadow that is not earned by interaction.

---

## Extension G: Gaps, risks and recommendations

### P0, resolve before launch

1. **Resolve image credits and licences.** Most `lib/imagery.ts` entries end in "TODO confirm credit"; one is a third-party photographer. Do not publish without clearance.
2. **Compress the hero video** to the documented 5 MB budget or below, and replace the poster with a real frame.
3. **Fix the inactive tab contrast** from `ink/55` to `ink/65` or darker.
4. **Remove the public placeholder line** in the footer: "Contact details are configurable and will move to site settings." It reads as unfinished software, not a premium operator.
5. **Verify per-page metadata, canonicals, Open Graph and sitemap** for every tour, destination and article.

### P1, strengthen the system

6. **Add semantic state tokens** (positive, attention, danger) as aliases of the existing earth, sand and clay-deep values. Do not introduce new hues.
7. **Reduce the mobile header height.** Scale the orbital mark to 72 to 80px below `md`, or hide the orbit on small screens and keep the wordmark.
8. **Document the hero and intro session contract** in one module so the 1.0s and 1.15s timings cannot drift apart.
9. **Provide a touch-visible excerpt** on destination and experience tiles, maybe always visible at `sm` and below, to avoid hover-only content.
10. **Audit clay usage on dark surfaces** and codify "clay is not a text colour on night" in the design rules.

### P2, polish and scale

11. **Add a photography art-direction note** for future shoots: low sun, real guests, no isolated animals, landscape and portrait coverage per slot.
12. **Add a motion budget** per page: one hero sequence, no more than two scroll-linked effects, no autoplay video outside the migration chapter.
13. **Consider a reduced header on app routes.** The marketing masthead is right for the public site, but a 136px sticky bar on the portal and admin costs working space.
14. **Profile low-end Android** with Lenis, parallax, scroll words and the custom cursor enabled.
15. **Extend the type scale documentation** to include the ad hoc sizes currently in use (`text-4xl` trust facts, `text-[1.65rem]` wordmark, `text-3xl sm:text-5xl` statement) so they become tokens rather than one-offs.

### What not to change

- Do not add glassmorphism, decorative gradients or floating cards.
- Do not add a third font, a second accent or a blue link colour.
- Do not round the 2px corners into 12px or 16px.
- Do not replace the editorial serif with a geometric sans.
- Do not add autoplay, parallax or cursor effects to app routes.
- Do not add fake reviews, awards, scarcity or sighting guarantees to fill space.

---

## Appendix A: Evidence map

| Area | Primary files |
|---|---|
| Tokens, type scale, focus, motion CSS | `app/globals.css` |
| Font loading, metadata, shell | `app/layout.tsx` |
| Header and mobile dialog | `components/site-header.tsx` |
| Footer | `components/site-footer.tsx` |
| Page shell and headings | `components/marketing-shell.tsx`, `components/ui/layout.tsx` |
| Buttons, cards, badges, fields, selects | `components/ui/button.tsx`, `card.tsx`, `badge.tsx`, `field.tsx`, `select.tsx` |
| Timeline, tabs, table, dialog, drawer, states | `components/ui/timeline.tsx`, `tabs.tsx`, `table.tsx`, `dialog.tsx`, `drawer.tsx`, `states.tsx` |
| Motion primitives | `components/motion/*` |
| Hero | `components/motion/descent-hero.tsx`, `components/motion/welcome-intro.tsx` |
| Imagery | `lib/imagery.ts`, `components/safari-image.tsx`, `docs/IMAGERY.md` |
| Homepage composition | `app/page.tsx` |
| Tours | `app/tours/page.tsx`, `app/tours/[slug]/page.tsx`, `components/tours/*` |
| Destinations | `app/destinations/page.tsx`, `app/destinations/[slug]/page.tsx`, `components/destinations/*` |
| Experiences, blog, about, contact, FAQ, travel info | Matching `app/*/page.tsx` files |
| Builder | `app/builder/page.tsx`, `components/builder/*` |
| Portal and admin | `components/portal/portal-shell.tsx`, `components/admin/admin-shell.tsx` |
| Security and CSP | `lib/security-headers.ts`, `next.config.ts` |

## Appendix B: Audit limits

- This is a static source audit. No browser session, Lighthouse run, screen-reader pass or device lab was part of this pass.
- Contrast values are computed from declared hex values, before any compositing from photography, opacity stacks or browser rendering.
- The source brief is truncated after Phase 5. Phases 6 onward are reconstructed from the codebase and labelled as extensions, not as verbatim brief items.
- Ad hoc Tailwind sizes and one-off patterns were sampled, not exhaustively enumerated.
- No code, copy, pricing or business facts were changed by this audit.
