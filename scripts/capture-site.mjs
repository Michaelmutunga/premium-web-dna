#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import path from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844, isMobile: true },
];
const DEFAULT_MAX_BYTES = 10 * 1024 * 1024;
const DEFAULT_MAX_REDIRECTS = 5;
const SENSITIVE_HEADERS = new Set([
  "authorization",
  "cookie",
  "proxy-authorization",
  "set-cookie",
  "set-cookie2",
  "www-authenticate",
  "proxy-authenticate",
  "x-api-key",
]);

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
  if (url.username || url.password) {
    throw new Error("url must not contain credentials");
  }
  return url;
}

function isPrivateAddress(address) {
  const value = address.toLowerCase().replace(/^\[|\]$/g, "");
  const version = isIP(value);
  if (version === 4) {
    const [a, b] = value.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224
    );
  }
  if (version === 6) {
    if (value === "::" || value === "::1") return true;
    if (/^f[cd]/.test(value)) return true;
    if (/^fe[89ab]/.test(value)) return true;
    if (/^ff/.test(value)) return true;
    const mapped = value.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateAddress(mapped[1]);
    return false;
  }
  return false;
}

async function assertPublicHost(hostname, allowPrivateNetwork) {
  if (allowPrivateNetwork) return;
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost")) {
    throw new Error(`refusing to capture private host "${host}" (pass --allow-private-network to override)`);
  }
  if (isIP(host)) {
    if (isPrivateAddress(host)) {
      throw new Error(`refusing to capture private address "${host}" (pass --allow-private-network to override)`);
    }
    return;
  }
  let addresses;
  try {
    addresses = await lookup(host, { all: true, verbatim: true });
  } catch (error) {
    throw new Error(`could not resolve "${host}": ${error.message}`);
  }
  if (addresses.length === 0) throw new Error(`could not resolve "${host}"`);
  if (addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error(`refusing to capture private address for "${host}" (pass --allow-private-network to override)`);
  }
}

function redactHeaders(headers) {
  const output = {};
  for (const [key, value] of Object.entries(headers)) {
    output[key] = SENSITIVE_HEADERS.has(key.toLowerCase()) ? "[redacted]" : value;
  }
  return output;
}

async function readTextLimited(response, maxBytes) {
  const declared = Number(response.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) {
    throw new Error(`response is ${declared} bytes, above the ${maxBytes} byte limit`);
  }
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        throw new Error(`response exceeded the ${maxBytes} byte limit`);
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function fetchWithCheckedRedirects(url, options) {
  let current = url;
  for (let redirects = 0; redirects <= options.maxRedirects; redirects += 1) {
    const parsed = normaliseUrl(current);
    await assertPublicHost(parsed.hostname, options.allowPrivateNetwork);
    const response = await fetch(parsed, {
      headers: { "user-agent": options.userAgent },
      redirect: "manual",
      signal: AbortSignal.timeout(options.timeout),
    });
    if (response.status >= 300 && response.status < 400 && response.headers.get("location")) {
      if (redirects === options.maxRedirects) {
        throw new Error(`too many redirects (limit ${options.maxRedirects})`);
      }
      current = new URL(response.headers.get("location"), parsed).toString();
      continue;
    }
    return { response, finalUrl: parsed.toString() };
  }
  throw new Error(`too many redirects (limit ${options.maxRedirects})`);
}

function parsePositiveInteger(value, name, maximum, minimum = 1) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < minimum || number > maximum) {
    throw new Error(`${name} must be an integer from ${minimum} to ${maximum} (received "${value}")`);
  }
  return number;
}

function parseViewport(value) {
  const match = String(value).match(/^(\d+)x(\d+)(?::([a-z0-9-]+))?$/i);
  if (!match) throw new Error(`viewport must look like 1440x900 or 390x844:mobile (received "${value}")`);
  return {
    name: match[3] ?? `${match[1]}x${match[2]}`,
    width: parsePositiveInteger(match[1], "viewport width", 10000),
    height: parsePositiveInteger(match[2], "viewport height", 10000),
  };
}

function safeName(value) {
  return value.replace(/[^a-z0-9-]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();
}

async function captureWithFetch(url, outDir, options) {
  const { response, finalUrl } = await fetchWithCheckedRedirects(url, options);
  if (!response.ok) throw new Error(`Request failed with ${response.status} ${response.statusText}`);
  const html = await readTextLimited(response, options.maxBytes);
  await writeFile(path.join(outDir, "page.html"), html, "utf8");
  await writeFile(
    path.join(outDir, "headers.json"),
    `${JSON.stringify(redactHeaders(Object.fromEntries(response.headers.entries())), null, 2)}\n`,
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
    final_url: finalUrl,
    status: response.status,
    limits: {
      max_bytes: options.maxBytes,
      max_redirects: options.maxRedirects,
      allow_private_network: options.allowPrivateNetwork,
    },
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
    limits: {
      max_bytes: options.maxBytes,
      max_redirects: options.maxRedirects,
      allow_private_network: options.allowPrivateNetwork,
    },
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
        const html = await page.content();
        if (Buffer.byteLength(html, "utf8") > options.maxBytes) {
          throw new Error(`page HTML exceeded the ${options.maxBytes} byte limit`);
        }
        await writeFile(path.join(outDir, "page.html"), html, "utf8");
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
  const parsedUrl = normaliseUrl(options.url);
  const allowPrivateNetwork = Boolean(options.allowPrivateNetwork);
  await assertPublicHost(parsedUrl.hostname, allowPrivateNetwork);
  const url = parsedUrl.toString();
  const outDir = path.resolve(options.out ?? "capture");
  await mkdir(outDir, { recursive: true });
  const viewports = (options.viewports?.length ? options.viewports : DEFAULT_VIEWPORTS).map(
    (viewport) => ({
      ...viewport,
      width: parsePositiveInteger(viewport.width, "viewport width", 10000),
      height: parsePositiveInteger(viewport.height, "viewport height", 10000),
    }),
  );
  const config = {
    viewports,
    timeout: parsePositiveInteger(options.timeout ?? 45000, "timeout", 300000),
    maxBytes: parsePositiveInteger(options.maxBytes ?? DEFAULT_MAX_BYTES, "maxBytes", 100 * 1024 * 1024),
    maxRedirects: parsePositiveInteger(
      options.maxRedirects ?? DEFAULT_MAX_REDIRECTS,
      "maxRedirects",
      20,
      0,
    ),
    allowPrivateNetwork,
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
    else if (arg === "--max-bytes") options.maxBytes = Number(argv[++index]);
    else if (arg === "--max-redirects") options.maxRedirects = Number(argv[++index]);
    else if (arg === "--allow-private-network") options.allowPrivateNetwork = true;
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
    console.log("Usage: node scripts/capture-site.mjs --url <https://...> --out <capture-dir> [--viewport 1440x900] [--viewport 390x844:mobile] [--timeout 45000] [--max-bytes 10485760] [--max-redirects 5] [--allow-private-network] [--reduced-motion] [--no-full-page] [--no-playwright] [--json]");
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
