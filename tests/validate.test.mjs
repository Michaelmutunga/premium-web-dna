import test from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile, rm, rename, mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { scaffoldSkill } from "../scripts/scaffold-dna-skill.mjs";
import { validateSkillDir } from "../scripts/validate-dna-skill.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DNA_PATH = path.resolve(HERE, "..", "templates", "design-dna.json");

async function makeSkill(prefix) {
  const out = await mkdtemp(path.join(os.tmpdir(), prefix));
  const dna = JSON.parse(await readFile(DNA_PATH, "utf8"));
  await scaffoldSkill({ dna, slug: "african-bison", name: "African Bison", out, validate: false });
  return out;
}

test("passes a freshly scaffolded skill", async () => {
  const out = await makeSkill("dna-validate-ok-");
  try {
    const result = await validateSkillDir(out);
    assert.equal(result.ok, true);
    assert.deepEqual(result.errors, []);
    assert.equal(result.stats.components, 9);
    assert.ok(result.stats.lines > 0);
  } finally {
    await rm(out, { recursive: true, force: true });
  }
});

test("reports a missing required reference", async () => {
  const out = await makeSkill("dna-validate-missing-");
  try {
    await rename(path.join(out, "references/layout.md"), path.join(out, "references/layout.mdx"));
    const result = await validateSkillDir(out);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((error) => error.includes("Missing required file: references/layout.md")));
  } finally {
    await rm(out, { recursive: true, force: true });
  }
});

test("reports unresolved placeholders outside templates", async () => {
  const out = await makeSkill("dna-validate-placeholder-");
  try {
    await writeFile(path.join(out, "SKILL.md"), `${await readFile(path.join(out, "SKILL.md"), "utf8")}\n{{BAD}}\n`, "utf8");
    const result = await validateSkillDir(out);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((error) => error.includes("unresolved {{placeholders}}")));
  } finally {
    await rm(out, { recursive: true, force: true });
  }
});

test("reports a broken markdown link", async () => {
  const out = await makeSkill("dna-validate-link-");
  try {
    const file = path.join(out, "references/decision-rules.md");
    await writeFile(file, `${await readFile(file, "utf8")}\n[Missing](./missing.md)\n`, "utf8");
    const result = await validateSkillDir(out);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((error) => error.includes("broken link: ./missing.md")));
  } finally {
    await rm(out, { recursive: true, force: true });
  }
});

test("reports score total and band mismatches", async () => {
  const out = await makeSkill("dna-validate-score-");
  try {
    const file = path.join(out, "design-dna.json");
    const dna = JSON.parse(await readFile(file, "utf8"));
    dna.scores.total = 90;
    dna.scores.band = "Exceptional";
    await writeFile(file, `${JSON.stringify(dna, null, 2)}\n`, "utf8");
    const result = await validateSkillDir(out);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((error) => error.includes("scores.total")));
    assert.ok(result.errors.some((error) => error.includes("scores.band")));
  } finally {
    await rm(out, { recursive: true, force: true });
  }
});

test("reports a missing directory", async () => {
  const result = await validateSkillDir(path.join(os.tmpdir(), "dna-does-not-exist-12345"));
  assert.equal(result.ok, false);
  assert.match(result.errors[0], /does not exist/);
});
