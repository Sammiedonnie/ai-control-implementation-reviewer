import { describe, it, expect } from "vitest";
import { calculateCompleteness, CATEGORY_WEIGHTS } from "@/lib/scoring/calculateCompleteness";

const ALL_CATEGORIES = Object.keys(CATEGORY_WEIGHTS);

describe("CATEGORY_WEIGHTS", () => {
  it("sums to exactly 100", () => {
    const total = Object.values(CATEGORY_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(total).toBe(100);
  });

  it("covers all 8 required categories from spec section 7", () => {
    expect(ALL_CATEGORIES.sort()).toEqual(
      ["Who", "What", "When", "How", "Evidence", "Scope", "Responsibilities", "Measurability"].sort()
    );
  });
});

describe("calculateCompleteness", () => {
  it("scores 100 when every category is Present", () => {
    const findings = ALL_CATEGORIES.map((category) => ({ category, presence: "Present" as const }));
    expect(calculateCompleteness(findings).score).toBe(100);
  });

  it("scores 0 when every category is Missing", () => {
    const findings = ALL_CATEGORIES.map((category) => ({ category, presence: "Missing" as const }));
    expect(calculateCompleteness(findings).score).toBe(0);
  });

  it("scores 50 when every category is Partially Present", () => {
    const findings = ALL_CATEGORIES.map((category) => ({ category, presence: "Partially Present" as const }));
    expect(calculateCompleteness(findings).score).toBe(50);
  });

  it("treats a category missing from the findings array as Missing (0 points, weight still counted)", () => {
    // Omit "Evidence" (weight 20) entirely -- this must NOT be treated as N/A
    const findings = ALL_CATEGORIES.filter((c) => c !== "Evidence").map((category) => ({
      category,
      presence: "Present" as const,
    }));
    const result = calculateCompleteness(findings);
    // 80 of 100 weight present, Evidence (20) scored as 0 out of its own weight
    expect(result.score).toBe(80);
    const evidenceEntry = result.breakdown.find((b) => b.category === "Evidence");
    expect(evidenceEntry?.presence).toBe("Missing (not addressed)");
    expect(evidenceEntry?.excluded).toBe(false);
  });

  it("excludes a legitimately Not Applicable category from both numerator and denominator", () => {
    // Everything Present except Responsibilities (weight 3) marked N/A --
    // score should be 100, not 97, because N/A is excluded from the denominator.
    const findings = ALL_CATEGORIES.map((category) => ({
      category,
      presence: category === "Responsibilities" ? ("Not Applicable" as const) : ("Present" as const),
    }));
    const result = calculateCompleteness(findings);
    expect(result.score).toBe(100);
    const respEntry = result.breakdown.find((b) => b.category === "Responsibilities");
    expect(respEntry?.excluded).toBe(true);
  });

  it("computes a realistic mixed example correctly", () => {
    // Who: Present (15), What: Present (20), When: Partially Present (7.5),
    // How: Present (20), Evidence: Missing (0/20), Scope: Present (4),
    // Responsibilities: Missing (0/3), Measurability: Present (3)
    const findings = [
      { category: "Who", presence: "Present" as const },
      { category: "What", presence: "Present" as const },
      { category: "When", presence: "Partially Present" as const },
      { category: "How", presence: "Present" as const },
      { category: "Evidence", presence: "Missing" as const },
      { category: "Scope", presence: "Present" as const },
      { category: "Responsibilities", presence: "Missing" as const },
      { category: "Measurability", presence: "Present" as const },
    ];
    // points = 15+20+7.5+20+0+4+0+3 = 69.5 / 100 -> rounds to 70
    expect(calculateCompleteness(findings).score).toBe(70);
  });

  it("returns 0 (not NaN or a crash) if every category is Not Applicable", () => {
    const findings = ALL_CATEGORIES.map((category) => ({ category, presence: "Not Applicable" as const }));
    const result = calculateCompleteness(findings);
    expect(result.score).toBe(0);
    expect(Number.isNaN(result.score)).toBe(false);
  });
});
