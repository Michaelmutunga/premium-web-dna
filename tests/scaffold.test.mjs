import test from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile, rm, stat, mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { scaffoldSkill } from "../scripts/scaffold-dna-skill.mjs";
import { validateSkillDir } from "../scripts/validate-dna-skill.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DNA_PATH = path.resolve(HERE, "..", "examples", "african-bison", "design-dna.json");

async function loadDna() {
  return JSON.parse(await readFile(DNA_PATH, "utf8"));
}

async function tempDir(prefix) {
  return mkdtemp(path.join(os.tmpdir(), prefix));
}

test("scaffolds a complete, valid design-DNA skill", async () => {
  const out = await tempDir("dna-scaffold-");
  try {
    const result = await scaffoldSkill({
      dna: await loadDna(),
      slug: "african-bison",
      name: "African Bison Classic Tours",
      out,
    });
    assert.equal(result.outDir, path.resolve(out));
    for (const file of [
      "SKILL.md",
      "design-dna.json",
      "ai-rules.json",
      "fingerprints.json",
      "references/components.md",
      "references/design-tokens.md",
      "templates/design-tokens.css",
    ]) {
      assert.ok((await stat(path.join(out, file))).isFile(), `${file} should exist`);
    }
    const skill = await readFile(path.join(out, "SKILL.md"), "utf8");
    assert.match(skill, /^---\r?\nname: african-bison-design-dna/m);
    assert.ok(!skill.includes("{{"));
    assert.ok(skill.includes("Explorer-Luxury"));
    const dna = JSON.parse(await readFile(path.join(out, "design-dna.json"), "utf8"));
    assert.equal(dna.meta.slug, "african-bison");
    assert.equal(dna._template, undefined);
    assert.equal(dna.fingerprint.density, "spacious");
    const ai = JSON.parse(await readFile(path.join(out, "ai-rules.json"), "utf8"));
    assert.equal(ai.source.slug, "african-bison");
    assert.deepEqual(ai.fingerprint, dna.fingerprint);
    const css = await readFile(path.join(out, "templates/design-tokens.css"), "utf8");
    assert.ok(css.includes("--color-clay: #b4552d;"));
    assert.ok(css.includes("--font-display"));
    assert.ok(css.includes("prefers-reduced-motion"));
    const accessibility = await readFile(path.join(out, "references/accessibility.md"), "utf8");
    assert.ok(accessibility.includes("inactive-tab-contrast"));
    assert.ok(accessibility.includes("hover-only-excerpts"));
    assert.ok(!accessibility.includes("[object Object]"));
    const provenance = await readFile(path.join(out, "references/provenance.md"), "utf8");
    assert.ok(provenance.includes("blocked"));
    assert.ok(provenance.includes("Image credits and licences are unresolved"));
    const validation = await validateSkillDir(out);
    assert.deepEqual(validation.errors, []);
    assert.equal(validation.ok, true);
  } finally {
    await rm(out, { recursive: true, force: true });
  }
});

test("refuses a non-empty directory unless forced, then regenerates cleanly", async () => {
  const out = await tempDir("dna-scaffold-force-");
  try {
    await writeFile(path.join(out, "keep.txt"), "keep", "utf8");
    await assert.rejects(
      scaffoldSkill({ dna: await loadDna(), slug: "african-bison", name: "African Bison", out }),
      /not empty/,
    );
    const result = await scaffoldSkill({
      dna: await loadDna(),
      slug: "african-bison",
      name: "African Bison",
      out,
      force: true,
    });
    assert.ok(result.outDir);
    await assert.rejects(stat(path.join(out, "keep.txt")), /ENOENT/);
  } finally {
    await rm(out, { recursive: true, force: true });
  }
});

test("rejects an evidence count that does not match the citations", async () => {
  const out = await tempDir("dna-scaffold-evidence-");
  try {
    const dna = await loadDna();
    dna.provenance.evidence_count = 999;
    await assert.rejects(
      scaffoldSkill({ dna, slug: "african-bison", name: "African Bison", out }),
      /structured citations total/,
    );
  } finally {
    await rm(out, { recursive: true, force: true });
  }
});

test("rejects invalid slugs and incomplete DNA", async () => {
  const out = await tempDir("dna-scaffold-invalid-");
  try {
    await assert.rejects(
      scaffoldSkill({ dna: await loadDna(), slug: "African Bison", name: "African Bison", out }),
      /slug must use/,
    );
    await assert.rejects(
      scaffoldSkill({ dna: { meta: {} }, slug: "african-bison", name: "African Bison", out }),
      /fingerprint/,
    );
  } finally {
    await rm(out, { recursive: true, force: true });
  }
});
