export function structuredEvidenceCount(dna) {
  let count = 0;
  const countEvidence = (value) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      for (const entry of value) countEvidence(entry);
      return;
    }
    if (Array.isArray(value.evidence)) count += value.evidence.length;
    for (const [key, entry] of Object.entries(value)) {
      if (key !== "evidence") countEvidence(entry);
    }
  };
  countEvidence(dna?.archetype);
  countEvidence(dna?.tokens);
  countEvidence(dna?.components);
  return count;
}
