import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import { validateAgainstSchema } from "../scripts/lib/json-schema.mjs";
import { buildAiLayer, buildFingerprints } from "../scripts/compile-ai-layer.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");

async function readJson(relative) {
  return JSON.parse(await readFile(path.join(ROOT, relative), "utf8"));
}

function ajvValidator(schema) {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  return ajv.compile(schema);
}

test("the example DNA passes both the schema and the internal validator", async () => {
  const schema = await readJson("templates/design-dna.schema.json");
  const dna = await readJson("examples/african-bison/design-dna.json");
  const validate = ajvValidator(schema);
  assert.equal(validate(dna), true, JSON.stringify(validate.errors, null, 2));
  assert.deepEqual(validateAgainstSchema(dna, schema), []);
});

test("schema and internal validator agree on broken DNA", async () => {
  const schema = await readJson("templates/design-dna.schema.json");
  const dna = await readJson("examples/african-bison/design-dna.json");
  const validate = ajvValidator(schema);

  const cases = [
    (copy) => delete copy.meta.name,
    (copy) => delete copy.accessibility,
    (copy) => {
      copy.fingerprint.density = "airy";
    },
    (copy) => {
      copy.components[0].evidence = [];
    },
    (copy) => {
      copy.scores.categories.accessibility.score = -1;
    },
  ];

  for (const mutate of cases) {
    const copy = structuredClone(dna);
    mutate(copy);
    assert.equal(validate(copy), false, "Ajv should reject the mutation");
    assert.ok(validateAgainstSchema(copy, schema).length > 0, "internal validator should reject the mutation");
  }
});

test("compilation rejects missing evidence instead of inventing defaults", async () => {
  const dna = await readJson("examples/african-bison/design-dna.json");
  const noHero = structuredClone(dna);
  delete noHero.rules.hero;
  assert.throws(() => buildAiLayer(noHero), /rules\.hero is required/);

  const noEasing = structuredClone(dna);
  delete noEasing.rules.motion_easing;
  delete noEasing.tokens.motion.easings;
  assert.throws(() => buildAiLayer(noEasing), /motion_easing is required/);

  const noFramework = structuredClone(dna);
  delete noFramework.framework;
  assert.throws(() => buildFingerprints(noFramework), /framework must be/);
});

test("compiled AI rules and fingerprints pass their schemas", async () => {
  const dna = await readJson("examples/african-bison/design-dna.json");
  const aiRules = buildAiLayer(dna);
  const fingerprints = buildFingerprints(dna);
  const aiSchema = await readJson("templates/ai-rules.schema.json");
  const fingerprintSchema = await readJson("templates/fingerprints.schema.json");

  assert.equal(ajvValidator(aiSchema)(aiRules), true);
  assert.deepEqual(validateAgainstSchema(aiRules, aiSchema), []);
  assert.equal(ajvValidator(fingerprintSchema)(fingerprints), true);
  assert.deepEqual(validateAgainstSchema(fingerprints, fingerprintSchema), []);
});
