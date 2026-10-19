import test from "node:test";
import assert from "node:assert/strict";
import { assess, composite, contrastRatio, parseColor, rateContrast } from "../scripts/contrast.mjs";

test("parses hex, short hex, and rgb colours", () => {
  assert.deepEqual(parseColor("#000"), { r: 0, g: 0, b: 0, a: 1 });
  assert.deepEqual(parseColor("#fff"), { r: 255, g: 255, b: 255, a: 1 });
  assert.deepEqual(parseColor("#b4552d"), { r: 180, g: 85, b: 45, a: 1 });
  assert.deepEqual(parseColor("rgb(20, 18, 15)"), { r: 20, g: 18, b: 15, a: 1 });
});

test("black on white is 21:1 and identical colours are 1:1", () => {
  assert.equal(Number(contrastRatio("#000", "#fff").toFixed(2)), 21);
  assert.equal(Number(contrastRatio("#14120f", "#14120f").toFixed(2)), 1);
});

test("contrast is independent of argument order", () => {
  const a = contrastRatio("#14120f", "#faf7f1");
  const b = contrastRatio("#faf7f1", "#14120f");
  assert.equal(Number(a.toFixed(4)), Number(b.toFixed(4)));
});

test("the African Bison body pair passes AAA", () => {
  const result = assess("#14120f", "#faf7f1");
  assert.ok(result.ratio > 17);
  assert.equal(result.aaaNormal, true);
  assert.equal(result.aaNormal, true);
});

test("composites translucent foreground over a background", () => {
  const mixed = composite({ r: 0, g: 0, b: 0, a: 0.5 }, { r: 255, g: 255, b: 255, a: 1 });
  assert.deepEqual(mixed, { r: 127.5, g: 127.5, b: 127.5, a: 1 });
});

test("rates a ratio at the correct thresholds", () => {
  assert.deepEqual(rateContrast(4.5), {
    ratio: 4.5,
    aaNormal: true,
    aaLarge: true,
    aaaNormal: false,
    aaaLarge: true,
  });
  assert.equal(rateContrast(2.9).aaNormal, false);
  assert.equal(rateContrast(7).aaaNormal, true);
});

test("rejects unsupported colours", () => {
  assert.throws(() => parseColor("not-a-colour"), /Unsupported colour/);
  assert.throws(() => parseColor("#12"), /Invalid hex colour/);
  assert.throws(() => parseColor(123), /must be a string/);
});
