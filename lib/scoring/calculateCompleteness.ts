import type { FindingPresence } from "@/lib/types/assessment";

// DELIBERATE DECISION (documented per CHUNK-LOG, not silently made):
// Spec section 8 defines weights for 6 categories (Who 15/What 20/When 15/
// How 20/Evidence 20/Scope+measurability 10 = 100), but spec section 7's
// required statement-quality categories are 8 (Who/What/When/How/Evidence/
// Scope/Responsibilities/Measurability). The 6-category table's "Scope and
// measurability" 10% bucket is split three ways below to cover all 8
// categories the AI is actually required to assess (Chunk 3's
// validate_assessment enforces exactly these 8), while preserving the
// original 5 primary categories' weights and the 10% total for the
// scope-adjacent categories exactly as specified.
export const CATEGORY_WEIGHTS: Record<string, number> = {
  Who: 15,
  What: 20,
  When: 15,
  How: 20,
  Evidence: 20,
  Scope: 4,
  Responsibilities: 3,
  Measurability: 3,
};
// Weights sum to 100 -- verified in tests/unit/calculateCompleteness.test.ts

export type ScoreBreakdownEntry = {
  category: string;
  weight: number;
  presence: FindingPresence | "Missing (not addressed)";
  pointsEarned: number;
  excluded: boolean;
};

export type CompletenessResult = {
  score: number; // 0-100, rounded
  breakdown: ScoreBreakdownEntry[];
};

// Present: 100% of category weight. Partially Present: 50%. Missing: 0%.
// Not Applicable: excluded from BOTH numerator and denominator (spec
// section 8's "exclude only when validly justified" -- a legitimately N/A
// category should not penalize the score, so the percentage is calculated
// over the remaining applicable weight, not over a fixed 100).
// A category the model never addressed at all (not present in the findings
// array) is NOT excluded -- it's scored as Missing (0%), full weight
// counted -- silently omitting a required category must not inflate the score.
export function calculateCompleteness(
  findings: { category: string; presence: FindingPresence }[]
): CompletenessResult {
  const byCategory = new Map(findings.map((f) => [f.category, f.presence]));
  const breakdown: ScoreBreakdownEntry[] = [];
  let totalApplicableWeight = 0;
  let totalPoints = 0;

  for (const [category, weight] of Object.entries(CATEGORY_WEIGHTS)) {
    const presence = byCategory.get(category);

    if (presence === "Not Applicable") {
      breakdown.push({ category, weight, presence, pointsEarned: 0, excluded: true });
      continue;
    }

    const effectivePresence = presence ?? "Missing (not addressed)";
    const multiplier =
      effectivePresence === "Present" ? 1 : effectivePresence === "Partially Present" ? 0.5 : 0;
    const pointsEarned = weight * multiplier;

    totalApplicableWeight += weight;
    totalPoints += pointsEarned;

    breakdown.push({ category, weight, presence: effectivePresence, pointsEarned, excluded: false });
  }

  const score =
    totalApplicableWeight === 0 ? 0 : Math.round((totalPoints / totalApplicableWeight) * 100);

  return { score, breakdown };
}
