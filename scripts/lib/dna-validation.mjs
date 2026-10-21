import { validateAgainstSchema } from "./json-schema.mjs";
import { structuredEvidenceCount } from "./dna-metrics.mjs";

export const FINGERPRINT_ENUMS = {
  density: ["compact", "balanced", "spacious", "editorial"],
  contrast: ["low", "medium", "high", "extreme"],
  motion_style: ["static", "subtle", "smooth", "cinematic", "expressive"],
  cta_style: ["direct", "confidence-based", "consultative", "urgency", "minimal"],
  card_style: ["flat", "bordered", "elevated", "editorial", "immersive"],
  navbar_style: ["solid", "transparent", "transparent-blur", "minimal", "masthead"],
};

export const FINGERPRINT_FIELDS = ["archetype", ...Object.keys(FINGERPRINT_ENUMS)];

const SCORE_MAXIMA = {
  visual_system: 20,
  ux_architecture: 15,
  typography: 10,
  spacing: 10,
  brand_distinction: 10,
  trust_signals: 10,
  motion: 10,
  accessibility: 5,
  performance: 5,
  content_quality: 5,
};

const BANDS = ["Exceptional", "Premium", "Professional", "Functional", "Weak"];

function bandFor(total) {
  if (total >= 90) return "Exceptional";
  if (total >= 80) return "Premium";
  if (total >= 70) return "Professional";
  if (total >= 60) return "Functional";
  return "Weak";
}

export function checkFingerprint(value, label, errors) {
  if (!value || typeof value !== "object") {
    errors.push(`${label} is missing`);
    return;
  }
  for (const field of FINGERPRINT_FIELDS) {
    if (typeof value[field] !== "string" || value[field].length === 0) {
      errors.push(`${label}.${field} must be a non-empty string`);
    }
  }
  for (const [field, allowed] of Object.entries(FINGERPRINT_ENUMS)) {
    if (typeof value[field] === "string" && !allowed.includes(value[field])) {
      errors.push(`${label}.${field} must be one of: ${allowed.join(", ")}`);
    }
  }
}

export function validateDnaDocument(dna, schema, label = "design-dna.json") {
  const errors = [];
  const warnings = [];
  const stats = { components: 0, evidence: 0 };

  if (!dna || typeof dna !== "object" || Array.isArray(dna)) {
    errors.push(`${label} must be an object`);
    return { errors, warnings, stats };
  }

  errors.push(...validateAgainstSchema(dna, schema).map((error) => `${label} schema ${error}`));
  if (dna.schema_version !== "1.0") errors.push(`${label} schema_version must be 1.0`);
  if (dna.framework !== "DNA Audit Framework v1") {
    errors.push(`${label} framework must be DNA Audit Framework v1`);
  }
  if (!dna.framework_version) errors.push(`${label} is missing framework_version`);
  if (!dna.meta || typeof dna.meta !== "object") {
    errors.push(`${label} is missing meta`);
  } else {
    for (const field of ["name", "slug", "version", "audited_at", "source", "confidence", "licence"]) {
      if (dna.meta[field] === undefined || dna.meta[field] === null || dna.meta[field] === "") {
        errors.push(`${label} meta.${field} is required`);
      }
    }
    if (typeof dna.meta.slug === "string" && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(dna.meta.slug)) {
      errors.push(`${label} meta.slug must use lowercase letters, numbers, and hyphens`);
    }
    if (typeof dna.meta.confidence === "number" && (dna.meta.confidence < 0 || dna.meta.confidence > 1)) {
      errors.push(`${label} meta.confidence must be between 0 and 1`);
    }
  }

  checkFingerprint(dna.fingerprint, `${label} fingerprint`, errors);
  if (!dna.archetype?.primary) {
    errors.push(`${label} archetype.primary is required`);
  } else {
    if (!Array.isArray(dna.archetype.evidence) || dna.archetype.evidence.length === 0) {
      errors.push(`${label} archetype.evidence must contain at least one citation`);
    }
    if (dna.fingerprint?.archetype && dna.archetype.secondary) {
      const expected = `${dna.archetype.primary}-${dna.archetype.secondary}`;
      if (dna.fingerprint.archetype !== expected) {
        warnings.push(`fingerprint.archetype is "${dna.fingerprint.archetype}" but archetype implies "${expected}"`);
      }
    }
  }

  if (!dna.tokens || typeof dna.tokens !== "object") {
    errors.push(`${label} tokens is required`);
  }

  if (!Array.isArray(dna.components) || dna.components.length === 0) {
    errors.push(`${label} must contain at least one component`);
  } else {
    stats.components = dna.components.length;
    const seen = new Set();
    for (const [index, component] of dna.components.entries()) {
      const componentLabel = `components[${index}]`;
      if (!component.id) errors.push(`${componentLabel}.id is required`);
      else if (seen.has(component.id)) errors.push(`${componentLabel}.id is duplicated: ${component.id}`);
      else seen.add(component.id);
      if (!component.component) errors.push(`${componentLabel}.component is required`);
      if (!component.variant) errors.push(`${componentLabel}.variant is required`);
      if (typeof component.confidence !== "number" || component.confidence < 0 || component.confidence > 1) {
        errors.push(`${componentLabel}.confidence must be a number between 0 and 1`);
      }
      if (!Array.isArray(component.evidence) || component.evidence.length === 0) {
        errors.push(`${componentLabel}.evidence must contain at least one citation`);
      } else {
        stats.evidence += component.evidence.length;
        for (const citation of component.evidence) {
          if (typeof citation !== "string" || citation.trim().length === 0) {
            errors.push(`${componentLabel}.evidence entries must be non-empty strings`);
          }
        }
      }
      if (component.confidence < 0.5) {
        warnings.push(`${componentLabel} (${component.id}) has confidence below 0.50 and must not drive generation`);
      }
    }
  }

  if (!Array.isArray(dna.pages) || dna.pages.length === 0) {
    errors.push(`${label} must contain at least one page recipe`);
  }

  if (!dna.rules || !Array.isArray(dna.rules.do) || !Array.isArray(dna.rules.dont)) {
    errors.push(`${label} rules.do and rules.dont must be arrays`);
  }

  if (!dna.scores || typeof dna.scores !== "object") {
    errors.push(`${label} scores is required`);
  } else {
    const categories = dna.scores.categories ?? {};
    let totalMax = 0;
    let totalScore = 0;
    for (const [name, max] of Object.entries(SCORE_MAXIMA)) {
      const category = categories[name];
      if (!category) {
        errors.push(`scores.categories.${name} is required`);
        continue;
      }
      if (category.max !== max) errors.push(`scores.categories.${name}.max must be ${max}`);
      if (!Number.isInteger(category.score) || category.score < 0 || category.score > max) {
        errors.push(`scores.categories.${name}.score must be an integer between 0 and ${max}`);
      }
      totalMax += max;
      totalScore += Number(category.score) || 0;
    }
    if (totalMax !== 100) errors.push(`Score maxima must total 100 (found ${totalMax})`);
    if (dna.scores.total !== totalScore) {
      errors.push(`scores.total is ${dna.scores.total} but categories total ${totalScore}`);
    }
    const expectedBand = bandFor(totalScore);
    if (dna.scores.band !== expectedBand) {
      errors.push(`scores.band is "${dna.scores.band}" but ${totalScore} is "${expectedBand}"`);
    }
    if (!BANDS.includes(dna.scores.band)) {
      errors.push(`scores.band must be one of: ${BANDS.join(", ")}`);
    }
  }

  if (!dna.provenance || typeof dna.provenance !== "object") {
    errors.push(`${label} provenance is required`);
  } else {
    if (!dna.provenance.source) errors.push(`${label} provenance.source is required`);
    if (!dna.provenance.licence) errors.push(`${label} provenance.licence is required`);
    if (!Number.isInteger(dna.provenance.evidence_count)) {
      errors.push(`${label} provenance.evidence_count must be an integer`);
    } else {
      const computed = structuredEvidenceCount(dna);
      if (dna.provenance.evidence_count !== computed) {
        errors.push(
          `${label} provenance.evidence_count is ${dna.provenance.evidence_count} but structured citations total ${computed}`,
        );
      }
    }
    if (dna.provenance.status === "released") {
      const openP0 = (dna.accessibility?.issues ?? []).filter(
        (issue) => issue.severity === "P0" && issue.status === "open",
      );
      if (openP0.length > 0) {
        errors.push(
          `${label} provenance.status cannot be released while P0 issues are open: ${openP0.map((issue) => issue.id).join(", ")}`,
        );
      }
      if ((dna.provenance.publication_blockers ?? []).length > 0) {
        errors.push(`${label} provenance.status released cannot have publication_blockers`);
      }
    }
    if (dna.provenance.status === "blocked" && (dna.provenance.publication_blockers ?? []).length === 0) {
      errors.push(`${label} provenance.status blocked requires at least one publication_blocker`);
    }
  }

  const placeholderPattern = /\b(?:unknown|see provenance|todo|tbd|lorem ipsum)\b/i;
  for (const [field, value] of [
    ["meta.source", dna.meta?.source],
    ["meta.licence", dna.meta?.licence],
    ["provenance.source", dna.provenance?.source],
    ["provenance.licence", dna.provenance?.licence],
  ]) {
    if (typeof value === "string" && placeholderPattern.test(value)) {
      errors.push(`${label} ${field} contains placeholder text: ${value}`);
    }
  }

  for (const [name, category] of Object.entries(dna.scores?.categories ?? {})) {
    if (category.max > 0 && category.score < category.max && !String(category.note ?? "").trim()) {
      errors.push(`scores.categories.${name}.note is required when the category is below its maximum`);
    }
  }

  return { errors, warnings, stats };
}
