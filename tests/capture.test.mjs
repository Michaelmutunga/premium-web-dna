import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { captureSite } from "../scripts/capture-site.mjs";

test("falls back to an HTTP capture when Playwright is unavailable", async () => {
  const server = createServer((request, response) => {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(`<!doctype html><html lang="en"><head><title>Test</title><link rel="stylesheet" href="/app.css"></head><body><h1>Hello</h1></body></html>`);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const out = await mkdtemp(path.join(os.tmpdir(), "dna-capture-"));

  try {
    const manifest = await captureSite({
      url: `http://127.0.0.1:${address.port}`,
      out,
      playwright: false,
      timeout: 5000,
    });
    assert.equal(manifest.mode, "http-fetch");
    assert.equal(manifest.status, 200);
    assert.ok(manifest.warning.includes("Playwright"));
    const html = await readFile(path.join(out, "page.html"), "utf8");
    assert.ok(html.includes("<title>Test</title>"));
    const headers = JSON.parse(await readFile(path.join(out, "headers.json"), "utf8"));
    assert.equal(headers["content-type"], "text/html; charset=utf-8");
  } finally {
    await rm(out, { recursive: true, force: true });
    await new Promise((resolve) => server.close(resolve));
  }
});

test("rejects non-http URLs before making a request", async () => {
  await assert.rejects(
    captureSite({ url: "file:///etc/passwd", out: os.tmpdir(), playwright: false }),
    /http or https/,
  );
});
