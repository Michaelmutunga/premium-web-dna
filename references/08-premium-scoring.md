# Premium Scoring

The score is a comparison tool, not a taste verdict. It must be reproducible from the audit evidence.

## The 100-point model

| Category | Points | What it measures |
|---|---|---|
| Visual System | 20 | Coherence, hierarchy, composition, distinctiveness |
| UX Architecture | 15 | Navigation, information architecture, flows, states, responsive behaviour |
| Typography | 10 | Scale, pairing, measure, tracking, hierarchy, loading |
| Spacing | 10 | Rhythm, density, alignment, consistency |
| Brand Distinction | 10 | Recognisability, ownable choices, absence of generic patterns |
| Trust Signals | 10 | Honest proof, contact, pricing, availability, credits |
| Motion | 10 | Purpose, consistency, choreography, fallbacks, performance |
| Accessibility | 5 | WCAG 2.2 AA, keyboard, focus, semantics, reduced motion |
| Performance | 5 | LCP, weight, client code, animation cost |
| Content Quality | 5 | Voice, specificity, clarity, honesty |
| **Total** | **100** | |

## Bands

| Score | Band | Meaning |
|---|---|---|
| 90-100 | Exceptional | Distinctive, coherent, and production-ready |
| 80-89 | Premium | Strong system with minor gaps |
| 70-79 | Professional | Competent but not distinctive |
| 60-69 | Functional | Works, with visible system debt |
| `<60` | Weak | Inconsistent, generic, or unsafe |

## Scoring procedure

1. Read the whole audit before assigning any score.
2. Score each category against its rubric.
3. Write one evidence-backed note per deduction.
4. Sum the categories.
5. Assign the band.
6. List P0 blockers separately.
7. Record the framework version.

Do not start from a target score. Do not adjust a category to reach a band.

## Rubric details

### Visual System (20)

- `18-20`: A clear visual idea, consistently applied, with a memorable signature.
- `15-17`: Coherent and well composed, with one or two weak sections.
- `12-14`: Competent, but relies on familiar patterns.
- `8-11`: Inconsistent hierarchy or surface logic.
- `0-7`: Visually unresolved or generic.

Check: hierarchy, composition, surface rhythm, shape language, depth language, accent discipline, photography.

### UX Architecture (15)

- `13-15`: Clear navigation, complete states, strong responsive recomposition.
- `11-12`: Good flows with minor friction.
- `8-10`: Functional, with gaps in states or navigation.
- `5-7`: Confusing structure or missing flows.
- `0-4`: Unusable.

Check: nav model, IA, commitment ladder, forms, empty/error states, mobile.

### Typography (10)

- `9-10`: Distinctive, disciplined, readable, responsive.
- `7-8`: Strong with minor scale or measure issues.
- `5-6`: Functional but generic.
- `3-4`: Inconsistent or hard to read.
- `0-2`: Broken hierarchy.

### Spacing (10)

- `9-10`: Consistent rhythm, deliberate density, aligned.
- `7-8`: Mostly consistent.
- `5-6`: Uneven or ad hoc.
- `3-4`: Cramped or incoherent.
- `0-2`: No rhythm.

### Brand Distinction (10)

- `9-10`: Ownable, recognisable without the logo.
- `7-8`: Distinct in places.
- `5-6`: Competent but interchangeable.
- `3-4`: Generic template.
- `0-2`: No identity.

Check: archetype expression, signature moves, anti-signatures, accent discipline.

### Trust Signals (10)

- `9-10`: Real proof, honest pricing, clear contact, resolved credits.
- `7-8`: Good proof with minor gaps.
- `5-6`: Basic trust, some vague claims.
- `3-4`: Missing proof or unresolved placeholders.
- `0-2`: Misleading or absent.

### Motion (10)

- `9-10`: One purposeful family, choreographed where it matters, complete fallbacks.
- `7-8`: Consistent with minor drift.
- `5-6`: Decorative or inconsistent.
- `3-4`: Excess or missing fallbacks.
- `0-2`: Motion harms usability.

### Accessibility (5)

- `5`: No known AA failures; strong keyboard and focus.
- `4`: Minor issues.
- `3`: Material issues but core flow usable.
- `2`: Several blockers.
- `0-1`: Core flow inaccessible.

A P0 accessibility blocker means the site cannot be called launch-ready regardless of the numeric score.

### Performance (5)

- `5`: Fast, light, well deferred.
- `4`: Minor weight issues.
- `3`: Noticeable cost.
- `2`: Heavy assets or client code.
- `0-1`: Unusable on mobile networks.

### Content Quality (5)

- `5`: Specific, honest, well-paced.
- `4`: Good with minor filler.
- `3`: Functional.
- `2`: Generic or vague.
- `0-1`: Misleading or broken.

## Scorecard format

```markdown
| Category | Max | Score | Evidence / deduction |
|---|---:|---:|---|
| Visual System | 20 | 18 | ... |
| UX Architecture | 15 | 13 | ... |
| Typography | 10 | 9 | ... |
| Spacing | 10 | 9 | ... |
| Brand Distinction | 10 | 9 | ... |
| Trust Signals | 10 | 9 | ... |
| Motion | 10 | 8 | ... |
| Accessibility | 5 | 4 | ... |
| Performance | 5 | 4 | ... |
| Content Quality | 5 | 5 | ... |
| **Total** | **100** | **88** | **Premium** |
```

## Comparability rules

- Same categories, same weights, same bands.
- Same framework version in every scorecard.
- No bonus points.
- No hidden penalties inside categories; P0 blockers are separate.
- If a category cannot be assessed, score it conservatively and say why.
- If the source is incomplete, record `confidence` separately from the score.

## Premium perception formula

A useful qualitative cross-check:

```text
premium = (photographic scale x typographic discipline x material contrast x motion control)
          / (visual noise + rounded containers + gradient effects + colour count)
```

This is not part of the 100 points. It explains why a restrained system can outrank a busy one.

## Anti-patterns

- Starting at 85 and adjusting.
- Giving a high accessibility score while listing P0 failures.
- Scoring a category without evidence.
- Changing weights between audits.
- Treating "premium" as "expensive-looking" rather than coherent and trustworthy.
