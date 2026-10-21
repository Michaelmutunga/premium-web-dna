# DNA Merge Engine

The merge engine combines two or more client design systems into a new, versioned DNA package without overwriting the sources.

## Why merge

A personal design-intelligence library becomes more useful when it can answer:

- What do our best clients share?
- What is the house style across Explorer and Hospitality brands?
- Which components are corroborated across three projects?
- What should a new page inherit when no client DNA applies?

The merge engine is not an average of everything. It is a governed composition with provenance.

## Command

```bash
node scripts/merge-dna.mjs \
  --base examples/african-bison/design-dna.json \
  --other examples/queensland-nuts/design-dna.json \
  --mode blend \
  --name "Premium Web DNA" \
  --slug premium-web-dna \
  --version 2.0.0 \
  --out generated/premium-web-dna-v2.json
```

`--other` can be repeated. `--overlay` is an alias for `--other`. Use `--force` to replace an existing output file.

## Modes

### inherit

Base wins every conflict. Overlays fill missing fields only. Use when one source is the canonical house style.

### blend

Weighted by each input's `meta.confidence`, or by `--base-weight` and `--other-weight`. On a tie, the base wins. Use when peers contribute equally.

### synthesize

The same weighted selection, but the merged archetype may take its secondary from the overlay. Use when creating a new house system from several sources.

## Inputs

Each input must be a valid `design-dna.json` with:

- `meta.name`, `meta.slug`, `meta.version`, `meta.confidence`;
- `archetype`;
- `fingerprint`;
- `tokens`;
- `surfaces`;
- `components` with confidence and evidence;
- `pages`;
- `rules`;
- `accessibility`;
- `scores`;
- `provenance` with `status`.

The engine records a SHA-256 hash of each input in `merge_report.inputs` and in `provenance.parents`.

## Merge algorithm

### Metadata

- `name`, `slug`, and `version` come from CLI options or defaults.
- `audited_at` becomes the merge date.
- `source` lists the contributors.
- `confidence` is the mean of the input weights, capped at `1.0`.
- `licence` is the union of the input licences.
- Restrictions are unioned.

### Archetype

- `inherit`: base primary, secondary, and tertiary.
- `blend`: the higher-weight primary wins; the next distinct base archetype becomes secondary.
- `synthesize`: the higher-weight primary wins; the overlay secondary may replace the base secondary, with the conflict recorded.
- Evidence is unioned.
- A conflict is never silently discarded.

### Fingerprint

Merge field by field:

- `inherit`: base value.
- `blend` / `synthesize`: higher-weight value; ties go to the base.
- The final `fingerprint.archetype` is rebuilt from the merged archetype as `Primary` or `Primary-Secondary`.
- Merged fingerprint values stay inside the controlled vocabulary in `14-design-fingerprint.md`.

### Tokens

Deep merge:

- missing keys are added;
- identical values are kept once;
- arrays are unioned;
- objects are merged recursively;
- conflicting values are never averaged;
- the chosen value follows the mode and weights;
- both values and the resolution are recorded in `tokens.aliases`.

A colour is a discrete decision. It is not mixed.

### Surfaces

Match by `name`. Keep the base order, then append overlay-only surfaces. Merge `token`, `text_token`, and `role` by mode and weight, and record conflicts.

### Components

Match by `id`, then by `component + variant`.

For a match:

- union `evidence`;
- union `states`, `tokens`, and `anatomy`;
- combine confidence with corroboration:

```text
combined = 1 - (1 - c1) * (1 - c2)
```

- cap at `0.99`;
- keep the base `id` and record the overlay id under `aliases` if they differ;
- choose conflicting `responsive`, `accessibility`, and `motion` values by mode and weight, and record the conflict.

Components only in an overlay are added with their original confidence and evidence.

### Pages

Match by `type`. Union sections in base order, then append new overlay sections. Union rules. Record conflicts.

### Accessibility

- Union issues by `id`; keep the higher-severity record when the same issue appears twice.
- Union contrast pairs by foreground, background, and context.
- Keep the stricter WCAG level across inputs.

### Rules

- `do` and `dont` arrays are unioned.
- `max_font_families` and `accent_budget_per_viewport` keep the stricter, lower value.
- Hero rules merge recursively.
- Other scalar conflicts follow the mode and weights.

### Scores

- average each category's score across sources, weighted by input confidence, and round to the nearest integer;
- recompute the integer total;
- derive the band from `90 / 80 / 70 / 60`;
- record the merge weights in `scores.weights`.

A merged score is a new assessment, not an average of truth. It is never presented as a client audit score.

## Output

The command writes a single merged DNA file, for example `generated/premium-web-dna-v2.json`.

It contains:

- the merged `design-dna.json` structure, including `surfaces` and `accessibility`;
- `tokens.aliases` for token conflicts;
- `merge_report` with mode, inputs, hashes, weights, and conflicts;
- `provenance.parents` with source metadata and hashes;
- `provenance.status` set to `blocked` when either input was blocked or blockers remain, otherwise `audit-complete`;
- `provenance.publication_blockers` unioned from both inputs;
- `provenance.evidence_count` recomputed from the merged structure.

Generate a skill from it when the merged DNA is ready:

```bash
node scripts/scaffold-dna-skill.mjs \
  --slug premium-web-dna \
  --name "Premium Web DNA" \
  --dna generated/premium-web-dna-v2.json \
  --out generated/premium-web-dna-v2
```

## Merge report

The embedded `merge_report` includes:

- contributors, roles, and SHA-256 hashes;
- mode and weights;
- every conflict with its path, base value, overlay value, and resolution;
- a conflict count.

The source files still hold their original scores and evidence. The merged output records a new total and band.

## Validation

The merged DNA is not a skill until it is scaffolded. Validate the generated package:

```bash
node scripts/validate-dna-skill.mjs generated/premium-web-dna-v2
```

A merge is not complete if the AI layer disagrees with the DNA.

## Safety rules

- Never mutate an input file.
- Never overwrite an output file without `--force`.
- Never merge assets, only principles and measurements.
- Never drop a conflict without recording it.
- Never average a colour or a fingerprint label.
- Never raise confidence without additional evidence.
- Never present a merged score as a client audit score.

## Anti-patterns

- Averaging colours.
- Letting the newest input silently win.
- Combining archetypes into a meaningless list.
- Merging two systems with incompatible licences without review.
- Treating a merged skill as if it were audited from a real site.
