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
  return undefined;
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
  if (!colors || typeof colors !== "object" || Array.isArray(colors)) {
    throw new Error("tokens.colors must be an object");
  }
  return Object.fromEntries(
    Object.entries(colors).map(([name, value]) => {
      if (typeof value === "string") return [name, { value }];
      if (value && typeof value === "object") {
        const tokenValue = value.value ?? value.hex;
        if (typeof tokenValue !== "string" || tokenValue.length === 0) {
          throw new Error(`tokens.colors.${name} must have a value`);
        }
        return [
          name,
          {
            value: tokenValue,
            ...(value.role ? { role: value.role } : {}),
          },
        ];
      }
      throw new Error(`tokens.colors.${name} must be a string or object`);
    }),
  );
}

function normaliseTypography(typography) {
  if (!typography || typeof typography !== "object" || Array.isArray(typography)) {
    throw new Error("tokens.typography must be an object");
  }
  const families = typography.families;
  const scale = typography.scale;
  if (!Array.isArray(families) || families.length === 0) {
    throw new Error("tokens.typography.families must contain at least one family");
  }
  if (!Array.isArray(scale)) throw new Error("tokens.typography.scale must be an array");
  return {
    families: families.map((family, index) => {
      const name = family?.name ?? family?.family;
      if (typeof name !== "string" || name.length === 0) {
        throw new Error(`tokens.typography.families[${index}] must have a name`);
      }
      return {
        name,
        ...(family.variable ? { variable: family.variable } : {}),
        ...(family.role ? { role: family.role } : {}),
      };
    }),
    scale: scale.map((step, index) => {
      const name = step?.name ?? step?.utility;
      if (typeof name !== "string" || name.length === 0) {
        throw new Error(`tokens.typography.scale[${index}] must have a name`);
      }
      return {
        name,
        ...(step.size ? { size: step.size } : {}),
        ...(step.line_height ? { line_height: step.line_height } : {}),
        ...(step.tracking ? { tracking: step.tracking } : {}),
        ...(step.weight ? { weight: step.weight } : {}),
        ...(step.use ? { use: step.use } : {}),
      };
    }),
  };
}

function deriveHero(dna) {
  if (dna.rules?.hero) return dna.rules.hero;
  const hero = (dna.components ?? []).find((component) => /hero/i.test(component.component ?? ""));
  if (!hero) {
    throw new Error("design-dna.json rules.hero is required; do not invent hero rules");
  }
  throw new Error(
    `design-dna.json rules.hero is required (found hero component "${hero.id}"); record headline length and CTA count from evidence`,
  );
}

export function buildAiLayer(dna) {
  if (!dna || typeof dna !== "object") throw new Error("DNA must be an object");
  if (!dna.meta?.name || !dna.meta?.slug || !dna.meta?.version) {
    throw new Error("DNA meta.name, meta.slug, and meta.version are required");
  }
  if (dna.framework !== "DNA Audit Framework v1") {
    throw new Error("design-dna.json framework must be DNA Audit Framework v1");
  }
  if (typeof dna.framework_version !== "string" || dna.framework_version.length === 0) {
    throw new Error("design-dna.json framework_version is required");
  }
  const fingerprint = normaliseFingerprint(dna.fingerprint);
  const rules = dna.rules;
  const tokens = dna.tokens;
  if (!rules || typeof rules !== "object") {
    throw new Error("design-dna.json rules object is required");
  }
  if (!tokens || typeof tokens !== "object") {
    throw new Error("design-dna.json tokens object is required");
  }
  if (!Array.isArray(rules.do) || !Array.isArray(rules.dont)) {
    throw new Error("design-dna.json rules.do and rules.dont must be arrays");
  }
  if (!Array.isArray(dna.components) || dna.components.length === 0) {
    throw new Error("design-dna.json components must contain at least one component");
  }
  if (!Array.isArray(dna.pages) || dna.pages.length === 0) {
    throw new Error("design-dna.json pages must contain at least one page");
  }
  if (!Number.isInteger(rules.max_font_families) || rules.max_font_families < 1) {
    throw new Error("design-dna.json rules.max_font_families must be a positive integer");
  }
  if (!Number.isInteger(rules.accent_budget_per_viewport) || rules.accent_budget_per_viewport < 0) {
    throw new Error("design-dna.json rules.accent_budget_per_viewport must be a non-negative integer");
  }
  if (typeof rules.corner_radius !== "string" || rules.corner_radius.length === 0) {
    throw new Error("design-dna.json rules.corner_radius is required");
  }
  const motionEasing = rules.motion_easing ?? firstEasing(tokens.motion);
  if (typeof motionEasing !== "string" || motionEasing.length === 0) {
    throw new Error("design-dna.json rules.motion_easing is required");
  }

  for (const field of ["colors", "typography", "spacing", "radii", "motion"]) {
    if (!tokens[field] || typeof tokens[field] !== "object" || Array.isArray(tokens[field])) {
      throw new Error(`design-dna.json tokens.${field} must be an object`);
    }
  }

  return {
    schema_version: "1.0",
    framework: dna.framework,
    framework_version: dna.framework_version,
    source: {
      name: dna.meta.name,
      slug: dna.meta.slug,
      version: dna.meta.version,
    },
    archetype: fingerprint.archetype,
    fingerprint,
    global: {
      max_font_families: rules.max_font_families,
      accent_budget_per_viewport: rules.accent_budget_per_viewport,
      corner_radius: rules.corner_radius,
      motion_easing: motionEasing,
      forbidden: [...rules.dont],
    },
    tokens: {
      colors: normaliseColors(tokens.colors),
      typography: normaliseTypography(tokens.typography),
      spacing: tokens.spacing,
      radii: tokens.radii,
      ...(tokens.borders ? { borders: tokens.borders } : {}),
      motion: tokens.motion,
    },
    hero: deriveHero(dna),
    components: dna.components.map((component) => ({
      id: component.id,
      component: component.component,
      variant: component.variant,
      confidence: component.confidence,
    })),
    pages: dna.pages,
    rules: {
      do: [...rules.do],
      dont: [...rules.dont],
    },
  };
}

export function buildFingerprints(dna) {
  if (!dna || typeof dna !== "object") throw new Error("DNA must be an object");
  if (dna.framework !== "DNA Audit Framework v1") {
    throw new Error("design-dna.json framework must be DNA Audit Framework v1");
  }
  if (typeof dna.framework_version !== "string" || dna.framework_version.length === 0) {
    throw new Error("design-dna.json framework_version is required");
  }
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
    framework: dna.framework,
    framework_version: dna.framework_version,
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
