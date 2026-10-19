#!/usr/bin/env node
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";
import { pathToFileURL } from "node:url";

const REQUIRED_FILES = [
  "SKILL.md",
  "design-dna.json",
  "ai-rules.json",
  "fingerprints.json",
  "references/design-tokens.md",
  "references/typography.md",
  "references/layout.md",
  "references/components.md",
  "references/motion.md",
  "references/imagery.md",
  "references/content-voice.md",
  "references/accessibility.md",
  "references/page-recipes.md",
  "references/decision-rules.md",
  "references/provenance.md",
  "templates/design-tokens.css",
  "templates/page-brief.md",
  "templates/component-spec.md",
];

const FINGERPRINT_ENUMS = {
  density: ["compact", "balanced", "spacious", "editorial"],
  contrast: ["low", "medium", "high", "extreme"],
  motion_style: ["static", "subtle", "smooth", "cinematic", "expressive"],
  cta_style: ["direct", "confidence-based", "consultative", "urgency", "minimal"],
  card_style: ["flat", "bordered", "elevated", "editorial", "immersive"],
  navbar_style: ["solid", "transparent", "transparent-blur", "minimal", "masthead"],
};

const FINGERPRINT_FIELDS = ["archetype", ...Object.keys(FINGERPRINT_ENUMS)];

const SCORE_MAXIMA = {
  visual_system: 20,
  ux_architecture: 15,
  typography: 10,
  spacing: 10,
  brand_distinction: 10,
  trust_signals: 10,
  motion: 10,
  accessibility: 5,
  performance: 5,
  content_quality: 5,
};

const BANDS = ["Exceptional", "Premium", "Professional", "Functional", "Weak"];

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return null;
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const index = line.indexOf(":");
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }
  return data;
}

function bandFor(total) {
  if (total >= 90) return "Exceptional";
  if (total >= 80) return "Premium";
  if (total >= 70) return "Professional";
  if (total >= 60) return "Functional";
  return "Weak";
}

async function listFiles(directory) {
  const files = [];
  async function walk(current) {
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile()) files.push(full);
    }
  }
  await walk(directory);
  return files;
}

function checkFingerprint(value, label, errors) {
  if (!value || typeof value !== "object") {
    errors.push(`${label} is missing`);
    return;
  }
  for (const field of FINGERPRINT_FIELDS) {
    if (typeof value[field] !== "string" || value[field].length === 0) {
      errors.push(`${label}.${field} must be a non-empty string`);
    }
  }
  for (const [field, allowed] of Object.entries(FINGERPRINT_ENUMS)) {
    if (typeof value[field] === "string" && !allowed.includes(value[field])) {
      errors.push(`${label}.${field} must be one of: ${allowed.join(", ")}`);
    }
  }
}

function checkMarkdownLinks(text, file, skillDir, errors) {
  const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
  for (const match of text.matchAll(linkPattern)) {
    let target = match[1].trim();
    if (target.startsWith("<") && target.endsWith(">")) target = target.slice(1, -1);
    target = target.split(/\s+["']/)[0];
    if (/^(?:https?:|mailto:|tel:|#|data:)/i.test(target)) continue;
    if (target.startsWith("/")) continue;
    const [filePart] = target.split("#");
    if (!filePart) continue;
    const resolved = path.resolve(path.dirname(file), filePart);
    const relative = path.relative(skillDir, resolved);
    if (relative.startsWith("..")) {
      errors.push(`${path.relative(skillDir, file)} links outside the skill: ${target}`);
      continue;
    }
    // Existence is checked asynchronously by the caller via a collected list.
    errors.push(`__CHECK_LINK__${file}|${resolved}|${target}`);
  }
}

export async function validateSkillDir(directory) {
  const skillDir = path.resolve(directory);
  const errors = [];
  const warnings = [];
  const stats = { files: 0, bytes: 0, lines: 0, components: 0, evidence: 0 };

  if (!(await exists(skillDir))) {
    return { ok: false, errors: [`Skill directory does not exist: ${skillDir}`], warnings, stats };
  }

  for (const file of REQUIRED_FILES) {
    if (!(await exists(path.join(skillDir, file)))) {
      errors.push(`Missing required file: ${file}`);
    }
  }

  const skillPath = path.join(skillDir, "SKILL.md");
  if (await exists(skillPath)) {
    const text = await readFile(skillPath, "utf8");
    const lines = text.split(/\r?\n/).length;
    stats.lines = lines;
    if (lines > 500) errors.push(`SKILL.md must stay under 500 lines (found ${lines})`);
    const frontmatter = parseFrontmatter(text);
    if (!frontmatter) {
      errors.push("SKILL.md is missing YAML frontmatter");
    } else {
      if (!frontmatter.name) errors.push("SKILL.md frontmatter is missing name");
      else {
        if (frontmatter.name.length > 64) errors.push("SKILL.md name must be 64 characters or fewer");
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(frontmatter.name)) {
          errors.push("SKILL.md name must use lowercase letters, numbers, and hyphens");
        }
      }
      if (!frontmatter.description) errors.push("SKILL.md frontmatter is missing description");
      else if (frontmatter.description.length > 1024) {
        errors.push("SKILL.md description must be 1024 characters or fewer");
      }
    }
  }

  const files = await listFiles(skillDir);
  stats.files = files.length;
  const pendingLinks = [];

  for (const file of files) {
    const info = await stat(file);
    stats.bytes += info.size;
    if (!/\.(md|json|css)$/i.test(file)) continue;
    const text = await readFile(file, "utf8");
    const relativeFile = path.relative(skillDir, file);
    const isTemplate = relativeFile.startsWith(`templates${path.sep}`);
    if (!isTemplate && (text.includes("{{") || text.includes("}}"))) {
      errors.push(`${relativeFile} contains unresolved {{placeholders}}`);
    }
    if (/\b(?:TODO|FIXME)\b/.test(text)) {
      errors.push(`${path.relative(skillDir, file)} contains TODO or FIXME`);
    }
    if (/lorem ipsum/i.test(text)) {
      errors.push(`${path.relative(skillDir, file)} contains lorem ipsum`);
    }
    if (file.endsWith(".md")) {
      const before = errors.length;
      checkMarkdownLinks(text, file, skillDir, errors);
      for (let index = before; index < errors.length; index += 1) {
        if (errors[index].startsWith("__CHECK_LINK__")) {
          pendingLinks.push(errors[index]);
          errors.splice(index, 1);
          index -= 1;
        }
      }
    }
  }

  for (const entry of pendingLinks) {
    const [, payload] = entry.split("__CHECK_LINK__");
    const [source, target, original] = payload.split("|");
    if (!(await exists(target))) {
      errors.push(`${path.relative(skillDir, source)} has a broken link: ${original}`);
    }
  }

  const dnaPath = path.join(skillDir, "design-dna.json");
  let dna = null;
  if (await exists(dnaPath)) {
    try {
      dna = await readJson(dnaPath);
    } catch (error) {
      errors.push(`design-dna.json is not valid JSON: ${error.message}`);
    }
  }

  if (dna) {
    if (dna.schema_version !== "1.0") errors.push("design-dna.json schema_version must be 1.0");
    if (dna.framework !== "DNA Audit Framework v1") {
      errors.push("design-dna.json framework must be DNA Audit Framework v1");
    }
    if (!dna.framework_version) errors.push("design-dna.json is missing framework_version");
    if (!dna.meta || typeof dna.meta !== "object") {
      errors.push("design-dna.json is missing meta");
    } else {
      for (const field of ["name", "slug", "version", "audited_at", "source", "confidence", "licence"]) {
        if (dna.meta[field] === undefined || dna.meta[field] === null || dna.meta[field] === "") {
          errors.push(`design-dna.json meta.${field} is required`);
        }
      }
      if (typeof dna.meta.slug === "string" && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(dna.meta.slug)) {
        errors.push("design-dna.json meta.slug must use lowercase letters, numbers, and hyphens");
      }
      if (typeof dna.meta.confidence === "number" && (dna.meta.confidence < 0 || dna.meta.confidence > 1)) {
        errors.push("design-dna.json meta.confidence must be between 0 and 1");
      }
    }

    checkFingerprint(dna.fingerprint, "design-dna.json fingerprint", errors);
    if (!dna.archetype || !dna.archetype.primary) {
      errors.push("design-dna.json archetype.primary is required");
    } else {
      if (!Array.isArray(dna.archetype.evidence) || dna.archetype.evidence.length === 0) {
        errors.push("design-dna.json archetype.evidence must contain at least one citation");
      }
      if (dna.fingerprint?.archetype && dna.archetype.secondary) {
        const expected = `${dna.archetype.primary}-${dna.archetype.secondary}`;
        if (dna.fingerprint.archetype !== expected) {
          warnings.push(`fingerprint.archetype is "${dna.fingerprint.archetype}" but archetype implies "${expected}"`);
        }
      }
    }

    if (!dna.tokens || typeof dna.tokens !== "object") {
      errors.push("design-dna.json tokens is required");
    }

    if (!Array.isArray(dna.components) || dna.components.length === 0) {
      errors.push("design-dna.json must contain at least one component");
    } else {
      stats.components = dna.components.length;
      const seen = new Set();
      for (const [index, component] of dna.components.entries()) {
        const label = `components[${index}]`;
        if (!component.id) errors.push(`${label}.id is required`);
        else if (seen.has(component.id)) errors.push(`${label}.id is duplicated: ${component.id}`);
        else seen.add(component.id);
        if (!component.component) errors.push(`${label}.component is required`);
        if (!component.variant) errors.push(`${label}.variant is required`);
        if (typeof component.confidence !== "number" || component.confidence < 0 || component.confidence > 1) {
          errors.push(`${label}.confidence must be a number between 0 and 1`);
        }
        if (!Array.isArray(component.evidence) || component.evidence.length === 0) {
          errors.push(`${label}.evidence must contain at least one citation`);
        } else {
          stats.evidence += component.evidence.length;
          for (const citation of component.evidence) {
            if (typeof citation !== "string" || citation.trim().length === 0) {
              errors.push(`${label}.evidence entries must be non-empty strings`);
            }
          }
        }
        if (component.confidence < 0.5) {
          warnings.push(`${label} (${component.id}) has confidence below 0.50 and must not drive generation`);
        }
      }
    }

    if (!Array.isArray(dna.pages) || dna.pages.length === 0) {
      errors.push("design-dna.json must contain at least one page recipe");
    }

    if (!dna.rules || !Array.isArray(dna.rules.do) || !Array.isArray(dna.rules.dont)) {
      errors.push("design-dna.json rules.do and rules.dont must be arrays");
    }

    if (!dna.scores || typeof dna.scores !== "object") {
      errors.push("design-dna.json scores is required");
    } else {
      const categories = dna.scores.categories ?? {};
      let totalMax = 0;
      let totalScore = 0;
      for (const [name, max] of Object.entries(SCORE_MAXIMA)) {
        const category = categories[name];
        if (!category) {
          errors.push(`scores.categories.${name} is required`);
          continue;
        }
        if (category.max !== max) errors.push(`scores.categories.${name}.max must be ${max}`);
        if (!Number.isInteger(category.score) || category.score < 0 || category.score > max) {
          errors.push(`scores.categories.${name}.score must be an integer between 0 and ${max}`);
        }
        totalMax += max;
        totalScore += Number(category.score) || 0;
      }
      if (totalMax !== 100) errors.push(`Score maxima must total 100 (found ${totalMax})`);
      if (dna.scores.total !== totalScore) {
        errors.push(`scores.total is ${dna.scores.total} but categories total ${totalScore}`);
      }
      const expectedBand = bandFor(totalScore);
      if (dna.scores.band !== expectedBand) {
        errors.push(`scores.band is "${dna.scores.band}" but ${totalScore} is "${expectedBand}"`);
      }
      if (!BANDS.includes(dna.scores.band)) {
        errors.push(`scores.band must be one of: ${BANDS.join(", ")}`);
      }
    }

    if (!dna.provenance || typeof dna.provenance !== "object") {
      errors.push("design-dna.json provenance is required");
    } else {
      if (!dna.provenance.source) errors.push("provenance.source is required");
      if (!dna.provenance.licence) errors.push("provenance.licence is required");
      if (!Number.isInteger(dna.provenance.evidence_count)) {
        errors.push("provenance.evidence_count must be an integer");
      }
    }
  }

  const aiRulesPath = path.join(skillDir, "ai-rules.json");
  let aiRules = null;
  if (await exists(aiRulesPath)) {
    try {
      aiRules = await readJson(aiRulesPath);
    } catch (error) {
      errors.push(`ai-rules.json is not valid JSON: ${error.message}`);
    }
  }

  if (aiRules && dna) {
    if (aiRules.framework !== dna.framework) errors.push("ai-rules.json framework does not match the DNA");
    if (aiRules.source?.slug !== dna.meta?.slug) {
      errors.push("ai-rules.json source.slug does not match design-dna.json meta.slug");
    }
    if (aiRules.source?.version !== dna.meta?.version) {
      errors.push("ai-rules.json source.version does not match design-dna.json meta.version");
    }
    if (aiRules.archetype !== dna.fingerprint?.archetype) {
      errors.push("ai-rules.json archetype does not match the fingerprint");
    }
    if (!isDeepStrictEqual(aiRules.fingerprint, dna.fingerprint)) {
      errors.push("ai-rules.json fingerprint does not match design-dna.json");
    }
    if (!aiRules.global || !Array.isArray(aiRules.global.forbidden)) {
      errors.push("ai-rules.json global.forbidden must be an array");
    }
    if (!aiRules.hero || !aiRules.hero.preferred_variant) {
      errors.push("ai-rules.json hero.preferred_variant is required");
    }
    const dnaIds = new Set((dna.components ?? []).map((component) => component.id));
    const aiIds = new Set((aiRules.components ?? []).map((component) => component.id));
    for (const id of dnaIds) {
      if (!aiIds.has(id)) errors.push(`ai-rules.json is missing component: ${id}`);
    }
    for (const id of aiIds) {
      if (!dnaIds.has(id)) errors.push(`ai-rules.json has an unknown component: ${id}`);
    }
    const dnaPages = new Set((dna.pages ?? []).map((page) => page.type));
    const aiPages = new Set((aiRules.pages ?? []).map((page) => page.type));
    for (const type of dnaPages) {
      if (!aiPages.has(type)) errors.push(`ai-rules.json is missing page: ${type}`);
    }
  }

  const fingerprintsPath = path.join(skillDir, "fingerprints.json");
  let fingerprints = null;
  if (await exists(fingerprintsPath)) {
    try {
      fingerprints = await readJson(fingerprintsPath);
    } catch (error) {
      errors.push(`fingerprints.json is not valid JSON: ${error.message}`);
    }
  }

  if (fingerprints) {
    if (!fingerprints.default) errors.push("fingerprints.json default is required");
    if (!fingerprints.fingerprints || typeof fingerprints.fingerprints !== "object") {
      errors.push("fingerprints.json fingerprints must be an object");
    } else {
      if (fingerprints.default && !fingerprints.fingerprints[fingerprints.default]) {
        errors.push(`fingerprints.json default "${fingerprints.default}" is not in the map`);
      }
      for (const [name, value] of Object.entries(fingerprints.fingerprints)) {
        checkFingerprint(value, `fingerprints.json fingerprints.${name}`, errors);
      }
      if (dna && fingerprints.default === dna.fingerprint?.archetype) {
        if (!isDeepStrictEqual(fingerprints.fingerprints[fingerprints.default], dna.fingerprint)) {
          errors.push("fingerprints.json default entry does not match design-dna.json fingerprint");
        }
      }
    }
  }

  const tokensCssPath = path.join(skillDir, "templates/design-tokens.css");
  if (await exists(tokensCssPath)) {
    const css = await readFile(tokensCssPath, "utf8");
    if (!css.includes("--")) errors.push("templates/design-tokens.css must define CSS custom properties");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    stats,
  };
}

function parseArgs(argv) {
  const options = { json: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--json") options.json = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else if (!options.dir) options.dir = arg;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help || !options.dir) {
    console.log("Usage: node scripts/validate-dna-skill.mjs <skill-dir> [--json]");
    if (!options.dir && !options.help) process.exitCode = 1;
    return;
  }
  const result = await validateSkillDir(options.dir);
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    const label = path.resolve(options.dir);
    if (result.ok) console.log(`PASS ${label}`);
    else console.log(`FAIL ${label}`);
    console.log(
      `${result.stats.files} files, ${result.stats.lines} SKILL.md lines, ${result.stats.components} components, ${result.stats.evidence} evidence citations.`,
    );
    for (const warning of result.warnings) console.log(`WARN  ${warning}`);
    for (const error of result.errors) console.log(`ERROR ${error}`);
  }
  if (!result.ok) process.exitCode = 1;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  main().catch((error) => {
    console.error(`validate-dna-skill: ${error.message}`);
    process.exitCode = 1;
  });
}
