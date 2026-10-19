#!/usr/bin/env node
import { readFile, readdir, stat, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SKIP_DIRS = new Set([
  ".git",
  ".hg",
  ".svn",
  "node_modules",
  ".next",
  ".nuxt",
  ".output",
  ".turbo",
  ".vercel",
  ".netlify",
  "dist",
  "build",
  "out",
  "coverage",
  "test-results",
  "playwright-report",
  ".cache",
  ".parcel-cache",
  ".venv",
  "venv",
  "vendor",
  "tmp",
  "temp",
  ".idea",
  ".vscode",
]);

const SOURCE_EXTENSIONS = new Set([
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".vue",
  ".svelte",
  ".astro",
  ".html",
  ".mdx",
  ".json",
]);

const MAX_FILE_BYTES = 2_000_000;
const MAX_EVIDENCE = 5;

function normalizeValue(value) {
  return value.replace(/\s+/g, " ").trim().slice(0, 300);
}

function lineAt(text, index) {
  let line = 1;
  for (let cursor = 0; cursor < index; cursor += 1) {
    if (text.charCodeAt(cursor) === 10) line += 1;
  }
  return line;
}

function add(map, value, evidence, limit = MAX_EVIDENCE) {
  const normalized = normalizeValue(value);
  if (!normalized) return;
  const key = normalized.toLowerCase();
  const existing = map.get(key);
  if (existing) {
    existing.count += 1;
    if (existing.evidence.length < limit) existing.evidence.push(evidence);
    return;
  }
  map.set(key, { value: normalized, count: 1, evidence: [evidence] });
}

function addNamed(map, name, value, evidence) {
  const normalizedName = normalizeValue(name);
  const normalizedValue = normalizeValue(value);
  if (!normalizedName || !normalizedValue) return;
  const key = normalizedName.toLowerCase();
  const existing = map.get(key);
  if (existing) {
    existing.count += 1;
    if (existing.evidence.length < MAX_EVIDENCE) existing.evidence.push(evidence);
    if (existing.value !== normalizedValue) {
      existing.values ??= [existing.value];
      if (!existing.values.includes(normalizedValue)) existing.values.push(normalizedValue);
    }
    return;
  }
  map.set(key, {
    name: normalizedName,
    value: normalizedValue,
    count: 1,
    evidence: [evidence],
  });
}

function sorted(map) {
  return [...map.values()].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return String(a.name ?? a.value).localeCompare(String(b.name ?? b.value));
  });
}

export function parseDesignText(text, file = "input.css") {
  const colors = new Map();
  const customProperties = new Map();
  const fonts = new Map();
  const radii = new Map();
  const shadows = new Map();
  const durations = new Map();
  const easings = new Map();
  const keyframes = new Map();
  const breakpoints = new Set();
  const zIndex = new Map();
  const spacing = new Map();

  const evidence = (index) => ({ file: file.replaceAll("\\", "/"), line: lineAt(text, index) });

  const customPropertyPattern = /(--[a-zA-Z0-9_-]+)\s*:\s*([^;{}]+);/g;
  for (const match of text.matchAll(customPropertyPattern)) {
    const name = match[1];
    const value = match[2];
    addNamed(customProperties, name, value, evidence(match.index));
    if (/color|ink|ivory|sand|earth|bark|night|clay|paper|accent|surface|bg|background|text|border/i.test(name)) {
      addNamed(colors, name, value, evidence(match.index));
    }
    if (/radius|corner|round/i.test(name)) addNamed(radii, name, value, evidence(match.index));
    if (/shadow|elevation/i.test(name)) addNamed(shadows, name, value, evidence(match.index));
    if (/ease|timing/i.test(name)) addNamed(easings, name, value, evidence(match.index));
    if (/duration|delay|speed/i.test(name)) addNamed(durations, name, value, evidence(match.index));
    if (/space|spacing|gap|pad|margin/i.test(name)) addNamed(spacing, name, value, evidence(match.index));
    if (/font/i.test(name)) addNamed(fonts, name, value, evidence(match.index));
  }

  const hexPattern = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b/g;
  for (const match of text.matchAll(hexPattern)) {
    add(colors, match[0], evidence(match.index));
  }

  const colorFunctionPattern = /\b(?:rgba?|hsla?|oklch|oklab)\([^)]*\)/gi;
  for (const match of text.matchAll(colorFunctionPattern)) {
    add(colors, match[0], evidence(match.index));
  }

  const fontFamilyPattern = /font-family\s*:\s*([^;}{]+)/gi;
  for (const match of text.matchAll(fontFamilyPattern)) {
    add(fonts, match[1], evidence(match.index));
  }

  const jsFontPattern = /(?:fontFamily|font-family)\s*[:=]\s*["']([^"']+)["']/g;
  for (const match of text.matchAll(jsFontPattern)) {
    add(fonts, match[1], evidence(match.index));
  }

  const radiusPattern = /border-radius\s*:\s*([^;}{]+)/gi;
  for (const match of text.matchAll(radiusPattern)) {
    add(radii, match[1], evidence(match.index));
  }

  const shadowPattern = /box-shadow\s*:\s*([^;}{]+)/gi;
  for (const match of text.matchAll(shadowPattern)) {
    add(shadows, match[1], evidence(match.index));
  }

  const easingPattern = /cubic-bezier\([^)]*\)|steps\([^)]*\)|\blinear(?!-?gradient)\b|\bease(?:-in|-out|-in-out)?\b/gi;
  for (const match of text.matchAll(easingPattern)) {
    add(easings, match[0], evidence(match.index));
  }

  const durationPattern = /\b(\d*\.?\d+)(ms|s)\b/gi;
  const motionContextPattern = /(?:transition|animation|duration|delay)[^;{}]*/gi;
  for (const context of text.matchAll(motionContextPattern)) {
    for (const match of context[0].matchAll(durationPattern)) {
      add(durations, match[0], evidence(context.index + match.index));
    }
  }

  const keyframePattern = /@keyframes\s+([\w-]+)/g;
  for (const match of text.matchAll(keyframePattern)) {
    add(keyframes, match[1], evidence(match.index));
  }

  const breakpointPattern = /@media[^{]*\((?:min|max)-width\s*:\s*([^)]+)\)/gi;
  for (const match of text.matchAll(breakpointPattern)) {
    breakpoints.add(normalizeValue(match[1]));
  }

  const zIndexPattern = /z-index\s*:\s*(-?\d+)/gi;
  for (const match of text.matchAll(zIndexPattern)) {
    add(zIndex, match[1], evidence(match.index));
  }

  return {
    colors: sorted(colors),
    custom_properties: sorted(customProperties),
    fonts: sorted(fonts),
    radii: sorted(radii),
    shadows: sorted(shadows),
    motion: {
      easings: sorted(easings),
      durations: sorted(durations),
      keyframes: sorted(keyframes),
    },
    breakpoints: [...breakpoints].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
    spacing: sorted(spacing),
    z_index: sorted(zIndex),
  };
}

async function collectFiles(root, maxFiles) {
  const files = [];
  async function walk(directory) {
    if (files.length >= maxFiles) return;
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch {
      return;
    }
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (files.length >= maxFiles) return;
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        await walk(full);
        continue;
      }
      if (!entry.isFile()) continue;
      const extension = path.extname(entry.name).toLowerCase();
      if (!SOURCE_EXTENSIONS.has(extension)) continue;
      if (entry.name.endsWith(".min.js") || entry.name.endsWith(".min.css")) continue;
      if (entry.name.endsWith(".map")) continue;
      let info;
      try {
        info = await stat(full);
      } catch {
        continue;
      }
      if (info.size > MAX_FILE_BYTES) continue;
      files.push(full);
    }
  }
  await walk(root);
  return files;
}

function mergeMaps(target, source) {
  for (const item of source) {
    const key = (item.name ?? item.value).toLowerCase();
    const existing = target.get(key);
    if (!existing) {
      target.set(key, { ...item, evidence: [...item.evidence] });
      continue;
    }
    existing.count += item.count;
    for (const evidence of item.evidence) {
      if (existing.evidence.length >= MAX_EVIDENCE) break;
      if (!existing.evidence.some((entry) => entry.file === evidence.file && entry.line === evidence.line)) {
        existing.evidence.push(evidence);
      }
    }
  }
}

export async function scanRepo(root, options = {}) {
  const absoluteRoot = path.resolve(root);
  const maxFiles = options.maxFiles ?? 20_000;
  const files = await collectFiles(absoluteRoot, maxFiles);
  const aggregate = {
    colors: new Map(),
    custom_properties: new Map(),
    fonts: new Map(),
    radii: new Map(),
    shadows: new Map(),
    easings: new Map(),
    durations: new Map(),
    keyframes: new Map(),
    breakpoints: new Set(),
    spacing: new Map(),
    z_index: new Map(),
  };

  for (const file of files) {
    let text;
    try {
      text = await readFile(file, "utf8");
    } catch {
      continue;
    }
    const relative = path.relative(absoluteRoot, file);
    const parsed = parseDesignText(text, relative);
    mergeMaps(aggregate.colors, parsed.colors);
    mergeMaps(aggregate.custom_properties, parsed.custom_properties);
    mergeMaps(aggregate.fonts, parsed.fonts);
    mergeMaps(aggregate.radii, parsed.radii);
    mergeMaps(aggregate.shadows, parsed.shadows);
    mergeMaps(aggregate.easings, parsed.motion.easings);
    mergeMaps(aggregate.durations, parsed.motion.durations);
    mergeMaps(aggregate.keyframes, parsed.motion.keyframes);
    mergeMaps(aggregate.spacing, parsed.spacing);
    mergeMaps(aggregate.z_index, parsed.z_index);
    for (const breakpoint of parsed.breakpoints) aggregate.breakpoints.add(breakpoint);
  }

  const tokens = {
    colors: sorted(aggregate.colors),
    custom_properties: sorted(aggregate.custom_properties),
    fonts: sorted(aggregate.fonts),
    radii: sorted(aggregate.radii),
    shadows: sorted(aggregate.shadows),
    motion: {
      easings: sorted(aggregate.easings),
      durations: sorted(aggregate.durations),
      keyframes: sorted(aggregate.keyframes),
    },
    breakpoints: [...aggregate.breakpoints].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
    spacing: sorted(aggregate.spacing),
    z_index: sorted(aggregate.z_index),
  };

  return {
    framework: "DNA Audit Framework v1",
    framework_version: "1.0.0",
    generated_at: new Date().toISOString(),
    repo: absoluteRoot.replaceAll("\\", "/"),
    files_scanned: files.length,
    summary: {
      colors: tokens.colors.length,
      custom_properties: tokens.custom_properties.length,
      fonts: tokens.fonts.length,
      radii: tokens.radii.length,
      shadows: tokens.shadows.length,
      easings: tokens.motion.easings.length,
      durations: tokens.motion.durations.length,
      keyframes: tokens.motion.keyframes.length,
      breakpoints: tokens.breakpoints.length,
    },
    tokens,
  };
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--out") options.out = argv[++index];
    else if (arg === "--max-files") options.maxFiles = Number.parseInt(argv[++index], 10);
    else if (arg === "--help" || arg === "-h") options.help = true;
    else if (!options.repo) options.repo = arg;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help || !options.repo) {
    console.log(`Usage: node scripts/scan-design-signals.mjs <repo> [--out signals.json] [--max-files 20000]`);
    if (!options.repo && !options.help) process.exitCode = 1;
    return;
  }
  const result = await scanRepo(options.repo, { maxFiles: options.maxFiles });
  const json = JSON.stringify(result, null, 2);
  if (options.out) {
    await mkdir(path.dirname(path.resolve(options.out)), { recursive: true });
    await writeFile(options.out, `${json}\n`, "utf8");
    console.log(
      `Scanned ${result.files_scanned} files. ${result.summary.colors} colour values, ${result.summary.custom_properties} custom properties, ${result.summary.fonts} font declarations.`,
    );
    console.log(`Wrote ${path.resolve(options.out)}`);
  } else {
    console.log(json);
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  main().catch((error) => {
    console.error(`scan-design-signals: ${error.message}`);
    process.exitCode = 1;
  });
}
