import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mergeDna } from "../scripts/merge-dna.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DNA_PATH = path.resolve(HERE, "..", "templates", "design-dna.json");

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
