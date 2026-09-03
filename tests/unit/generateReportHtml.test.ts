import { describe, it, expect } from "vitest";
import { generateReportHtml } from "@/lib/reports/generateReportHtml";
import type { StoredReview } from "@/lib/storage/reviewHistory";
import type { FullAssessmentResult } from "@/lib/ai/outputSchema";

function makeReview(): StoredReview {
  const assessment: FullAssessmentResult = {
    overallStatus: "Partially Implemented",
    confidenceLevel: "Moderate",
    statementQualityAnalysis: [
      { category: "Who", presence: "Present", explanation: "IT Security team named" },
    ],
    strengths: ["Names a responsible team"],
    gaps: [
      {
        title: "No evidence retention location",
        explanation: "The statement doesn't say where review evidence is kept.",
        whyItMatters: "Assessors need to know where to find proof.",
        relatedRequirement: "Evidence location",
        severity: "Moderate",
        recommendedImprovement: "Add the evidence repository location.",
      },
    ],
    evidenceAssessment: {
      evidenceMentioned: [],
      evidenceExpected: ["Account review exports"],
      evidenceMissing: ["Reviewer sign-off"],
      evidenceSufficiency: "Insufficient",
      operatingEffectivenessVerifiable: false,
    },
    recommendedStatement: "The IT Security team reviews [SYSTEM] accounts quarterly...",
    followUpQuestions: ["Where is evidence retained?"],
    frameworkId: "nist-800-53-r5",
    controlId: "AC-2",
    controlName: "Account Management",
    assessmentTimestamp: new Date().toISOString(),
    disclaimer: "This assessment is an AI-assisted preliminary review.",
    completenessScore: 62,
    scoreBreakdown: [
      { category: "Who", weight: 15, presence: "Present", pointsEarned: 15, excluded: false },
    ],
    mcpValidation: {
      validControlReference: true,
      unsupportedClaims: [],
      missingRequiredConsiderations: [],
      permittedStatus: true,
      validationWarnings: [],
      sourceReferences: ["https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final"],
    },
    statusWasOverridden: false,
  };

  return {
    id: "test-id",
    savedAt: new Date().toISOString(),
    frameworkId: "nist-800-53-r5",
    controlId: "AC-2",
    controlName: "Account Management",
    statement: "The IT Security team reviews active user accounts quarterly.",
    assessment,
  };
}

describe("generateReportHtml", () => {
  it("includes the key assessment fields in the output", () => {
    const html = generateReportHtml(makeReview());
    expect(html).toContain("AC-2");
    expect(html).toContain("Account Management");
    expect(html).toContain("Partially Implemented");
    expect(html).toContain("62%");
    expect(html).toContain("No evidence retention location");
    expect(html).toContain("This assessment is an AI-assisted preliminary review.");
  });

  it("escapes HTML special characters in user-supplied text to prevent injection", () => {
    const review = makeReview();
    review.statement = "The team uses <script>alert('x')</script> & reviews accounts";
    const html = generateReportHtml(review);
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;");
  });

  it("produces a well-formed HTML document", () => {
    const html = generateReportHtml(makeReview());
    expect(html.trim().startsWith("<!DOCTYPE html>")).toBe(true);
    expect(html).toContain("</html>");
  });
});
