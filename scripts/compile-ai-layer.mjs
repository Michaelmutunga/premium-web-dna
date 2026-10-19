#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";
import { pathToFileURL } from "node:url";

const FINGERPRINT_FIELDS = [
  "archetype",
  "density",
  "contrast",
  "motion_style",
  "cta_style",
  "card_style",
  "navbar_style",
];

function firstEasing(motion) {
  const easings = motion?.easings ?? {};
  if (typeof easings === "object" && !Array.isArray(easings)) {
    const first = Object.values(easings)[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object" && typeof first.value === "string") return first.value;
  }
  if (Array.isArray(easings) && easings.length > 0) {
    const first = easings[0];
    if (typeof first === "string") return first;
    if (first?.value) return first.value;
  }
  return "ease";
}

function normaliseFingerprint(value) {
  if (!value || typeof value !== "object") {
    throw new Error("design-dna.json is missing a fingerprint object");
  }
  for (const field of FINGERPRINT_FIELDS) {
    if (typeof value[field] !== "string" || value[field].length === 0) {
      throw new Error(`fingerprint.${field} must be a non-empty string`);
    }
  }
  return Object.fromEntries(FINGERPRINT_FIELDS.map((field) => [field, value[field]]));
}

function normaliseColors(colors = {}) {
  if (!colors || typeof colors !== "object" || Array.isArray(colors)) return {};
  return Object.fromEntries(
    Object.entries(colors).map(([name, value]) => {
      if (typeof value === "string") return [name, { value }];
      if (value && typeof value === "object") {
        return [
          name,
          {
            value: value.value ?? value.hex ?? "",
            ...(value.role ? { role: value.role } : {}),
          },
        ];
      }
      return [name, { value: String(value) }];
    }),
  );
}

function normaliseTypography(typography = {}) {
  const families = Array.isArray(typography.families) ? typography.families : [];
  const scale = Array.isArray(typography.scale) ? typography.scale : [];
  return {
    families: families.map((family) => ({
      name: family.name ?? family.family ?? "Unknown",
      ...(family.variable ? { variable: family.variable } : {}),
      ...(family.role ? { role: family.role } : {}),
    })),
    scale: scale.map((step) => ({
      name: step.name ?? step.utility ?? "unnamed",
      ...(step.size ? { size: step.size } : {}),
      ...(step.line_height ? { line_height: step.line_height } : {}),
      ...(step.tracking ? { tracking: step.tracking } : {}),
      ...(step.weight ? { weight: step.weight } : {}),
      ...(step.use ? { use: step.use } : {}),
    })),
  };
}

function deriveHero(dna) {
  if (dna.rules?.hero) return dna.rules.hero;
  const hero = (dna.components ?? []).find((component) => /hero/i.test(component.component ?? ""));
  return {
    preferred_variant: hero?.variant ?? "editorial",
    headline_length: "8-16 words",
    cta_count: 2,
  };
}

export function buildAiLayer(dna) {
  if (!dna || typeof dna !== "object") throw new Error("DNA must be an object");
  if (!dna.meta?.name || !dna.meta?.slug) throw new Error("DNA meta.name and meta.slug are required");
  const fingerprint = normaliseFingerprint(dna.fingerprint);
  const rules = dna.rules ?? {};
  const tokens = dna.tokens ?? {};
  const maxFamilies =
    Number.isInteger(rules.max_font_families) && rules.max_font_families > 0
      ? rules.max_font_families
      : Math.max(1, tokens.typography?.families?.length ?? 2);

  return {
    schema_version: "1.0",
    framework: dna.framework ?? "DNA Audit Framework v1",
    framework_version: dna.framework_version ?? "1.0.0",
    source: {
      name: dna.meta.name,
      slug: dna.meta.slug,
      version: dna.meta.version ?? "1.0.0",
    },
    archetype: fingerprint.archetype,
    fingerprint,
    global: {
      max_font_families: maxFamilies,
      accent_budget_per_viewport:
        Number.isInteger(rules.accent_budget_per_viewport) && rules.accent_budget_per_viewport >= 0
          ? rules.accent_budget_per_viewport
          : 5,
      corner_radius: rules.corner_radius ?? tokens.radii?.default ?? "0",
      motion_easing: rules.motion_easing ?? firstEasing(tokens.motion),
      forbidden: Array.isArray(rules.dont) ? [...rules.dont] : [],
    },
    tokens: {
      colors: normaliseColors(tokens.colors),
      typography: normaliseTypography(tokens.typography),
      spacing: tokens.spacing ?? {},
      radii: tokens.radii ?? {},
      borders: tokens.borders ?? {},
      motion: tokens.motion ?? {},
    },
    hero: deriveHero(dna),
    components: (dna.components ?? []).map((component) => ({
      id: component.id,
      component: component.component,
      variant: component.variant,
      confidence: component.confidence,
    })),
    pages: dna.pages ?? [],
    rules: {
      do: Array.isArray(rules.do) ? [...rules.do] : [],
      dont: Array.isArray(rules.dont) ? [...rules.dont] : [],
    },
  };
}

export function buildFingerprints(dna) {
  const fingerprint = normaliseFingerprint(dna.fingerprint);
  const map = { [fingerprint.archetype]: fingerprint };

  if (dna.fingerprints && typeof dna.fingerprints === "object" && !Array.isArray(dna.fingerprints)) {
    for (const [name, value] of Object.entries(dna.fingerprints)) {
      if (!value || typeof value !== "object") continue;
      map[name] = { ...fingerprint, ...value, archetype: value.archetype ?? fingerprint.archetype };
    }
  }

  return {
    schema_version: "1.0",
    framework: dna.framework ?? "DNA Audit Framework v1",
    framework_version: dna.framework_version ?? "1.0.0",
    default: fingerprint.archetype,
    fingerprints: map,
  };
}

function parseArgs(argv) {
  const options = { out: "." };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dna") options.dna = argv[++index];
    else if (arg === "--out") options.out = argv[++index];
    else if (arg === "--check") options.check = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help || !options.dna) {
    console.log(`Usage: node scripts/compile-ai-layer.mjs --dna design-dna.json --out <skill-dir> [--check]`);
    if (!options.dna && !options.help) process.exitCode = 1;
    return;
  }
  const dna = await readJson(options.dna);
  const aiRules = buildAiLayer(dna);
  const fingerprints = buildFingerprints(dna);
  const outDir = path.resolve(options.out);
  const aiPath = path.join(outDir, "ai-rules.json");
  const fingerprintsPath = path.join(outDir, "fingerprints.json");

  if (options.check) {
    const currentRules = await readJson(aiPath);
    const currentFingerprints = await readJson(fingerprintsPath);
    const rulesMatch = isDeepStrictEqual(currentRules, aiRules);
    const fingerprintsMatch = isDeepStrictEqual(currentFingerprints, fingerprints);
    if (!rulesMatch) console.error("ai-rules.json is out of date; recompile.");
    if (!fingerprintsMatch) console.error("fingerprints.json is out of date; recompile.");
    if (!rulesMatch || !fingerprintsMatch) process.exitCode = 1;
    else console.log("AI layer matches design-dna.json.");
    return;
  }

  await mkdir(outDir, { recursive: true });
  await writeFile(aiPath, `${JSON.stringify(aiRules, null, 2)}\n`, "utf8");
  await writeFile(fingerprintsPath, `${JSON.stringify(fingerprints, null, 2)}\n`, "utf8");
  console.log(`Wrote ${aiPath}`);
  console.log(`Wrote ${fingerprintsPath}`);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  main().catch((error) => {
    console.error(`compile-ai-layer: ${error.message}`);
    process.exitCode = 1;
  });
}
