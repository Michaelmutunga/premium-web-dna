import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mergeDna } from "../scripts/merge-dna.mjs";
import { scaffoldSkill } from "../scripts/scaffold-dna-skill.mjs";
import { validateSkillDir } from "../scripts/validate-dna-skill.mjs";
import { structuredEvidenceCount } from "../scripts/lib/dna-metrics.mjs";
import { validateAgainstSchema } from "../scripts/lib/json-schema.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const DNA_PATH = path.join(ROOT, "examples", "african-bison", "design-dna.json");
const SCHEMA_PATH = path.join(ROOT, "templates", "design-dna.schema.json");

async function loadBase() {
  return JSON.parse(await readFile(DNA_PATH, "utf8"));
}

function makeOther(base) {
  const other = structuredClone(base);
  other.meta.name = "Bison Noir";
  other.meta.slug = "bison-noir";
  other.meta.confidence = 0.7;
  other.meta.source = "https://example.com/bison-noir";
  other.meta.restrictions = ["Noir assets require approval."];
  other.fingerprint.density = "compact";
  other.fingerprint.contrast = "extreme";
  other.tokens.colors.clay = { value: "#aa0000", role: "alternate accent", evidence: ["noir.css:3"] };
  other.components[0].confidence = 0.8;
  other.components[0].evidence.push("noir.css:10");
  other.components.push({
    id: "journal-card",
    component: "JournalCard",
    variant: "editorial",
    confidence: 0.7,
    evidence: ["noir.css:20"],
    anatomy: ["media", "title"],
    states: ["default"],
    responsive: "one column",
    tokens: ["ivory", "ink"],
    accessibility: "title link",
    motion: "none",
  });
  other.pages.push({ type: "journal", sections: ["hero", "journal-grid"], rules: ["index only"] });
  other.scores.categories.visual_system.score = 14;
  other.scores.total = 84;
  other.scores.band = "Premium";
  other.provenance.evidence_count = structuredEvidenceCount(other);
  return other;
}

test("inherit keeps the base identity and fills gaps", async () => {
  const base = await loadBase();
  const other = makeOther(base);
  const merged = mergeDna(base, other, { mode: "inherit" });
  assert.equal(merged.fingerprint.density, "spacious");
  assert.equal(merged.fingerprint.contrast, "high");
  assert.equal(merged.tokens.colors.clay.value, "#b4552d");
  assert.equal(merged.components.find((component) => component.id === "journal-card").variant, "editorial");
  assert.ok(merged.merge_report.conflicts.length > 0);
  assert.equal(merged.merge_report.mode, "inherit");
});

test("blend keeps tokens discrete and records aliases", async () => {
  const base = await loadBase();
  const other = makeOther(base);
  const merged = mergeDna(base, other, { mode: "blend" });
  assert.equal(merged.fingerprint.density, "spacious");
  assert.equal(merged.fingerprint.contrast, "high");
  assert.equal(merged.tokens.colors.clay.value, "#b4552d");
  assert.deepEqual(merged.tokens.aliases["colors.clay"], {
    base: "#b4552d",
    other: "#aa0000",
    resolution: "#b4552d",
  });
  assert.equal(merged.components.length, base.components.length + 1);
  assert.ok(merged.meta.restrictions.includes("Noir assets require approval."));
  assert.equal(merged.meta.source, "https://github.com/Michaelmutunga/African-Bison-Classic-Tours- + https://example.com/bison-noir");
  assert.ok(merged.merge_report.conflicts.some((conflict) => conflict.path === "fingerprint.density"));
  assert.ok(merged.merge_report.inputs.every((input) => /^[a-f0-9]{64}$/.test(input.sha256)));
});

test("synthesize uses confidence weights and combines component confidence", async () => {
  const base = await loadBase();
  const other = makeOther(base);
  other.archetype.secondary = "Editorial";
  const merged = mergeDna(base, other, { mode: "synthesize", baseWeight: 0.9, otherWeight: 0.95 });
  assert.equal(merged.archetype.secondary, "Editorial");
  assert.equal(merged.fingerprint.archetype, "Explorer-Editorial");
  assert.equal(merged.fingerprint.density, "compact");
  assert.equal(merged.tokens.colors.clay.value, "#aa0000");
  const hero = merged.components.find((component) => component.id === "hero-editorial");
  assert.equal(hero.confidence, 0.99);
  assert.ok(hero.evidence.includes("noir.css:10"));
  assert.equal(merged.merge_report.weights.base, 0.9);
  assert.equal(merged.merge_report.weights.other, 0.95);
  for (const category of Object.values(merged.scores.categories)) {
    assert.ok(Number.isInteger(category.score));
  }
  assert.ok(Number.isInteger(merged.scores.total));
});

test("keeps lineage across repeated overlays", async () => {
  const base = await loadBase();
  const other = makeOther(base);
  const third = makeOther(base);
  third.meta.name = "Bison Ink";
  third.meta.slug = "bison-ink";
  third.meta.source = "https://example.com/bison-ink";
  const first = mergeDna(base, other, { mode: "blend" });
  const second = mergeDna(first, third, { mode: "blend" });
  assert.equal(second.provenance.parents.length, 3);
  assert.equal(second.merge_report.inputs.length, 3);
  assert.equal(new Set(second.merge_report.inputs.map((input) => input.sha256)).size, 3);
});

test("scores are recomputed and the band follows the total", async () => {
  const base = await loadBase();
  const other = makeOther(base);
  const merged = mergeDna(base, other, { mode: "blend" });
  const sum = Object.values(merged.scores.categories).reduce((total, category) => total + category.score, 0);
  assert.equal(merged.scores.total, Number(sum.toFixed(1)));
  if (merged.scores.total >= 90) assert.equal(merged.scores.band, "Exceptional");
  else if (merged.scores.total >= 80) assert.equal(merged.scores.band, "Premium");
  else if (merged.scores.total >= 70) assert.equal(merged.scores.band, "Professional");
  else if (merged.scores.total >= 60) assert.equal(merged.scores.band, "Functional");
  else assert.equal(merged.scores.band, "Weak");
});

test("does not mutate either input", async () => {
  const base = await loadBase();
  const other = makeOther(base);
  const baseBefore = structuredClone(base);
  const otherBefore = structuredClone(other);
  mergeDna(base, other, { mode: "blend" });
  assert.deepEqual(base, baseBefore);
  assert.deepEqual(other, otherBefore);
});

test("custom name and slug override the defaults", async () => {
  const base = await loadBase();
  const other = makeOther(base);
  const merged = mergeDna(base, other, { mode: "inherit", name: "Bison Family", slug: "bison-family" });
  assert.equal(merged.meta.name, "Bison Family");
  assert.equal(merged.meta.slug, "bison-family");
  assert.equal(merged.schema_version, "1.0");
  assert.equal(merged.framework, "DNA Audit Framework v1");
});

test("rejects an unknown mode", async () => {
  const base = await loadBase();
  const other = makeOther(base);
  assert.throws(() => mergeDna(base, other, { mode: "replace" }), /mode must be one of/);
});

test("rejects inputs without accessibility evidence", async () => {
  const base = await loadBase();
  const other = makeOther(base);
  delete other.accessibility;
  assert.throws(() => mergeDna(base, other, { mode: "blend" }), /accessibility/);
});

test("rejects inputs without a WCAG level", async () => {
  const base = await loadBase();
  const other = makeOther(base);
  delete other.accessibility.wcag_level;
  assert.throws(() => mergeDna(base, other, { mode: "blend" }), /wcag_level/);
});

test("rejects an invalid base before merging", async () => {
  const base = await loadBase();
  const other = makeOther(base);
  base.meta.licence = "";
  assert.throws(
    () => mergeDna(base, other, { mode: "blend" }),
    /base DNA is invalid:[\s\S]*meta\.licence is required/,
  );
});

test("rejects an invalid overlay before merging", async () => {
  const base = await loadBase();
  const other = makeOther(base);
  other.scores.total += 1;
  assert.throws(
    () => mergeDna(base, other, { mode: "blend" }),
    /other DNA is invalid:[\s\S]*scores\.total/,
  );
});

test("rejects an invalid merged result", async () => {
  const base = await loadBase();
  const other = makeOther(base);
  assert.throws(
    () => mergeDna(base, other, { mode: "blend", slug: "Invalid Slug" }),
    /merged DNA is invalid:[\s\S]*meta\.slug/,
  );
});

test("merged output scaffolds into a valid skill", async () => {
  const base = await loadBase();
  const other = makeOther(base);
  const merged = mergeDna(base, other, { mode: "blend" });
  const out = await mkdtemp(path.join(os.tmpdir(), "dna-merge-skill-"));
  try {
    await scaffoldSkill({
      dna: merged,
      slug: merged.meta.slug,
      name: merged.meta.name,
      out,
      validate: false,
    });
    const result = await validateSkillDir(out);
    assert.equal(result.ok, true);
    assert.deepEqual(result.errors, []);
  } finally {
    await rm(out, { recursive: true, force: true });
  }
});

test("merged output carries accessibility, status, and a matching evidence count", async () => {
  const base = await loadBase();
  const other = makeOther(base);
  other.accessibility.issues.find((issue) => issue.id === "inactive-tab-contrast").status = "resolved";
  const merged = mergeDna(base, other, { mode: "blend" });
  assert.equal(merged.accessibility.wcag_level, "AA");
  assert.equal(
    merged.accessibility.issues.find((issue) => issue.id === "inactive-tab-contrast").status,
    "open",
  );
  assert.equal(merged.provenance.status, "blocked");
  assert.ok(
    merged.provenance.publication_blockers.some((blocker) =>
      blocker.includes("Image credits and licences are unresolved"),
    ),
  );
  assert.equal(merged.provenance.evidence_count, structuredEvidenceCount(merged));
  const schema = JSON.parse(await readFile(SCHEMA_PATH, "utf8"));
  const errors = [];
  validateAgainstSchema(merged, schema, "$", errors);
  assert.deepEqual(errors, []);
});
