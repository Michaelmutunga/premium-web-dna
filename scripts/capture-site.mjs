#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844, isMobile: true },
];

async function loadPlaywright() {
  for (const specifier of ["playwright", "playwright-core"]) {
    try {
      return await import(specifier);
    } catch {
      // Try the next available package name.
    }
  }
  return null;
}

function normaliseUrl(input) {
  const url = new URL(input);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("url must use http or https");
  }
  return url;
}

function parseViewport(value) {
  const match = String(value).match(/^(\d+)x(\d+)(?::([a-z0-9-]+))?$/i);
  if (!match) throw new Error(`viewport must look like 1440x900 or 390x844:mobile (received "${value}")`);
  return {
    name: match[3] ?? `${match[1]}x${match[2]}`,
    width: Number(match[1]),
    height: Number(match[2]),
  };
}

function safeName(value) {
  return value.replace(/[^a-z0-9-]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();
}

async function captureWithFetch(url, outDir, options) {
  const response = await fetch(url, {
    headers: { "user-agent": options.userAgent },
    redirect: "follow",
    signal: AbortSignal.timeout(options.timeout),
  });
  if (!response.ok) throw new Error(`Request failed with ${response.status} ${response.statusText}`);
  const html = await response.text();
  await writeFile(path.join(outDir, "page.html"), html, "utf8");
  await writeFile(
    path.join(outDir, "headers.json"),
    `${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}\n`,
    "utf8",
  );
  const links = [...html.matchAll(/<link[^>]+href=["']([^"']+)["'][^>]*>/gi)].map((match) => match[1]);
  const scripts = [...html.matchAll(/<script[^>]+src=["']([^"']+)["'][^>]*>/gi)].map((match) => match[1]);
  const manifest = {
    url,
    mode: "http-fetch",
    captured_at: new Date().toISOString(),
    warning:
      "Playwright is not installed. Only HTML and response headers were captured. Install playwright for screenshots, computed styles, and interaction states.",
    final_url: response.url,
    status: response.status,
    links,
    scripts,
  };
  await writeFile(path.join(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return manifest;
}

async function captureWithPlaywright(playwright, url, outDir, options) {
  const browser = await playwright.chromium.launch({ headless: true });
  const screenshotsDir = path.join(outDir, "screenshots");
  await mkdir(screenshotsDir, { recursive: true });
  const manifest = {
    url,
    mode: "playwright",
    captured_at: new Date().toISOString(),
    browser: "chromium",
    viewports: [],
    warnings: [],
  };
  let htmlSaved = false;

  try {
    for (const viewport of options.viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: viewport.isMobile ? 2 : 1,
        isMobile: Boolean(viewport.isMobile),
        hasTouch: Boolean(viewport.isMobile),
        reducedMotion: options.reducedMotion ? "reduce" : "no-preference",
        userAgent: options.userAgent,
      });
      const page = await context.newPage();
      const consoleErrors = [];
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });
      page.on("pageerror", (error) => consoleErrors.push(error.message));

      let response;
      try {
        response = await page.goto(url, { waitUntil: "networkidle", timeout: options.timeout });
      } catch (error) {
        manifest.warnings.push(`networkidle failed for ${viewport.name}: ${error.message}`);
        response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: options.timeout });
      }

      const name = safeName(viewport.name);
      if (options.fullPage) {
        await page.screenshot({ path: path.join(screenshotsDir, `${name}-full.png`), fullPage: true });
      }
      await page.screenshot({ path: path.join(screenshotsDir, `${name}.png`) });

      const signals = await page.evaluate(() => {
        const root = getComputedStyle(document.documentElement);
        const cssVariables = {};
        for (let index = 0; index < root.length; index += 1) {
          const property = root[index];
          if (property.startsWith("--")) cssVariables[property] = root.getPropertyValue(property).trim();
        }
        const styleOf = (element) => {
          if (!element) return null;
          const style = getComputedStyle(element);
          return {
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            lineHeight: style.lineHeight,
            letterSpacing: style.letterSpacing,
            color: style.color,
            backgroundColor: style.backgroundColor,
            borderRadius: style.borderRadius,
            textTransform: style.textTransform,
          };
        };
        const first = (selector) => styleOf(document.querySelector(selector));
        const images = [...document.images].map((image) => ({
          src: image.currentSrc || image.src,
          alt: image.alt,
          width: image.naturalWidth,
          height: image.naturalHeight,
          loading: image.loading,
        }));
        const sections = [...document.querySelectorAll("header, nav, main, section, footer")].map((element) => ({
          tag: element.tagName.toLowerCase(),
          id: element.id,
          classes: element.className && typeof element.className === "string" ? element.className : "",
          height: Math.round(element.getBoundingClientRect().height),
          backgroundColor: getComputedStyle(element).backgroundColor,
        }));
        return {
          title: document.title,
          description: document.querySelector('meta[name="description"]')?.content ?? "",
          lang: document.documentElement.lang,
          cssVariables,
          body: first("body"),
          h1: first("h1"),
          h2: first("h2"),
          button: first("button, .btn, a[class*='button']"),
          nav: first("nav, header"),
          footer: first("footer"),
          headings: [...document.querySelectorAll("h1, h2, h3")].map((heading) => ({
            tag: heading.tagName.toLowerCase(),
            text: heading.textContent?.trim().slice(0, 160) ?? "",
          })),
          links: [...document.querySelectorAll("a")].map((link) => ({
            text: link.textContent?.trim().slice(0, 80) ?? "",
            href: link.href,
            ariaLabel: link.getAttribute("aria-label"),
          })),
          buttons: [...document.querySelectorAll("button")].map((button) => ({
            text: button.textContent?.trim().slice(0, 80) ?? "",
            type: button.getAttribute("type"),
            ariaLabel: button.getAttribute("aria-label"),
          })),
          images,
          sections,
          fonts: [...document.fonts].map((font) => ({
            family: font.family,
            weight: font.weight,
            style: font.style,
            status: font.status,
          })),
          stylesheets: [...document.querySelectorAll('link[rel="stylesheet"]')].map((link) => link.href),
        };
      });

      if (!htmlSaved) {
        await writeFile(path.join(outDir, "page.html"), await page.content(), "utf8");
        htmlSaved = true;
      }
      await writeFile(
        path.join(outDir, `${name}-signals.json`),
        `${JSON.stringify({ ...signals, consoleErrors }, null, 2)}\n`,
        "utf8",
      );
      manifest.viewports.push({
        name: viewport.name,
        width: viewport.width,
        height: viewport.height,
        status: response?.status() ?? null,
        final_url: page.url(),
        console_errors: consoleErrors.length,
      });
      await context.close();
    }
  } finally {
    await browser.close();
  }

  await writeFile(path.join(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return manifest;
}

export async function captureSite(options) {
  const url = normaliseUrl(options.url).toString();
  const outDir = path.resolve(options.out ?? "capture");
  await mkdir(outDir, { recursive: true });
  const config = {
    viewports: options.viewports?.length ? options.viewports : DEFAULT_VIEWPORTS,
    timeout: options.timeout ?? 45000,
    fullPage: options.fullPage !== false,
    reducedMotion: Boolean(options.reducedMotion),
    userAgent:
      options.userAgent ??
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  };
  const playwright = options.playwright === false ? null : await loadPlaywright();
  if (!playwright) return captureWithFetch(url, outDir, config);
  return captureWithPlaywright(playwright, url, outDir, config);
}

function parseArgs(argv) {
  const options = { viewports: [], fullPage: true };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--url") options.url = argv[++index];
    else if (arg === "--out") options.out = argv[++index];
    else if (arg === "--viewport") options.viewports.push(parseViewport(argv[++index]));
    else if (arg === "--timeout") options.timeout = Number(argv[++index]);
    else if (arg === "--reduced-motion") options.reducedMotion = true;
    else if (arg === "--no-full-page") options.fullPage = false;
    else if (arg === "--no-playwright") options.playwright = false;
    else if (arg === "--json") options.json = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help || !options.url) {
    console.log("Usage: node scripts/capture-site.mjs --url <https://...> --out <capture-dir> [--viewport 1440x900] [--viewport 390x844:mobile] [--timeout 45000] [--reduced-motion] [--no-full-page] [--no-playwright] [--json]");
    if (!options.help) process.exitCode = 1;
    return;
  }
  const manifest = await captureSite(options);
  if (options.json) console.log(JSON.stringify(manifest, null, 2));
  else console.log(`Captured ${manifest.url} (${manifest.mode}) to ${path.resolve(options.out ?? "capture")}`);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  main().catch((error) => {
    console.error(`capture-site: ${error.message}`);
    process.exitCode = 1;
  });
}
