#!/usr/bin/env node
import { readFile, writeFile, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildAiLayer, buildFingerprints } from "./compile-ai-layer.mjs";
import { validateSkillDir } from "./validate-dna-skill.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = path.resolve(SCRIPT_DIR, "..");
const TEMPLATE_DIR = path.join(SKILL_ROOT, "templates");

const FINGERPRINT_FIELDS = [
  "archetype",
  "density",
  "contrast",
  "motion_style",
  "cta_style",
  "card_style",
  "navbar_style",
];

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripPrivate(value) {
  if (Array.isArray(value)) return value.map(stripPrivate);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !key.startsWith("_"))
      .map(([key, entry]) => [key, stripPrivate(entry)]),
  );
}

function normaliseDna(input, { slug, name }) {
  if (!input || typeof input !== "object") throw new Error("DNA must be an object");
  const dna = stripPrivate(structuredClone(input));
  dna.schema_version ??= "1.0";
  dna.framework ??= "DNA Audit Framework v1";
  dna.framework_version ??= "1.0.0";
  dna.meta ??= {};
  dna.meta.name = name;
  dna.meta.slug = slug;
  dna.meta.version ??= "1.0.0";
  dna.meta.audited_at ??= new Date().toISOString().slice(0, 10);
  dna.meta.confidence ??= 0.8;
  dna.meta.source ??= "unknown";
  dna.meta.licence ??= "See provenance";
  if (!dna.fingerprint || typeof dna.fingerprint !== "object") {
    throw new Error("DNA is missing fingerprint");
  }
  for (const field of FINGERPRINT_FIELDS) {
    if (typeof dna.fingerprint[field] !== "string" || dna.fingerprint[field].length === 0) {
      throw new Error(`fingerprint.${field} must be a non-empty string`);
    }
  }
  if (!Array.isArray(dna.components) || dna.components.length === 0) {
    throw new Error("DNA must contain at least one component");
  }
  for (const [index, component] of dna.components.entries()) {
    if (!component.id || !component.component || !component.variant) {
      throw new Error(`components[${index}] requires id, component, and variant`);
    }
    if (typeof component.confidence !== "number") {
      throw new Error(`components[${index}].confidence must be a number`);
    }
    if (!Array.isArray(component.evidence) || component.evidence.length === 0) {
      throw new Error(`components[${index}].evidence must contain at least one citation`);
    }
  }
  if (!Array.isArray(dna.pages) || dna.pages.length === 0) {
    throw new Error("DNA must contain at least one page recipe");
  }
  dna.rules ??= {};
  dna.rules.do ??= [];
  dna.rules.dont ??= [];
  dna.rules.max_font_families ??= dna.tokens?.typography?.families?.length ?? 2;
  dna.rules.accent_budget_per_viewport ??= 5;
  dna.rules.corner_radius ??= dna.tokens?.radii?.default ?? "0";
  dna.rules.motion_easing ??=
    dna.tokens?.motion?.easings?.[Object.keys(dna.tokens?.motion?.easings ?? {})[0]] ?? "ease";
  dna.rules.hero ??= {
    preferred_variant:
      dna.components.find((component) => /hero/i.test(component.component))?.variant ?? "editorial",
    headline_length: "8-16 words",
    cta_count: 2,
  };
  dna.provenance ??= {
    source: dna.meta.source,
    licence: dna.meta.licence,
    evidence_count: dna.components.reduce((sum, component) => sum + component.evidence.length, 0),
    notes: "",
  };
  dna.provenance.evidence_count ??= dna.components.reduce(
    (sum, component) => sum + component.evidence.length,
    0,
  );
  return dna;
}

async function loadTemplate(name) {
  return readFile(path.join(TEMPLATE_DIR, name), "utf8");
}

function escapeCss(value) {
  return String(value).replace(/[{};]/g, "").trim();
}

function tokenValue(value) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return value.value ?? value.hex ?? "";
  return String(value);
}

function renderTokensCss(dna) {
  const colors = dna.tokens?.colors ?? {};
  const families = dna.tokens?.typography?.families ?? [];
  const spacing = dna.tokens?.spacing ?? {};
  const radii = dna.tokens?.radii ?? {};
  const easings = dna.tokens?.motion?.easings ?? {};
  const durations = dna.tokens?.motion?.durations ?? {};
  const lines = [
    "/*",
    ` * ${dna.meta.name} design tokens`,
    " * Generated from design-dna.json. Do not add values by hand.",
    " */",
    "",
    ":root {",
    "  /* Colour */",
  ];
  for (const [name, value] of Object.entries(colors)) {
    lines.push(`  --color-${slugify(name)}: ${escapeCss(tokenValue(value))};`);
  }
  lines.push("", "  /* Typography */");
  for (const family of families) {
    const variable = family.variable?.startsWith("--") ? family.variable : `--font-${slugify(family.role ?? family.name)}`;
    const fallback = /serif/i.test(family.name) ? "serif" : "sans-serif";
    lines.push(`  ${variable}: "${family.name}", ${fallback};`);
  }
  lines.push("", "  /* Spacing */");
  if (spacing.base) lines.push(`  --space-base: ${escapeCss(spacing.base)};`);
  for (const [name, value] of Object.entries(spacing)) {
    if (name === "base" || name === "scale") continue;
    if (typeof value === "string") lines.push(`  --space-${slugify(name)}: ${escapeCss(value)};`);
  }
  if (Array.isArray(spacing.scale)) {
    spacing.scale.forEach((value, index) => {
      lines.push(`  --space-step-${index + 1}: ${escapeCss(value)};`);
    });
  }
  lines.push("", "  /* Shape */");
  for (const [name, value] of Object.entries(radii)) {
    lines.push(`  --radius-${slugify(name)}: ${escapeCss(value)};`);
  }
  lines.push("", "  /* Motion */");
  for (const [name, value] of Object.entries(easings)) {
    lines.push(`  --ease-${slugify(name)}: ${escapeCss(value)};`);
  }
  for (const [name, value] of Object.entries(durations)) {
    lines.push(`  --duration-${slugify(name)}: ${escapeCss(value)};`);
  }
  lines.push("}", "", "@media (prefers-reduced-motion: reduce) {");
  lines.push("  *,", "  *::before,", "  *::after {");
  lines.push("    animation-duration: 0.01ms !important;");
  lines.push("    transition-duration: 0.01ms !important;");
  lines.push("  }", "}", "");
  return lines.join("\n");
}

function table(headers, rows) {
  const head = `| ${headers.join(" | ")} |`;
  const divider = `| ${headers.map(() => "---").join(" | ")} |`;
  return [head, divider, ...rows.map((row) => `| ${row.join(" | ")} |`)].join("\n");
}

function renderDesignTokensMd(dna) {
  const colors = Object.entries(dna.tokens?.colors ?? {}).map(([name, value]) => {
    const entry = typeof value === "object" ? value : { value };
    return [name, entry.value ?? "", entry.role ?? "", (entry.evidence ?? []).join(", ") || "See provenance"];
  });
  const radii = Object.entries(dna.tokens?.radii ?? {}).map(([name, value]) => [name, value]);
  const spacing = dna.tokens?.spacing ?? {};
  const spacingScale = Array.isArray(spacing.scale) ? spacing.scale : [];
  const easings = Object.entries(dna.tokens?.motion?.easings ?? {}).map(([name, value]) => [name, value]);
  const durations = Object.entries(dna.tokens?.motion?.durations ?? {}).map(([name, value]) => [name, value]);
  const aliases = Object.entries(dna.tokens?.aliases ?? {}).map(([name, value]) => [
    name,
    value.base ?? "",
    value.other ?? "",
    value.resolution ?? "",
  ]);
  return `# Design Tokens - ${dna.meta.name}

## Colour

${colors.length ? table(["Token", "Value", "Role", "Evidence"], colors) : "No colour tokens recorded."}

## Spacing

${table(["Key", "Value"], Object.entries(spacing).filter(([, value]) => typeof value === "string").map(([key, value]) => [key, value]))}

${spacingScale.length ? table(["Step", "Value"], spacingScale.map((value, index) => [index + 1, value])) : ""}

## Radii

${radii.length ? table(["Token", "Value"], radii) : "No radius tokens recorded."}

## Motion

${easings.length ? table(["Easing", "Value"], easings) : "No easing tokens recorded."}

${durations.length ? table(["Duration", "Value"], durations) : "No duration tokens recorded."}

${aliases.length ? `## Merge aliases\n\n${table(["Token", "Base", "Overlay", "Resolution"], aliases)}\n` : ""}

## Rules

- Use only the tokens above.
- Do not add a colour, radius, or motion curve because a page needs one.
- Media scrims are allowed over photography and video only.
`;
}

function renderTypographyMd(dna) {
  const families = (dna.tokens?.typography?.families ?? []).map((family) => [
    family.name,
    family.variable ?? "",
    family.role ?? "",
  ]);
  const scale = (dna.tokens?.typography?.scale ?? []).map((step) => [
    step.name,
    step.size ?? "",
    step.line_height ?? "",
    step.tracking ?? "",
    step.weight ?? "",
    step.use ?? "",
  ]);
  return `# Typography - ${dna.meta.name}

## Families

${families.length ? table(["Family", "Variable", "Role"], families) : "No families recorded."}

## Scale

${scale.length ? table(["Utility", "Size", "Line height", "Tracking", "Weight", "Use"], scale) : "No scale recorded."}

## Rules

- Use the extracted families only.
- Keep the reading measure at the extracted value.
- Use uppercase for labels and display only.
- Use tabular numerals for prices, dates, and counts.
- Use the display family for naming and the sans family for facts.
`;
}

function renderLayoutMd(dna) {
  const surfaces = (dna.surfaces ?? []).map((surface) => [
    surface.name,
    surface.token,
    surface.text_token,
    surface.role,
  ]);
  const pages = (dna.pages ?? []).map((page) => [page.type, (page.sections ?? []).join(" -> ")]);
  return `# Layout - ${dna.meta.name}

## Surfaces

${surfaces.length ? table(["Surface", "Token", "Text token", "Role"], surfaces) : "No surfaces recorded."}

## Spacing

${table(["Key", "Value"], Object.entries(dna.tokens?.spacing ?? {}).filter(([, value]) => typeof value === "string").map(([key, value]) => [key, value]))}

## Breakpoints

${table(["Name", "Value"], Object.entries(dna.tokens?.breakpoints ?? {}).map(([key, value]) => [key, value]))}

## Page sequences

${pages.length ? table(["Page", "Section order"], pages) : "No page recipes recorded."}

## Rules

- Alternate surface tones to mark narrative chapters.
- Do not place two dark chapters next to each other unless the DNA says so.
- Keep the reading measure from the typography reference.
- Recompose for mobile; do not hide essential content.
`;
}

function renderComponentsMd(dna) {
  const rows = dna.components.map((component) => [
    component.id,
    component.component,
    component.variant,
    component.confidence,
    component.evidence.join(", "),
  ]);
  const details = dna.components
    .map(
      (component) => `## ${component.component} - ${component.variant}

- ID: \`${component.id}\`
- Confidence: \`${component.confidence}\`
- Evidence: ${component.evidence.join(", ")}
- Anatomy: ${(component.anatomy ?? []).join(", ") || "Not recorded"}
- States: ${(component.states ?? []).join(", ") || "Not recorded"}
- Responsive: ${component.responsive ?? "Not recorded"}
- Tokens: ${(component.tokens ?? []).join(", ") || "Not recorded"}
- Accessibility: ${component.accessibility ?? "Not recorded"}
- Motion: ${component.motion ?? "Not recorded"}
`,
    )
    .join("\n");
  return `# Components - ${dna.meta.name}

## Inventory

${table(["ID", "Component", "Variant", "Confidence", "Evidence"], rows)}

## Detail

${details}

## Matching rules

- Use the highest-confidence variant that fits the section role.
- If confidence is below \`0.50\`, do not use it as extracted DNA; compose from primitives and record the assumption.
- Never add a new visual language to make a section fit.
`;
}

function renderMotionMd(dna) {
  const motion = dna.tokens?.motion ?? {};
  const easings = Object.entries(motion.easings ?? {}).map(([name, value]) => [name, value]);
  const durations = Object.entries(motion.durations ?? {}).map(([name, value]) => [name, value]);
  const exceptions = Object.entries(motion.exceptions ?? {}).map(([name, value]) => [name, value]);
  return `# Motion - ${dna.meta.name}

## Tokens

${easings.length ? table(["Easing", "Value"], easings) : "No easings recorded."}

${durations.length ? table(["Duration", "Value"], durations) : "No durations recorded."}

${exceptions.length ? table(["Exception", "Value"], exceptions) : ""}

## Rules

- Use one easing family.
- Reserve choreography for the hero or one signature moment.
- Every primitive needs a still fallback under reduced motion.
- Do not decorate idle elements.
- Do not add parallax or cursor effects to app routes.

## Reduced motion

All non-essential motion is removed, not merely slowed.
`;
}

function renderImageryMd(dna) {
  return `# Imagery - ${dna.meta.name}

## Art direction

${dna.imagery?.art_direction ?? "Use client-supplied photography only. Preserve the extracted crops, focal points, and treatment."}

## Sources and licences

${(dna.provenance?.restrictions ?? []).length ? dna.provenance.restrictions.map((item) => `- ${item}`).join("\n") : "- No assets are included in this skill.\n- Use client-supplied or licensed assets only."}

## Placeholders

Missing imagery becomes a designed placeholder with a label and ratio. Never use a broken image or a borrowed location photo.

## Alt text

- Decorative images: empty alt.
- Meaningful images: specific, factual alt.
- Pending images: state that the photo is pending.
`;
}

function renderContentVoiceMd(dna) {
  const voice = dna.voice ?? {};
  return `# Content and Voice - ${dna.meta.name}

## Voice

${voice.summary ?? "Use the extracted voice from the audit. Prefer specific nouns, short declarative sentences, and honest hedges."}

## Do

${(dna.rules?.do ?? []).map((item) => `- ${item}`).join("\n")}

## Do not

${(dna.rules?.dont ?? []).map((item) => `- ${item}`).join("\n")}

## Trust

- Use real contact details and real counts.
- State when pricing is quoted per trip.
- Use cautious availability language.
- Never invent reviews, awards, certifications, scarcity, or sighting guarantees.
`;
}

function renderAccessibilityMd(dna) {
  const foreground = tokenValue(
    dna.tokens?.colors?.ink ?? dna.tokens?.colors?.night ?? "#000000",
  );
  const background = tokenValue(
    dna.tokens?.colors?.ivory ?? dna.tokens?.colors?.paper ?? "#ffffff",
  );
  return `# Accessibility - ${dna.meta.name}

## Requirements

- WCAG 2.2 AA for text, UI components, and focus indicators.
- Visible focus on every interactive element.
- Semantic landmarks and logical heading order.
- Native dialogs or a complete ARIA dialog pattern.
- Visible form labels and associated errors.
- Reduced-motion fallback for every motion primitive.
- Tap targets at least 44x44 CSS pixels where practical.

## Known findings

${(dna.accessibility?.issues ?? []).map((item) => `- ${item}`).join("\n") || "- No findings were recorded in the DNA. Re-check before launch."}

## Test commands

\`\`\`bash
node scripts/contrast.mjs --fg "${foreground}" --bg "${background}"
\`\`\`
`;
}

function renderPageRecipesMd(dna) {
  const rows = (dna.pages ?? []).map((page) => [page.type, (page.sections ?? []).join(" -> "), (page.rules ?? []).join("; ")]);
  return `# Page Recipes - ${dna.meta.name}

${table(["Page type", "Section order", "Rules"], rows)}

## Generation sequence

1. Read the fingerprint and AI rules.
2. Choose the page type.
3. List sections in narrative order.
4. Assign a surface tone.
5. Match components with confidence \`>= 0.50\`.
6. Use only extracted tokens and motion.
7. Add loading, empty, error, and success states.
8. Validate the result.
`;
}

function renderDecisionRulesMd(dna) {
  return `# Decision Rules - ${dna.meta.name}

## Fingerprint

\`\`\`json
${JSON.stringify(dna.fingerprint, null, 2)}
\`\`\`

## Constraint priority

1. Legal and accessibility.
2. Brand DNA.
3. System consistency.
4. Page goal.
5. Novelty.

## Surface selection

- Alternate tonal chapters.
- Do not place two dark chapters next to each other unless the DNA says so.
- Keep the accent budget at ${dna.rules?.accent_budget_per_viewport ?? 5} appearances per viewport.
- Never add a new surface tone for one section.

## Type selection

- Display names; sans explains.
- Use the extracted scale.
- Keep at most ${dna.rules?.max_font_families ?? 2} font families.

## Component selection

- Match by role, anatomy, tone, responsive behaviour, and accessibility.
- Use the highest-confidence fit.
- If confidence is below \`0.50\`, compose from primitives or ask.

## Fallbacks

| Missing | Fallback |
|---|---|
| Colour | Use the closest semantic token |
| Type size | Use the nearest scale step |
| Radius | Use \`${dna.rules?.corner_radius ?? "0"}\` |
| Shadow | Use a border or surface tone |
| Component | Compose from primitives |
| Motion | Use a simple fade or none |
| Image | Use the designed placeholder |
| Proof | Omit; never invent |
`;
}

function renderProvenanceMd(dna) {
  const provenance = dna.provenance ?? {};
  return `# Provenance - ${dna.meta.name}

| Field | Value |
|---|---|
| Source | ${dna.meta.source} |
| Commit / capture | ${dna.meta.source_commit ?? "Not recorded"} |
| Audit date | ${dna.meta.audited_at} |
| Framework | ${dna.framework} |
| Framework version | ${dna.framework_version} |
| DNA version | ${dna.meta.version} |
| Licence | ${provenance.licence ?? dna.meta.licence} |
| Evidence count | ${provenance.evidence_count ?? 0} |

${(provenance.parents ?? []).length ? `## Parents\n\n${table(
  ["Role", "Slug", "Name", "Version", "SHA-256"],
  (provenance.parents ?? []).map((parent, index) => [
    index === 0 ? "base" : "overlay",
    parent.slug ?? "",
    parent.name ?? "",
    parent.version ?? "",
    parent.sha256 ? `${parent.sha256.slice(0, 12)}...` : "",
  ]),
)}\n` : ""}

## Restrictions

${(provenance.restrictions ?? []).map((item) => `- ${item}`).join("\n") || "- No assets are included. Do not copy source code, photography, logos, or copy."}

## Limits

${provenance.notes ?? "This skill contains design principles and measurements, not client assets."}
`;
}

function renderPageBriefTemplate() {
  return `# Page Brief - {{PAGE_TYPE}}

| Field | Value |
|---|---|
| Page type | {{PAGE_TYPE}} |
| Goal | {{GOAL}} |
| Audience | {{AUDIENCE}} |
| Commitment level | {{COMMITMENT}} |
| Fingerprint | {{FINGERPRINT}} |

## Section order

| # | Section | Surface | Component | Confidence | Copy slot | States |
|---:|---|---|---|---:|---|---|
| 1 | {{SECTION}} | {{SURFACE}} | {{COMPONENT}} | {{CONFIDENCE}} | {{COPY_SLOT}} | {{STATES}} |

## Assumptions

{{ASSUMPTIONS}}

## Accessibility

{{A11Y_NOTES}}
`;
}

function renderComponentSpecTemplate() {
  return `# Component Spec - {{COMPONENT}}

- ID: \`{{ID}}\`
- Variant: \`{{VARIANT}}\`
- Confidence: \`{{CONFIDENCE}}\`
- Evidence: {{EVIDENCE}}

## Anatomy

{{ANATOMY}}

## States

{{STATES}}

## Tokens

{{TOKENS}}

## Responsive

{{RESPONSIVE}}

## Accessibility

{{ACCESSIBILITY}}

## Motion

{{MOTION}}
`;
}

export async function scaffoldSkill({ dna: input, slug, name, out, force = false, validate = true }) {
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("slug must use lowercase letters, numbers, and hyphens");
  }
  if (!name || name.trim().length === 0) throw new Error("name is required");
  if (!out) throw new Error("out is required");
  const dna = normaliseDna(input, { slug, name });
  const outDir = path.resolve(out);

  let entries = [];
  try {
    entries = await readdir(outDir);
  } catch {
    entries = [];
  }
  if (entries.length > 0) {
    if (!force) {
      throw new Error(`Output directory is not empty: ${outDir}. Use --force to overwrite.`);
    }
    await rm(outDir, { recursive: true, force: true });
  }

  await mkdir(path.join(outDir, "references"), { recursive: true });
  await mkdir(path.join(outDir, "templates"), { recursive: true });

  const skillTemplate = await loadTemplate("generated-skill.md");
  const fingerprintJson = JSON.stringify(dna.fingerprint, null, 2);
  const skillMd = skillTemplate
    .replaceAll("{{SKILL_NAME}}", `${slug}-design-dna`)
    .replaceAll("{{DISPLAY_NAME}}", name)
    .replaceAll("{{ARCHETYPE}}", dna.fingerprint.archetype)
    .replaceAll("{{FRAMEWORK}}", dna.framework)
    .replaceAll("{{FRAMEWORK_VERSION}}", dna.framework_version)
    .replaceAll("{{DNA_VERSION}}", dna.meta.version)
    .replaceAll("{{AUDIT_DATE}}", dna.meta.audited_at)
    .replaceAll("{{ACCENT_BUDGET}}", String(dna.rules.accent_budget_per_viewport))
    .replaceAll("{{MAX_FAMILIES}}", String(dna.rules.max_font_families))
    .replaceAll("{{CORNER_RADIUS}}", dna.rules.corner_radius)
    .replaceAll("{{MOTION_EASING}}", dna.rules.motion_easing)
    .replaceAll("{{FINGERPRINT_JSON}}", fingerprintJson);

  await writeFile(path.join(outDir, "SKILL.md"), skillMd, "utf8");
  await writeFile(path.join(outDir, "design-dna.json"), `${JSON.stringify(dna, null, 2)}\n`, "utf8");
  await writeFile(path.join(outDir, "ai-rules.json"), `${JSON.stringify(buildAiLayer(dna), null, 2)}\n`, "utf8");
  await writeFile(
    path.join(outDir, "fingerprints.json"),
    `${JSON.stringify(buildFingerprints(dna), null, 2)}\n`,
    "utf8",
  );

  await writeFile(path.join(outDir, "references/design-tokens.md"), renderDesignTokensMd(dna), "utf8");
  await writeFile(path.join(outDir, "references/typography.md"), renderTypographyMd(dna), "utf8");
  await writeFile(path.join(outDir, "references/layout.md"), renderLayoutMd(dna), "utf8");
  await writeFile(path.join(outDir, "references/components.md"), renderComponentsMd(dna), "utf8");
  await writeFile(path.join(outDir, "references/motion.md"), renderMotionMd(dna), "utf8");
  await writeFile(path.join(outDir, "references/imagery.md"), renderImageryMd(dna), "utf8");
  await writeFile(path.join(outDir, "references/content-voice.md"), renderContentVoiceMd(dna), "utf8");
  await writeFile(path.join(outDir, "references/accessibility.md"), renderAccessibilityMd(dna), "utf8");
  await writeFile(path.join(outDir, "references/page-recipes.md"), renderPageRecipesMd(dna), "utf8");
  await writeFile(path.join(outDir, "references/decision-rules.md"), renderDecisionRulesMd(dna), "utf8");
  await writeFile(path.join(outDir, "references/provenance.md"), renderProvenanceMd(dna), "utf8");

  await writeFile(path.join(outDir, "templates/design-tokens.css"), renderTokensCss(dna), "utf8");
  await writeFile(path.join(outDir, "templates/page-brief.md"), renderPageBriefTemplate(), "utf8");
  await writeFile(path.join(outDir, "templates/component-spec.md"), renderComponentSpecTemplate(), "utf8");

  if (validate) {
    const result = await validateSkillDir(outDir);
    if (!result.ok) {
      throw new Error(`Generated skill failed validation:\n${result.errors.join("\n")}`);
    }
  }

  return { outDir, dna };
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--slug") options.slug = argv[++index];
    else if (arg === "--name") options.name = argv[++index];
    else if (arg === "--dna") options.dna = argv[++index];
    else if (arg === "--out") options.out = argv[++index];
    else if (arg === "--force") options.force = true;
    else if (arg === "--no-validate") options.noValidate = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help || !options.slug || !options.name || !options.dna || !options.out) {
    console.log(`Usage: node scripts/scaffold-dna-skill.mjs --slug <slug> --name "<Name>" --dna <design-dna.json> --out <skill-dir> [--force] [--no-validate]`);
    if (!options.help) process.exitCode = 1;
    return;
  }
  const dna = JSON.parse(await readFile(options.dna, "utf8"));
  const result = await scaffoldSkill({
    dna,
    slug: options.slug,
    name: options.name,
    out: options.out,
    force: Boolean(options.force),
    validate: !options.noValidate,
  });
  console.log(`Generated ${result.outDir}`);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  main().catch((error) => {
    console.error(`scaffold-dna-skill: ${error.message}`);
    process.exitCode = 1;
  });
}
