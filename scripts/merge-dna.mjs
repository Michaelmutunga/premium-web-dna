#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";

const MODES = ["inherit", "blend", "synthesize"];
const FINGERPRINT_FIELDS = [
  "archetype",
  "density",
  "contrast",
  "motion_style",
  "cta_style",
  "card_style",
  "navbar_style",
];

function clone(value) {
  return structuredClone(value);
}

function hashDna(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function round(value, digits = 2) {
  return Number(Number(value).toFixed(digits));
}

function weightOf(value, fallback = 0.5) {
  const confidence = value?.meta?.confidence;
  return typeof confidence === "number" ? confidence : fallback;
}

function avg(a, b, wa, wb) {
  return round((a * wa + b * wb) / (wa + wb), 3);
}

function unique(values) {
  return [...new Set(values.filter((value) => value !== undefined && value !== null && value !== ""))];
}

function addConflict(conflicts, pathName, base, other, resolution) {
  conflicts.push({ path: pathName, base, other, resolution });
}

function dedupeConflicts(conflicts) {
  const seen = new Set();
  const output = [];
  for (const conflict of conflicts) {
    const key = `${conflict.path}\0${JSON.stringify(conflict.base)}\0${JSON.stringify(conflict.other)}\0${JSON.stringify(conflict.resolution)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(conflict);
  }
  return output;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeScalar(base, other, mode, wa, wb, pathName, conflicts, options = {}) {
  if (base === undefined) return clone(other);
  if (other === undefined) return clone(base);
  if (base === other) return clone(base);
  if (mode === "inherit") {
    addConflict(conflicts, pathName, base, other, "base");
    return clone(base);
  }
  if (mode === "synthesize" || options.average === false) {
    const resolution = wa >= wb ? "base" : "other";
    addConflict(conflicts, pathName, base, other, resolution);
    return resolution === "base" ? clone(base) : clone(other);
  }
  if (typeof base === "number" && typeof other === "number") {
    const value = avg(base, other, wa, wb);
    addConflict(conflicts, pathName, base, other, `average:${value}`);
    return value;
  }
  if (typeof base === "string" && typeof other === "string" && /^\d+(?:\.\d+)?(?:px|rem|em|%|ms|s)?$/.test(base) && /^\d+(?:\.\d+)?(?:px|rem|em|%|ms|s)?$/.test(other)) {
    const unit = base.match(/[a-z%]+$/)?.[0] ?? other.match(/[a-z%]+$/)?.[0] ?? "";
    const aNumber = Number.parseFloat(base);
    const bNumber = Number.parseFloat(other);
    const value = `${round(avg(aNumber, bNumber, wa, wb), 2)}${unit}`;
    addConflict(conflicts, pathName, base, other, `average:${value}`);
    return value;
  }
  addConflict(conflicts, pathName, base, other, "base");
  return clone(base);
}

function mergeObject(base, other, mode, wa, wb, pathName, conflicts, options = {}) {
  if (!isPlainObject(base)) return clone(other);
  if (!isPlainObject(other)) return clone(base);
  const output = {};
  for (const key of unique([...Object.keys(base), ...Object.keys(other)])) {
    if (!(key in base)) output[key] = clone(other[key]);
    else if (!(key in other)) output[key] = clone(base[key]);
    else if (isPlainObject(base[key]) && isPlainObject(other[key])) {
      output[key] = mergeObject(base[key], other[key], mode, wa, wb, `${pathName}.${key}`, conflicts, options);
    } else if (Array.isArray(base[key]) && Array.isArray(other[key])) {
      output[key] = unique([...base[key], ...other[key]]);
    } else {
      output[key] = mergeScalar(base[key], other[key], mode, wa, wb, `${pathName}.${key}`, conflicts, options);
    }
  }
  return output;
}

function mergeColors(baseColors = {}, otherColors = {}, mode, wa, wb, conflicts, aliases) {
  const output = {};
  for (const key of unique([...Object.keys(baseColors), ...Object.keys(otherColors)])) {
    const base = baseColors[key];
    const other = otherColors[key];
    if (base === undefined) {
      output[key] = clone(other);
      continue;
    }
    if (other === undefined) {
      output[key] = clone(base);
      continue;
    }
    const baseValue = typeof base === "string" ? base : base.value;
    const otherValue = typeof other === "string" ? other : other.value;
    let value = baseValue;
    if (baseValue !== otherValue) {
      if (mode !== "inherit" && wa < wb) value = otherValue;
      const resolution = value === baseValue ? "base" : "other";
      addConflict(conflicts, `tokens.colors.${key}`, baseValue, otherValue, resolution);
      aliases[`colors.${key}`] = {
        base: baseValue,
        other: otherValue,
        resolution: value,
      };
    }
    if (isPlainObject(base) || isPlainObject(other)) {
      const baseFields = { ...(isPlainObject(base) ? base : {}) };
      const otherFields = { ...(isPlainObject(other) ? other : {}) };
      delete baseFields.value;
      delete otherFields.value;
      const merged = mergeObject(
        baseFields,
        otherFields,
        mode,
        wa,
        wb,
        `tokens.colors.${key}`,
        conflicts,
        { average: false },
      );
      merged.value = value;
      if (base.role || other.role) merged.role = base.role ?? other.role;
      merged.evidence = unique([...(base.evidence ?? []), ...(other.evidence ?? [])]);
      output[key] = merged;
    } else {
      output[key] = value;
    }
  }
  return output;
}

function mergeNamedArray(base = [], other = [], key, mode, wa, wb, pathName, conflicts, options = {}) {
  const output = [];
  const otherByKey = new Map(other.map((entry) => [entry[key], entry]));
  for (const baseEntry of base) {
    const otherEntry = otherByKey.get(baseEntry[key]);
    if (!otherEntry) {
      output.push(clone(baseEntry));
      continue;
    }
    otherByKey.delete(baseEntry[key]);
    const merged = clone(baseEntry);
    for (const field of unique([...Object.keys(baseEntry), ...Object.keys(otherEntry)])) {
      if (field === key) continue;
      if (Array.isArray(baseEntry[field]) && Array.isArray(otherEntry[field])) {
        merged[field] = unique([...baseEntry[field], ...otherEntry[field]]);
      } else if (isPlainObject(baseEntry[field]) && isPlainObject(otherEntry[field])) {
        merged[field] = mergeObject(
          baseEntry[field],
          otherEntry[field],
          mode,
          wa,
          wb,
          `${pathName}.${baseEntry[key]}.${field}`,
          conflicts,
          options,
        );
      } else {
        merged[field] = mergeScalar(
          baseEntry[field],
          otherEntry[field],
          mode,
          wa,
          wb,
          `${pathName}.${baseEntry[key]}.${field}`,
          conflicts,
          options,
        );
      }
    }
    output.push(merged);
  }
  for (const remaining of otherByKey.values()) output.push(clone(remaining));
  return output;
}

function mergeFingerprint(base, other, archetype, mode, wa, wb, conflicts) {
  const output = {};
  for (const field of FINGERPRINT_FIELDS) {
    if (field === "archetype") {
      output.archetype = archetype;
      continue;
    }
    const a = base?.[field];
    const b = other?.[field];
    if (a === undefined) output[field] = b;
    else if (b === undefined) output[field] = a;
    else if (a === b) output[field] = a;
    else if (mode === "inherit") {
      output[field] = a;
      addConflict(conflicts, `fingerprint.${field}`, a, b, "base");
    } else {
      const resolution = wa >= wb ? a : b;
      output[field] = resolution;
      addConflict(conflicts, `fingerprint.${field}`, a, b, `weighted:${resolution}`);
    }
  }
  return output;
}

function mergeArchetype(base, other, mode, wa, wb, conflicts) {
  const fallback = base ?? other;
  if (!base || !other) {
    const fingerprint = fallback?.primary
      ? fallback.secondary
        ? `${fallback.primary}-${fallback.secondary}`
        : fallback.primary
      : "Minimal";
    return {
      archetype: clone(fallback ?? { primary: "Minimal", evidence: [] }),
      fingerprint,
    };
  }
  if (base.primary === other.primary) {
    const secondary =
      mode === "synthesize"
        ? other.secondary ?? base.secondary
        : base.secondary ?? other.secondary;
    if (base.secondary && other.secondary && base.secondary !== other.secondary) {
      addConflict(
        conflicts,
        "archetype.secondary",
        base.secondary,
        other.secondary,
        mode === "synthesize" ? "other" : "base",
      );
    }
    return {
      archetype: {
        ...clone(base),
        secondary,
        tertiary: base.tertiary ?? other.tertiary,
        confidence: round(Math.min(1, (wa + wb) / 2), 2),
        evidence: unique([...(base.evidence ?? []), ...(other.evidence ?? [])]),
      },
      fingerprint: secondary ? `${base.primary}-${secondary}` : base.primary,
    };
  }
  const primary = mode === "inherit" ? base.primary : wa >= wb ? base.primary : other.primary;
  const secondaryCandidate =
    mode === "inherit"
      ? base.secondary
      : other.primary !== primary
        ? other.primary
        : other.secondary;
  const secondary = secondaryCandidate !== primary ? secondaryCandidate : base.secondary;
  addConflict(conflicts, "archetype.primary", base.primary, other.primary, `primary:${primary}`);
  return {
    archetype: {
      primary,
      secondary: secondary ?? base.secondary ?? other.secondary,
      tertiary: base.tertiary ?? other.tertiary,
      confidence: round(Math.min(1, (wa + wb) / 2), 2),
      evidence: unique([...(base.evidence ?? []), ...(other.evidence ?? [])]),
    },
    fingerprint: secondary ? `${primary}-${secondary}` : primary,
  };
}

function mergeComponents(base = [], other = [], mode, wa, wb, conflicts) {
  const remaining = new Map(other.map((component) => [component.id, component]));
  const output = [];

  for (const baseComponent of base) {
    let otherComponent = remaining.get(baseComponent.id);
    if (!otherComponent) {
      otherComponent = [...remaining.values()].find(
        (candidate) =>
          candidate.component === baseComponent.component && candidate.variant === baseComponent.variant,
      );
    }
    if (!otherComponent) {
      output.push(clone(baseComponent));
      continue;
    }
    remaining.delete(otherComponent.id);

    const merged = clone(baseComponent);
    if (otherComponent.id !== baseComponent.id) {
      merged.aliases = unique([...(merged.aliases ?? []), otherComponent.id]);
      addConflict(conflicts, `components.${baseComponent.id}.id`, baseComponent.id, otherComponent.id, "base");
    }
    merged.confidence = round(
      Math.min(0.99, 1 - (1 - (baseComponent.confidence ?? 0)) * (1 - (otherComponent.confidence ?? 0))),
      2,
    );
    merged.evidence = unique([...(baseComponent.evidence ?? []), ...(otherComponent.evidence ?? [])]);
    for (const field of ["anatomy", "states", "tokens"]) {
      merged[field] = unique([...(baseComponent[field] ?? []), ...(otherComponent[field] ?? [])]);
    }
    for (const field of ["responsive", "accessibility", "motion"]) {
      if (baseComponent[field] === otherComponent[field]) continue;
      merged[field] = mergeScalar(
        baseComponent[field],
        otherComponent[field],
        mode,
        wa,
        wb,
        `components.${baseComponent.id}.${field}`,
        conflicts,
      );
    }
    output.push(merged);
  }

  for (const remainingComponent of remaining.values()) output.push(clone(remainingComponent));
  return output;
}

function mergeScores(base, other, mode, wa, wb, conflicts) {
  const output = clone(base);
  output.categories ??= {};
  const baseCategories = base?.categories ?? {};
  const otherCategories = other?.categories ?? {};
  let total = 0;
  for (const key of unique([...Object.keys(baseCategories), ...Object.keys(otherCategories)])) {
    const a = baseCategories[key];
    const b = otherCategories[key];
    if (!a) {
      output.categories[key] = clone(b);
      total += b.score ?? 0;
      continue;
    }
    if (!b) {
      output.categories[key] = clone(a);
      total += a.score ?? 0;
      continue;
    }
    let score = a.score;
    if (mode !== "inherit" && typeof a.score === "number" && typeof b.score === "number") {
      score = Math.round(avg(a.score, b.score, wa, wb));
    } else if (a.score !== b.score) {
      addConflict(conflicts, `scores.categories.${key}.score`, a.score, b.score, "base");
    }
    const category = { ...clone(a), ...clone(b), score, max: a.max ?? b.max };
    output.categories[key] = category;
    total += score ?? 0;
  }
  total = Math.round(total);
  output.total = total;
  output.band =
    total >= 90
      ? "Exceptional"
      : total >= 80
        ? "Premium"
        : total >= 70
          ? "Professional"
          : total >= 60
            ? "Functional"
            : "Weak";
  output.weights = {
    base: wa,
    other: wb,
    density: "confidence-weighted",
  };
  return output;
}

function mergeRules(base = {}, other = {}, mode, wa, wb, conflicts) {
  const output = {};
  for (const key of unique([...Object.keys(base), ...Object.keys(other)])) {
    const a = base[key];
    const b = other[key];
    if (Array.isArray(a) && Array.isArray(b)) output[key] = unique([...a, ...b]);
    else if (isPlainObject(a) && isPlainObject(b)) {
      output[key] = mergeObject(a, b, mode, wa, wb, `rules.${key}`, conflicts);
    } else {
      output[key] = mergeScalar(a, b, mode, wa, wb, `rules.${key}`, conflicts);
    }
  }
  const fontFamilies = [base.max_font_families, other.max_font_families].filter(Number.isInteger);
  output.max_font_families = fontFamilies.length
    ? Math.min(...fontFamilies)
    : output.max_font_families ?? 2;
  const accentBudgets = [base.accent_budget_per_viewport, other.accent_budget_per_viewport].filter(Number.isInteger);
  output.accent_budget_per_viewport = accentBudgets.length
    ? Math.min(...accentBudgets)
    : output.accent_budget_per_viewport ?? 5;
  return output;
}

function parentRecord(meta, sha256) {
  return {
    slug: meta?.slug,
    name: meta?.name,
    version: meta?.version,
    source: meta?.source,
    confidence: meta?.confidence,
    sha256,
  };
}

function dedupeByHash(records) {
  const seen = new Set();
  const output = [];
  for (const record of records) {
    if (!record) continue;
    const key = record.sha256 ?? `${record.slug ?? "unknown"}@${record.version ?? "0"}`;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(record);
  }
  return output;
}

function inputRecords(role, dna, meta, hash) {
  if (Array.isArray(dna?.merge_report?.inputs) && dna.merge_report.inputs.length) {
    return dna.merge_report.inputs;
  }
  if (Array.isArray(dna?.provenance?.parents) && dna.provenance.parents.length) {
    return dna.provenance.parents.map((parent) => ({
      role,
      slug: parent.slug,
      sha256: parent.sha256,
    }));
  }
  return [{ role, slug: meta?.slug, sha256: hash }];
}

function mergeProvenance(base = {}, other = {}, mode, baseMeta, otherMeta, conflicts, hashes = {}) {
  const baseParents = base.parents?.length ? base.parents : [parentRecord(baseMeta, hashes.base)];
  const otherParents = other.parents?.length ? other.parents : [parentRecord(otherMeta, hashes.other)];
  return {
    source: [...new Set([baseMeta?.source, otherMeta?.source].filter(Boolean))].join(" + ") || "unknown",
    licence: unique([base.licence, other.licence]).join(" / "),
    evidence_count: (base.evidence_count ?? 0) + (other.evidence_count ?? 0),
    restrictions: unique([...(base.restrictions ?? []), ...(other.restrictions ?? [])]),
    notes: `${base.notes ?? ""}\nMerged with mode "${mode}". ${conflicts.length} conflict(s) recorded in merge_report.`.trim(),
    parents: dedupeByHash([...baseParents, ...otherParents]),
    merged_at: new Date().toISOString().slice(0, 10),
  };
}

export function mergeDna(baseInput, otherInput, options = {}) {
  if (!baseInput || !otherInput) throw new Error("Both DNA inputs are required");
  const mode = options.mode ?? "blend";
  if (!MODES.includes(mode)) throw new Error(`mode must be one of: ${MODES.join(", ")}`);
  const baseHash = hashDna(baseInput);
  const otherHash = hashDna(otherInput);
  const base = clone(baseInput);
  const other = clone(otherInput);
  const wa = options.baseWeight ?? weightOf(base);
  const wb = options.otherWeight ?? weightOf(other);
  if (wa <= 0 && wb <= 0) throw new Error("At least one weight must be positive");
  const conflicts = [];
  const inheritedConflicts = [
    ...(base.merge_report?.conflicts ?? []),
    ...(other.merge_report?.conflicts ?? []),
  ];
  const source = [...new Set([base.meta?.source, other.meta?.source].filter(Boolean))].join(" + ");

  const merged = {
    schema_version: base.schema_version ?? other.schema_version ?? "1.0",
    framework: base.framework ?? other.framework ?? "DNA Audit Framework v1",
    framework_version: base.framework_version ?? other.framework_version ?? "1.0.0",
    meta: {
      ...clone(base.meta ?? {}),
      ...clone(other.meta ?? {}),
      name: options.name ?? `${base.meta?.name ?? "Base"} + ${other.meta?.name ?? "Other"}`,
      slug:
        options.slug ??
        `merged-${base.meta?.slug ?? "base"}-${other.meta?.slug ?? "other"}`.replace(/[^a-z0-9-]/g, "-"),
      version: options.version ?? "1.0.0",
      audited_at: options.auditedAt ?? new Date().toISOString().slice(0, 10),
      confidence: round(Math.min(1, (wa + wb) / 2), 2),
      source,
      licence: unique([base.meta?.licence, other.meta?.licence]).join(" / "),
      restrictions: unique([
        ...(base.meta?.restrictions ?? []),
        ...(other.meta?.restrictions ?? []),
      ]),
    },
    fingerprint: {},
    archetype: {},
    tokens: {},
    components: [],
    pages: [],
    rules: {},
    scores: {},
    provenance: {},
    merge_report: {
      mode,
      base: base.meta?.slug,
      other: other.meta?.slug,
      inputs: dedupeByHash([
        ...inputRecords("base", base, base.meta, baseHash),
        ...inputRecords("other", other, other.meta, otherHash),
      ]),
      weights: { base: wa, other: wb },
      conflicts,
      conflict_count: conflicts.length,
    },
  };

  const archetype = mergeArchetype(base.archetype, other.archetype, mode, wa, wb, conflicts);
  merged.archetype = archetype.archetype;
  merged.fingerprint = mergeFingerprint(
    base.fingerprint,
    other.fingerprint,
    archetype.fingerprint,
    mode,
    wa,
    wb,
    conflicts,
  );

  const baseTokens = base.tokens ?? {};
  const otherTokens = other.tokens ?? {};
  const aliases = {};
  const baseTokenFields = clone(baseTokens);
  const otherTokenFields = clone(otherTokens);
  const baseTypographyFields = { ...(baseTokenFields.typography ?? {}) };
  const otherTypographyFields = { ...(otherTokenFields.typography ?? {}) };
  delete baseTokenFields.colors;
  delete otherTokenFields.colors;
  delete baseTokenFields.typography;
  delete otherTokenFields.typography;
  delete baseTokenFields.aliases;
  delete otherTokenFields.aliases;
  delete baseTypographyFields.families;
  delete otherTypographyFields.families;
  delete baseTypographyFields.scale;
  delete otherTypographyFields.scale;
  merged.tokens = mergeObject(baseTokenFields, otherTokenFields, mode, wa, wb, "tokens", conflicts, {
    average: false,
  });
  merged.tokens.colors = mergeColors(baseTokens.colors, otherTokens.colors, mode, wa, wb, conflicts, aliases);
  merged.tokens.typography = mergeObject(
    baseTypographyFields,
    otherTypographyFields,
    mode,
    wa,
    wb,
    "tokens.typography",
    conflicts,
    { average: false },
  );
  merged.tokens.typography.families = mergeNamedArray(
    baseTokens.typography?.families ?? [],
    otherTokens.typography?.families ?? [],
    "name",
    mode,
    wa,
    wb,
    "tokens.typography.families",
    conflicts,
    { average: false },
  );
  merged.tokens.typography.scale = mergeNamedArray(
    baseTokens.typography?.scale ?? [],
    otherTokens.typography?.scale ?? [],
    "name",
    mode,
    wa,
    wb,
    "tokens.typography.scale",
    conflicts,
    { average: false },
  );
  for (const conflict of conflicts) {
    if (!conflict.path.startsWith("tokens.") || conflict.path.startsWith("tokens.colors.")) continue;
    const key = conflict.path.slice("tokens.".length);
    aliases[key] ??= {
      base: conflict.base,
      other: conflict.other,
      resolution: conflict.resolution,
    };
  }
  merged.tokens.aliases = {
    ...(baseTokens.aliases ?? {}),
    ...(otherTokens.aliases ?? {}),
    ...aliases,
  };

  merged.components = mergeComponents(base.components ?? [], other.components ?? [], mode, wa, wb, conflicts);

  merged.pages = mergeNamedArray(base.pages ?? [], other.pages ?? [], "type", mode, wa, wb, "pages", conflicts);
  for (const page of merged.pages) {
    page.sections = unique(page.sections ?? []);
    page.rules = unique(page.rules ?? []);
  }

  merged.rules = mergeRules(base.rules, other.rules, mode, wa, wb, conflicts);
  merged.scores = mergeScores(base.scores, other.scores, mode, wa, wb, conflicts);
  const uniqueConflicts = dedupeConflicts([...inheritedConflicts, ...conflicts]);
  merged.provenance = mergeProvenance(
    base.provenance,
    other.provenance,
    mode,
    base.meta,
    other.meta,
    uniqueConflicts,
    { base: baseHash, other: otherHash },
  );
  merged.merge_report.conflict_count = uniqueConflicts.length;
  merged.merge_report.conflicts = uniqueConflicts;

  return merged;
}

function parseArgs(argv) {
  const options = { others: [], force: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--base") options.base = argv[++index];
    else if (arg === "--other" || arg === "--overlay") options.others.push(argv[++index]);
    else if (arg === "--mode") options.mode = argv[++index];
    else if (arg === "--out") options.out = argv[++index];
    else if (arg === "--name") options.name = argv[++index];
    else if (arg === "--slug") options.slug = argv[++index];
    else if (arg === "--version") options.version = argv[++index];
    else if (arg === "--base-weight") options.baseWeight = Number(argv[++index]);
    else if (arg === "--other-weight") options.otherWeight = Number(argv[++index]);
    else if (arg === "--force") options.force = true;
    else if (arg === "--json") options.json = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help || !options.base || options.others.length === 0 || !options.out) {
    console.log("Usage: node scripts/merge-dna.mjs --base <dna.json> --other <dna.json> [--other <dna.json>...] --mode <inherit|blend|synthesize> --out <merged.json> [--name <name>] [--slug <slug>] [--version <semver>] [--base-weight <n>] [--other-weight <n>] [--force] [--json]");
    if (!options.help) process.exitCode = 1;
    return;
  }
  if (options.mode && !MODES.includes(options.mode)) {
    throw new Error(`mode must be one of: ${MODES.join(", ")}`);
  }
  const base = JSON.parse(await readFile(options.base, "utf8"));
  const others = [];
  for (const otherPath of options.others) {
    others.push(JSON.parse(await readFile(otherPath, "utf8")));
  }
  const names = [...new Set([base.meta?.name, ...others.map((dna) => dna.meta?.name)].filter(Boolean))];
  const slugs = [...new Set([base.meta?.slug, ...others.map((dna) => dna.meta?.slug)].filter(Boolean))];
  const defaultName = names.join(" + ") || "Premium Web DNA";
  const defaultSlug = `merged-${slugs.join("-") || "dna"}`.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  let merged = base;
  for (const other of others) {
    merged = mergeDna(merged, other, {
      mode: options.mode ?? "blend",
      name: options.name ?? defaultName,
      slug: options.slug ?? defaultSlug,
      version: options.version,
      baseWeight: options.baseWeight,
      otherWeight: options.otherWeight,
    });
  }
  const outPath = path.resolve(options.out);
  if (!options.force) {
    try {
      await readFile(outPath);
      throw new Error(`Output already exists: ${outPath}. Use --force to overwrite.`);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  await writeFile(outPath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  if (options.json) {
    console.log(JSON.stringify(merged, null, 2));
  } else {
    console.log(`Merged ${options.others.length + 1} DNA package(s) with mode "${merged.merge_report.mode}".`);
    console.log(`Output: ${outPath}`);
    console.log(`Conflicts: ${merged.merge_report.conflict_count}`);
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  main().catch((error) => {
    console.error(`merge-dna: ${error.message}`);
    process.exitCode = 1;
  });
}
