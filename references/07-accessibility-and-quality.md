# Accessibility and Quality

Accessibility is not a score category that can be traded against visual polish. It is a launch gate.

## Audit layers

1. **Static:** semantics, labels, alt text, heading order, ARIA, focus styles, reduced motion.
2. **Keyboard:** tab order, skip links, dialogs, menus, tabs, forms, focus return.
3. **Visual:** contrast, zoom, reflow, target size, motion.
4. **Screen reader:** landmarks, names, roles, values, live regions.
5. **Performance:** LCP, CLS, INP, image weight, video weight, client code.
6. **SEO:** titles, descriptions, canonicals, structured data, sitemap, robots.

A static audit can find many issues but cannot replace a browser, screen-reader, or device-lab pass. State that limit.

## Semantics

- One `main` landmark per page.
- Header, nav, main, footer, and address used for their meaning.
- Heading order is logical; display type is styled with the correct element.
- Lists are lists.
- Buttons are buttons; links navigate.
- Tables have captions and scoped headers.
- Forms have visible labels associated with controls.
- Dialogs use native `<dialog>` or a correct ARIA pattern with focus management.
- Tabs use roving tabindex and arrow keys.
- Images have alt text appropriate to purpose.

## Focus

- A visible focus indicator on every interactive element.
- At least 3:1 contrast against the adjacent background.
- A dark-surface variant when the default ring disappears.
- Focus returns to the trigger after a dialog closes.
- Skip link to the main content.
- No focus traps outside modal dialogs.

## Keyboard

Test:

- tab through the whole page;
- open and close the mobile menu with keyboard;
- operate tabs, accordions, and dialogs;
- submit forms and reach errors;
- use the date picker and selects;
- reach the primary CTA without a pointer.

## Contrast

Use declared token values:

```bash
node scripts/contrast.mjs --fg "#14120f" --bg "#faf7f1"
```

Requirements:

- normal text `>= 4.5:1`;
- large text `>= 3:1`;
- UI components and focus indicators `>= 3:1`.

Also check:

- text over photography with the actual scrim;
- alpha text on both light and dark surfaces;
- inactive tabs and disabled controls;
- placeholder text;
- accent-coloured labels.

A token pair that passes on ivory may fail on night. Check every surface.

## Motion and vestibular safety

- Respect `prefers-reduced-motion`.
- Remove non-essential parallax, marquee, cursor, and scroll effects.
- Do not autoplay video with sound.
- Provide pause controls for continuous motion.
- Avoid large-scale zoom and pan on scroll.

## Forms

- Visible labels.
- Hints before the field, errors after it.
- Errors are announced and associated with the field.
- `aria-invalid` on invalid controls.
- Success state is explicit.
- No placeholder-only labels.
- No time limits without an extension.
- Consent is separate from marketing.

## Target size

Aim for 44x44 CSS pixels for primary touch targets. Small text links inside paragraphs are exempt from the strict target-size rule in WCAG 2.2, but still need spacing.

## Performance

Record:

- LCP element and image weight;
- hero video weight and deferral;
- font loading and subsets;
- below-fold client code;
- third-party scripts;
- scroll listeners;
- continuous animations;
- layout shift;
- cache and compression;
- CSP and security headers.

A 9 MB hero video is a performance finding even if it is deferred.

## SEO

Check:

- title and description per page;
- canonical URL;
- Open Graph and social image;
- one H1;
- structured data where appropriate;
- sitemap and robots;
- clean slugs;
- internal links;
- image alt text;
- no keyword stuffing.

## Severity

| Level | Meaning |
|---|---|
| P0 | Blocks launch: unlicensed assets, broken auth, inaccessible core flow, exposed secrets |
| P1 | Material quality issue: contrast failure, missing states, heavy hero video, missing metadata |
| P2 | Polish: inconsistent spacing, ad hoc type sizes, minor motion drift |

Scores describe quality. Severity describes risk. Report both.

## Output format

```markdown
### Accessibility strengths

- ...

### Accessibility issues

1. **Inactive tab text at `ink/55` on ivory is 4.06:1.** Raise to `ink/65` or darker. (P1)
2. **Clay on night is 3.96:1.** Do not use clay for normal text on night. (P1)

### Performance risks

- ...

### SEO gaps

- ...
```

## Anti-patterns

- Using an automated tool as the only accessibility audit.
- Treating a passing contrast ratio as proof that text over photography is readable.
- Hiding focus outlines because they are ugly.
- Removing reduced-motion support because the animation is "subtle".
- Adding a custom cursor without a native fallback.
- Publishing a score without listing P0 blockers.
