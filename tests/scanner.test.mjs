import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { parseDesignText, scanRepo } from "../scripts/scan-design-signals.mjs";

const CSS = `:root {
  --clay: #b4552d;
  --font-display: "Fraunces", serif;
  --radius-card: 2px;
  --space-section: 80px;
}

body {
  font-family: "Inter", sans-serif;
  border-radius: 2px;
  background: linear-gradient(90deg, #000, #fff);
  box-shadow: 0 10px 30px rgb(14 13 11 / 0.12);
  transition: color 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

@media (min-width: 768px) {
  .grid { display: grid; z-index: 40; }
}

@keyframes rise {
  from { opacity: 0; }
  to { opacity: 1; }
}
`;

test("extracts tokens and evidence from CSS", () => {
  const result = parseDesignText(CSS, "app/globals.css");
  const colors = result.colors.map((entry) => entry.value);
  assert.ok(colors.includes("#b4552d"));
  assert.ok(colors.includes("rgb(14 13 11 / 0.12)"));
  assert.ok(result.custom_properties.some((entry) => entry.name === "--clay"));
  assert.ok(result.fonts.some((entry) => entry.value.includes("Inter")));
  assert.ok(result.radii.some((entry) => entry.value === "2px"));
  assert.deepEqual(result.breakpoints, ["768px"]);
  assert.ok(result.motion.easings.some((entry) => entry.value.includes("cubic-bezier")));
  assert.ok(!result.motion.easings.some((entry) => entry.value === "linear"));
  assert.ok(result.motion.durations.some((entry) => entry.value === "0.35s"));
  assert.ok(result.motion.keyframes.some((entry) => entry.value === "rise"));
  assert.ok(result.spacing.some((entry) => entry.name === "--space-section"));
  assert.ok(result.z_index.some((entry) => entry.value === "40"));
  assert.equal(result.colors[0].evidence[0].file, "app/globals.css");
  assert.equal(result.colors[0].evidence[0].line, 2);
});

test("scans a repository, skips ignored folders, and keeps relative evidence", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "dna-scan-"));
  try {
    await mkdir(path.join(root, "app"), { recursive: true });
    await mkdir(path.join(root, "node_modules"), { recursive: true });
    await writeFile(path.join(root, "app", "globals.css"), CSS, "utf8");
    await writeFile(path.join(root, "node_modules", "skip.css"), ":root { --clay: #ff0000; }", "utf8");
    await writeFile(path.join(root, "app", "page.tsx"), "export default function Page() { return <main />; }", "utf8");

    const result = await scanRepo(root);
    assert.equal(result.files_scanned, 2);
    assert.ok(result.summary.colors > 0);
    assert.ok(result.tokens.colors.every((entry) => entry.evidence.every((item) => !item.file.startsWith("node_modules"))));
    assert.equal(result.repo, path.resolve(root).replaceAll("\\", "/"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("caps evidence and tolerates an empty tree", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "dna-scan-empty-"));
  try {
    const result = await scanRepo(root);
    assert.equal(result.files_scanned, 0);
    assert.deepEqual(result.tokens.colors, []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
