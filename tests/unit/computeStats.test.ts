import { describe, it, expect } from "vitest";
import { computeDashboardStats } from "@/lib/dashboard/computeStats";
import type { StoredReview } from "@/lib/storage/reviewHistory";
import type { FullAssessmentResult } from "@/lib/ai/outputSchema";

function makeReview(
  overrides: Partial<FullAssessmentResult> = {},
  gapTitles: string[] = []
): StoredReview {
  const assessment = {
    overallStatus: "Partially Implemented",
    confidenceLevel: "Moderate",
    statementQualityAnalysis: [],
    strengths: [],
    gaps: gapTitles.map((title) => ({
      title,
      explanation: "x",
      whyItMatters: "x",
      relatedRequirement: "x",
      severity: "Moderate" as const,
      recommendedImprovement: "x",
    })),
    evidenceAssessment: {
      evidenceMentioned: [],
      evidenceExpected: [],
      evidenceMissing: [],
      evidenceSufficiency: "Unknown" as const,
      operatingEffectivenessVerifiable: false,
    },
    recommendedStatement: "x",
    followUpQuestions: [],
    frameworkId: "nist-800-53-r5",
    controlId: "AC-2",
    controlName: "Account Management",
    assessmentTimestamp: new Date().toISOString(),
    disclaimer: "x",
    completenessScore: 50,
    scoreBreakdown: [],
    mcpValidation: {
      validControlReference: true,
      unsupportedClaims: [],
      missingRequiredConsiderations: [],
      permittedStatus: true,
      validationWarnings: [],
      sourceReferences: [],
    },
    statusWasOverridden: false,
    ...overrides,
  } as FullAssessmentResult;

  return {
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
    frameworkId: "nist-800-53-r5",
    controlId: "AC-2",
    controlName: "Account Management",
    statement: "test statement",
    assessment,
  };
}

describe("computeDashboardStats", () => {
  it("returns zeroed stats for empty history", () => {
    const stats = computeDashboardStats([]);
    expect(stats.totalReviews).toBe(0);
    expect(stats.averageCompletenessScore).toBeNull();
    expect(stats.mostFrequentGaps).toEqual([]);
  });

  it("counts total reviews and status breakdown correctly", () => {
    const reviews = [
      makeReview({ overallStatus: "Implemented" }),
      makeReview({ overallStatus: "Implemented" }),
      makeReview({ overallStatus: "Not Enough Information" }),
    ];
    const stats = computeDashboardStats(reviews);
    expect(stats.totalReviews).toBe(3);
    expect(stats.statusCounts["Implemented"]).toBe(2);
    expect(stats.statusCounts["Not Enough Information"]).toBe(1);
    expect(stats.statusCounts["Not Implemented"]).toBe(0);
  });

  it("computes the average completeness score, rounded", () => {
    const reviews = [
      makeReview({ completenessScore: 60 }),
      makeReview({ completenessScore: 45 }),
      makeReview({ completenessScore: 70 }),
    ];
    // (60+45+70)/3 = 58.33... -> rounds to 58
    expect(computeDashboardStats(reviews).averageCompletenessScore).toBe(58);
  });

  it("ranks the most frequently identified gaps, capped at 5", () => {
    const reviews = [
      makeReview({}, ["Vague frequency", "No evidence owner"]),
      makeReview({}, ["Vague frequency"]),
      makeReview({}, ["Vague frequency", "Missing scope"]),
    ];
    const stats = computeDashboardStats(reviews);
    expect(stats.mostFrequentGaps[0]).toEqual({ title: "Vague frequency", count: 3 });
    expect(stats.mostFrequentGaps.length).toBeLessThanOrEqual(5);
  });
});
