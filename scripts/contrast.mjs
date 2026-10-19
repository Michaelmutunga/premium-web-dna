#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const NAMED = {
  transparent: [0, 0, 0, 0],
  white: [255, 255, 255, 1],
  black: [0, 0, 0, 1],
  ivory: [250, 247, 241, 1],
  night: [14, 13, 11, 1],
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function hslToRgb(h, s, l) {
  const hue = ((h % 360) + 360) % 360;
  const sat = clamp(s, 0, 1);
  const light = clamp(l, 0, 1);
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = light - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hue < 60) [r, g, b] = [c, x, 0];
  else if (hue < 120) [r, g, b] = [x, c, 0];
  else if (hue < 180) [r, g, b] = [0, c, x];
  else if (hue < 240) [r, g, b] = [0, x, c];
  else if (hue < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

function parseNumber(value, max = 255) {
  const text = String(value).trim();
  if (text.endsWith("%")) {
    return (Number.parseFloat(text) / 100) * max;
  }
  return Number.parseFloat(text);
}

export function parseColor(input) {
  if (typeof input !== "string") {
    throw new TypeError("Colour must be a string");
  }
  const value = input.trim().toLowerCase();
  if (Object.hasOwn(NAMED, value)) {
    const [r, g, b, a] = NAMED[value];
    return { r, g, b, a };
  }
  if (value.startsWith("#")) {
    const hex = value.slice(1);
    if (![3, 4, 6, 8].includes(hex.length) || /[^0-9a-f]/.test(hex)) {
      throw new Error(`Invalid hex colour: ${input}`);
    }
    const expanded = hex.length <= 4 ? [...hex].map((char) => char + char).join("") : hex;
    const r = Number.parseInt(expanded.slice(0, 2), 16);
    const g = Number.parseInt(expanded.slice(2, 4), 16);
    const b = Number.parseInt(expanded.slice(4, 6), 16);
    const a = expanded.length === 8 ? Number.parseInt(expanded.slice(6, 8), 16) / 255 : 1;
    return { r, g, b, a };
  }

  const functionMatch = value.match(/^(rgba?|hsla?)\((.*)\)$/);
  if (!functionMatch) {
    throw new Error(`Unsupported colour: ${input}`);
  }
  const [, fn, body] = functionMatch;
  const normalized = body.replace(/\s*\/\s*/g, " / ");
  let parts;
  if (normalized.includes(",")) {
    parts = normalized.split(",").map((part) => part.trim());
  } else {
    parts = normalized.split(/\s+/).filter(Boolean);
    const slash = parts.indexOf("/");
    if (slash !== -1) {
      parts = [...parts.slice(0, slash), parts.slice(slash + 1).join(" ")];
    }
  }
  if (parts.length < 3) {
    throw new Error(`Invalid colour: ${input}`);
  }
  const alpha = parts.length > 3 ? parseNumber(parts[3], 1) : 1;
  if (fn.startsWith("rgb")) {
    return {
      r: clamp(parseNumber(parts[0]), 0, 255),
      g: clamp(parseNumber(parts[1]), 0, 255),
      b: clamp(parseNumber(parts[2]), 0, 255),
      a: clamp(alpha, 0, 1),
    };
  }
  const hue = Number.parseFloat(parts[0]);
  const saturation = parts[1].endsWith("%") ? Number.parseFloat(parts[1]) / 100 : Number.parseFloat(parts[1]);
  const lightness = parts[2].endsWith("%") ? Number.parseFloat(parts[2]) / 100 : Number.parseFloat(parts[2]);
  const [r, g, b] = hslToRgb(hue, saturation, lightness);
  return { r, g, b, a: clamp(alpha, 0, 1) };
}

export function composite(foreground, background) {
  const bg = background.a >= 1 ? background : composite(background, { r: 255, g: 255, b: 255, a: 1 });
  if (foreground.a >= 1) {
    return foreground;
  }
  return {
    r: foreground.r * foreground.a + bg.r * (1 - foreground.a),
    g: foreground.g * foreground.a + bg.g * (1 - foreground.a),
    b: foreground.b * foreground.a + bg.b * (1 - foreground.a),
    a: 1,
  };
}

export function relativeLuminance(color) {
  const channel = (value) => {
    const normalized = value / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
}

export function contrastRatio(foreground, background) {
  const fg = typeof foreground === "string" ? parseColor(foreground) : foreground;
  const bg = typeof background === "string" ? parseColor(background) : background;
  const composed = composite(fg, bg);
  const bgOpaque = composite(bg, { r: 255, g: 255, b: 255, a: 1 });
  const l1 = relativeLuminance(composed);
  const l2 = relativeLuminance(bgOpaque);
  const light = Math.max(l1, l2);
  const dark = Math.min(l1, l2);
  return (light + 0.05) / (dark + 0.05);
}

export function rateContrast(ratio) {
  return {
    ratio: Number(ratio.toFixed(2)),
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaaNormal: ratio >= 7,
    aaaLarge: ratio >= 4.5,
  };
}

export function assess(fg, bg) {
  return {
    foreground: fg,
    background: bg,
    ...rateContrast(contrastRatio(fg, bg)),
  };
}

function pad(value, width) {
  return String(value).padEnd(width);
}

function printTable(rows) {
  const headers = ["Foreground", "Background", "Ratio", "AA normal", "AA large", "AAA normal", "AAA large"];
  const widths = [18, 18, 7, 10, 9, 11, 10];
  console.log(headers.map((header, index) => pad(header, widths[index])).join(" "));
  console.log(widths.map((width) => "-".repeat(width)).join(" "));
  for (const row of rows) {
    console.log(
      [
        pad(row.foreground, widths[0]),
        pad(row.background, widths[1]),
        pad(row.ratio.toFixed(2), widths[2]),
        pad(row.aaNormal ? "pass" : "FAIL", widths[3]),
        pad(row.aaLarge ? "pass" : "FAIL", widths[4]),
        pad(row.aaaNormal ? "pass" : "FAIL", widths[5]),
        pad(row.aaaLarge ? "pass" : "FAIL", widths[6]),
      ].join(" "),
    );
  }
}

function parseArgs(argv) {
  const options = { pairs: [], json: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--fg") options.fg = argv[++index];
    else if (arg === "--bg") options.bg = argv[++index];
    else if (arg === "--pairs") options.pairsFile = argv[++index];
    else if (arg === "--json") options.json = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

async function loadPairs(file) {
  const raw = await readFile(file, "utf8");
  const parsed = JSON.parse(raw);
  const list = Array.isArray(parsed) ? parsed : parsed.pairs;
  if (!Array.isArray(list)) {
    throw new Error("Pairs file must be an array or an object with a pairs array");
  }
  return list.map((item) => {
    if (!item.fg || !item.bg) throw new Error("Each pair requires fg and bg");
    return { ...item, foreground: item.fg, background: item.bg };
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(`Usage:
  node scripts/contrast.mjs --fg "#14120f" --bg "#faf7f1" [--json]
  node scripts/contrast.mjs --pairs pairs.json [--json]

Pairs file:
  [{ "fg": "#14120f", "bg": "#faf7f1", "label": "body" }]`);
    return;
  }
  let rows = [];
  if (options.pairsFile) {
    rows = (await loadPairs(options.pairsFile)).map((pair) => ({
      ...assess(pair.fg, pair.bg),
      label: pair.label,
    }));
  } else if (options.fg && options.bg) {
    rows = [assess(options.fg, options.bg)];
  } else {
    throw new Error("Provide --fg and --bg, or --pairs <file>");
  }

  if (options.json) {
    console.log(JSON.stringify(rows, null, 2));
  } else {
    printTable(rows);
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  main().catch((error) => {
    console.error(`contrast: ${error.message}`);
    process.exitCode = 1;
  });
}
