#!/usr/bin/env node
import { readFile, readdir, rm, stat, mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { scaffoldSkill } from "./scaffold-dna-skill.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "..");
const SKIP_DIRS = new Set([
  ".git",
  ".github",
  "node_modules",
  "generated",
  "dist",
  "capture",
  "runtime",
  "coverage",
  "test-results",
  "playwright-report",
]);

const CLIENT_MARKERS = [
  "African Bison",
  "Michaelmutunga",
  "#b4552d",
  "#14120f",
  "#faf7f1",
  "Explorer-Luxury",
  "Fraunces",
];

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(directory, predicate, files = []) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) await listFiles(full, predicate, files);
    else if (entry.isFile() && predicate(full)) files.push(full);
  }
  return files;
}

async function existsCaseSensitive(root, target) {
  const relative = path.relative(root, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return false;
  let current = root;
  for (const part of relative.split(path.sep).filter(Boolean)) {
    let entries;
    try {
      entries = await readdir(current);
    } catch {
      return false;
    }
    if (!entries.includes(part)) return false;
    current = path.join(current, part);
  }
  return true;
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

async function checkMarkdownLinks(errors) {
  const files = await listFiles(REPO_ROOT, (file) => file.endsWith(".md"));
  for (const file of files) {
    const text = await readFile(file, "utf8");
    for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      let target = match[1].trim();
      if (target.startsWith("<") && target.endsWith(">")) target = target.slice(1, -1);
      target = target.split(/\s+["']/)[0];
      if (/^(?:https?:|mailto:|tel:|#|data:)/i.test(target)) continue;
      let [filePart] = target.split("#");
      if (!filePart) continue;
      filePart = decodeURIComponent(filePart);
      const resolved = path.resolve(path.dirname(file), filePart);
      const relative = path.relative(REPO_ROOT, resolved);
      if (relative.startsWith("..") || path.isAbsolute(relative)) {
        errors.push(`${path.relative(REPO_ROOT, file)} links outside the repository: ${target}`);
        continue;
      }
      if (!(await existsCaseSensitive(REPO_ROOT, resolved))) {
        errors.push(`${path.relative(REPO_ROOT, file)} has a broken link: ${target}`);
      }
    }
  }
}

async function checkFrontmatter(errors) {
  const skillPath = path.join(REPO_ROOT, "SKILL.md");
  if (!(await exists(skillPath))) {
    errors.push("SKILL.md is missing");
    return;
  }
  const frontmatter = parseFrontmatter(await readFile(skillPath, "utf8"));
  if (!frontmatter) {
    errors.push("SKILL.md is missing YAML frontmatter");
    return;
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(frontmatter.name ?? "")) {
    errors.push("SKILL.md frontmatter name must use lowercase letters, numbers, and hyphens");
  }
  if (!frontmatter.description) errors.push("SKILL.md frontmatter description is required");
}

async function checkTemplateHygiene(errors) {
  const files = await listFiles(path.join(REPO_ROOT, "templates"), () => true);
  const exampleTemplate = path.join(REPO_ROOT, "examples", "_template", "design-dna.json");
  if (await exists(exampleTemplate)) files.push(exampleTemplate);

  for (const file of files) {
    if (file.endsWith(".schema.json")) continue;
    const text = await readFile(file, "utf8");
    for (const marker of CLIENT_MARKERS) {
      if (text.includes(marker)) {
        errors.push(
          `${path.relative(REPO_ROOT, file)} contains client-specific value "${marker}"`,
        );
      }
    }
  }

  for (const dnaPath of [
    path.join(REPO_ROOT, "templates", "design-dna.json"),
    exampleTemplate,
  ]) {
    if (!(await exists(dnaPath))) continue;
    const text = await readFile(dnaPath, "utf8");
    if (!text.includes("{{")) errors.push(`${path.relative(REPO_ROOT, dnaPath)} must contain placeholders`);
    if (text.includes("African Bison")) {
      errors.push(`${path.relative(REPO_ROOT, dnaPath)} still contains a client name`);
    }
  }
}

async function checkExamples(errors) {
  const examplesDir = path.join(REPO_ROOT, "examples");
  let entries;
  try {
    entries = await readdir(examplesDir, { withFileTypes: true });
  } catch {
    errors.push("examples directory is missing");
    return;
  }
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith("_")) continue;
    const folder = path.join(examplesDir, entry.name);
    const dnaPath = path.join(folder, "design-dna.json");
    if (!(await exists(dnaPath))) continue;
    let dna;
    try {
      dna = JSON.parse(await readFile(dnaPath, "utf8"));
    } catch (error) {
      errors.push(`${entry.name}/design-dna.json is not valid JSON: ${error.message}`);
      continue;
    }
    if (JSON.stringify(dna).includes("{{")) {
      errors.push(`${entry.name}/design-dna.json contains unresolved placeholders`);
    }
    const temp = await mkdtemp(path.join(os.tmpdir(), `dna-verify-${entry.name}-`));
    try {
      await scaffoldSkill({
        dna,
        slug: dna.meta?.slug ?? entry.name,
        name: dna.meta?.name ?? entry.name,
        out: temp,
      });
    } catch (error) {
      errors.push(`${entry.name} failed scaffold validation: ${error.message}`);
    } finally {
      await rm(temp, { recursive: true, force: true });
    }
  }
}

async function main() {
  const errors = [];
  await checkFrontmatter(errors);
  await checkMarkdownLinks(errors);
  await checkTemplateHygiene(errors);
  await checkExamples(errors);

  if (errors.length > 0) {
    console.log(`FAIL verify-repo (${errors.length} issues)`);
    for (const error of errors) console.log(`ERROR ${error}`);
    process.exitCode = 1;
    return;
  }
  console.log("PASS verify-repo");
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  main().catch((error) => {
    console.error(`verify-repo: ${error.message}`);
    process.exitCode = 1;
  });
}
