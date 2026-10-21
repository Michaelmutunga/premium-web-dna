import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { captureSite } from "../scripts/capture-site.mjs";

async function startServer(handler) {
  const server = createServer(handler);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  return {
    url: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

test("falls back to an HTTP capture when Playwright is unavailable", async () => {
  const server = await startServer((_request, response) => {
    response.writeHead(200, {
      "content-type": "text/html; charset=utf-8",
      "set-cookie": "session=secret",
      "x-visible": "yes",
    });
    response.end(`<!doctype html><html lang="en"><head><title>Test</title><link rel="stylesheet" href="/app.css"></head><body><h1>Hello</h1></body></html>`);
  });
  const out = await mkdtemp(path.join(os.tmpdir(), "dna-capture-"));

  try {
    const manifest = await captureSite({
      url: server.url,
      out,
      playwright: false,
      allowPrivateNetwork: true,
      timeout: 5000,
    });
    assert.equal(manifest.mode, "http-fetch");
    assert.equal(manifest.status, 200);
    assert.ok(manifest.warning.includes("Playwright"));
    const html = await readFile(path.join(out, "page.html"), "utf8");
    assert.ok(html.includes("<title>Test</title>"));
    const headers = JSON.parse(await readFile(path.join(out, "headers.json"), "utf8"));
    assert.equal(headers["content-type"], "text/html; charset=utf-8");
    assert.equal(headers["set-cookie"], "[redacted]");
    assert.equal(headers["x-visible"], "yes");
  } finally {
    await rm(out, { recursive: true, force: true });
    await server.close();
  }
});

test("rejects private network targets by default", async () => {
  const server = await startServer((_request, response) => {
    response.end("unexpected");
  });
  try {
    await assert.rejects(
      captureSite({ url: server.url, out: os.tmpdir(), playwright: false, timeout: 5000 }),
      /private address/,
    );
  } finally {
    await server.close();
  }
});

test("rejects responses above the byte limit", async () => {
  const server = await startServer((_request, response) => {
    response.writeHead(200, { "content-type": "text/html", "content-length": "100" });
    response.end("x".repeat(100));
  });
  const out = await mkdtemp(path.join(os.tmpdir(), "dna-capture-"));

  try {
    await assert.rejects(
      captureSite({
        url: server.url,
        out,
        playwright: false,
        allowPrivateNetwork: true,
        maxBytes: 10,
      }),
      /byte limit/,
    );
  } finally {
    await rm(out, { recursive: true, force: true });
    await server.close();
  }
});

test("rejects non-http URLs before making a request", async () => {
  await assert.rejects(
    captureSite({ url: "file:///etc/passwd", out: os.tmpdir(), playwright: false }),
    /http or https/,
  );
});

test("rejects URLs that contain credentials", async () => {
  await assert.rejects(
    captureSite({
      url: "https://user:secret@example.com",
      out: os.tmpdir(),
      playwright: false,
    }),
    /credentials/,
  );
});
