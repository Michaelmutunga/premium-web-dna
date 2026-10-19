# Motion and Interaction

Motion is part of the brand when it has a consistent family, purpose, and fallback. A page with six unrelated easings has no motion system, even if every animation is smooth.

## Motion laws

1. One easing family unless the evidence proves a deliberate exception.
2. A small duration set, usually three steps.
3. Motion describes space, hierarchy, or progress. It does not decorate idle elements.
4. Entrances are slower than exits. Hover states are quick.
5. Reveals happen once on entry and do not replay on scroll back.
6. Every primitive degrades to a still composition under reduced motion, save-data, or slow networks.
7. Choreography is reserved for the hero or one signature moment.
8. Scroll-linked effects have a budget. More than two per page is usually too many.
9. Motion never hides critical content or blocks input.
10. Interaction states exist without motion: focus, hover, active, disabled, loading, error.

## What to extract

- easing functions and names;
- durations and delays;
- spring values;
- triggers: load, viewport, hover, focus, click, scroll, drag;
- primitives and their fallbacks;
- choreography and sequencing;
- scroll library and interpolation;
- reduced-motion behaviour;
- calm-mode or save-data behaviour;
- performance cost.

## Token record

```json
{
  "easings": {
    "expo": "cubic-bezier(0.16, 1, 0.3, 1)"
  },
  "durations": {
    "quick": "0.35s",
    "base": "0.7s",
    "slow": "1.1s"
  },
  "springs": {
    "magnetic": { "stiffness": 160, "damping": 14, "mass": 0.4 }
  }
}
```

Exceptions must be named, not hidden:

- hero line reveal: `0.9s`;
- welcome overlay: `0.55s` after a `0.6s` hold;
- Ken Burns: `24s`;
- orbital ring: `22s` linear;
- header colour transition: `300ms`;
- mobile menu stagger: `45ms` per item.

## Primitive inventory

| Primitive | Trigger | Motion | Fallback |
|---|---|---|---|
| Reveal | enters viewport, once | opacity and small y | still |
| RevealText | enters viewport | words rise inside masks | static words |
| ScrollWords | scroll progress | word opacity | full opacity |
| Parallax | scroll | translate and scale | still image |
| MaskedLines | in view, once | lines rise, drift, rotate | plain lines |
| HyperText | hover, focus, touch | glyph scramble resolves | plain label |
| MagneticCta | fine pointer movement | button follows cursor | static button |
| SpinningText | always | ring rotates | static ring |
| DrawPath | scroll progress | SVG path length | full path |
| ScrollProgress | page scroll | scaled bar | hidden or still |
| WelcomeIntro | first visit | curtain lifts, mark fades | skipped |
| PixelImage | load or view | low-res layer resolves | sharp image |
| SmoothScroll | global | interpolation | native smooth scroll |
| SmoothCursor | fine pointer only | custom cursor follows | native cursor |
| Marquee | constant scroll | drift, skew with velocity | static row |
| MenuStagger | dialog open | opacity and rise per item | instant |

For each primitive, record:

- file and line;
- trigger;
- duration and easing;
- what moves;
- what is deliberately still;
- reduced-motion fallback;
- calm-mode fallback;
- performance risk.

## Choreography

A scored sequence is rare. If the site has one, document it:

```text
1. Server paints the dark hero and priority image.
2. Welcome overlay holds for 0.6s, then lifts for 0.55s.
3. Headline begins after the overlay clears.
4. Four lines rise at 0.12s intervals over 0.9s.
5. CTAs and scroll cue are available immediately.
6. On scroll, the utility bar collapses and the header turns solid.
```

Check that the sequencing is coherent. An overlay should clear before the headline competes with it. A scroll cue should not appear before the hero is readable.

## Hover, focus, and active states

Motion is only one part of interaction. Record:

- hover colour, border, background, underline, and cursor;
- focus ring colour, width, offset, and dark-surface variant;
- active/pressed state;
- disabled state;
- loading state;
- touch behaviour;
- keyboard behaviour.

A hover-only excerpt is a finding on touch devices. A focus state that is invisible is an accessibility blocker.

## Reduced motion

Two layers are required:

1. CSS clamps animation and transition durations under `prefers-reduced-motion: reduce`.
2. JavaScript primitives check the same query and return static output.

Record the exact behaviour:

- overlay skipped or shortened;
- marquee stopped;
- cursor removed;
- parallax still;
- video poster only;
- reveal content visible immediately.

Do not merely slow motion down. Remove non-essential motion.

## Calm mode

If the site has a save-data or slow-network mode, record:

- how it detects the condition;
- which primitives are skipped;
- whether video is preloaded;
- whether images are reduced;
- whether the fallback is still branded.

## Performance budget

Record:

- number of scroll listeners;
- number of continuously animating elements;
- video size and deferral;
- image priority;
- below-fold client code;
- cost of custom cursor and scroll progress;
- whether app routes disable the scroll library.

Motion that costs a frame on a low-end Android is not premium.

## Interaction anti-patterns

- Bounce for its own sake.
- Different easing per component.
- Animating layout properties that cause reflow.
- Autoplay video outside a deliberate media chapter.
- Parallax on text.
- A custom cursor that hides the native cursor but lags behind.
- Scroll-jacking that traps the user.
- Reveals that replay on every scroll direction.
- Hover states with no focus equivalent.
- Motion that ignores reduced-motion because "it is only a small fade".
