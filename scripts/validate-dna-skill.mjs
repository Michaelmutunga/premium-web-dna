#!/usr/bin/env node
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";
import { validateAgainstSchema } from "./lib/json-schema.mjs";
import { checkFingerprint, validateDnaDocument } from "./lib/dna-validation.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = path.resolve(SCRIPT_DIR, "..", "templates");

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

const schemaCache = new Map();

async function loadSchema(name) {
  if (!schemaCache.has(name)) {
    schemaCache.set(name, await readJson(path.join(TEMPLATE_DIR, name)));
  }
  return schemaCache.get(name);
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
    const dnaSchema = await loadSchema("design-dna.schema.json");
    const dnaResult = validateDnaDocument(dna, dnaSchema);
    errors.push(...dnaResult.errors);
    warnings.push(...dnaResult.warnings);
    stats.components = dnaResult.stats.components;
    stats.evidence = dnaResult.stats.evidence;
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

  if (aiRules) {
    const aiSchema = await loadSchema("ai-rules.schema.json");
    errors.push(
      ...validateAgainstSchema(aiRules, aiSchema).map((error) => `ai-rules.json schema ${error}`),
    );
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
    if (!aiRules.hero?.preferred_variant) {
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
    const fingerprintSchema = await loadSchema("fingerprints.schema.json");
    errors.push(
      ...validateAgainstSchema(fingerprints, fingerprintSchema).map(
        (error) => `fingerprints.json schema ${error}`,
      ),
    );
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
