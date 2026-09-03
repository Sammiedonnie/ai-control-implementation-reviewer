import { describe, it, expect } from "vitest";
import { applySafetyOverrides, buildFixedFields } from "@/lib/ai/reviewLogic";
import type { AssessmentOutput } from "@/lib/ai/outputSchema";
import type { McpValidation } from "@/lib/ai/reviewLogic";

function makeProposed(overrides: Partial<AssessmentOutput> = {}): AssessmentOutput {
  return {
    overallStatus: "Implemented",
    confidenceLevel: "High",
    statementQualityAnalysis: [
      { category: "Who", presence: "Present", explanation: "x" },
    ],
    strengths: [],
    gaps: [],
    evidenceAssessment: {
      evidenceMentioned: [],
      evidenceExpected: [],
      evidenceMissing: [],
      evidenceSufficiency: "Unknown",
      operatingEffectivenessVerifiable: false,
    },
    recommendedStatement: "x",
    followUpQuestions: [],
    ...overrides,
  };
}

function makeMcpValidation(overrides: Partial<McpValidation> = {}): McpValidation {
  return {
    validControlReference: true,
    unsupportedClaims: [],
    missingRequiredConsiderations: [],
    permittedStatus: true,
    validationWarnings: [],
    sourceReferences: [],
    ...overrides,
  };
}

describe("applySafetyOverrides", () => {
  it("downgrades to Not Enough Information when the control reference is invalid, regardless of proposed status", () => {
    const result = applySafetyOverrides(
      makeProposed({ overallStatus: "Implemented" }),
      makeMcpValidation({ validControlReference: false })
    );
    expect(result.status).toBe("Not Enough Information");
    expect(result.overridden).toBe(true);
  });

  it("downgrades an unearned 'Implemented' status when MCP validation says it's not permitted", () => {
    const result = applySafetyOverrides(
      makeProposed({ overallStatus: "Implemented" }),
      makeMcpValidation({ permittedStatus: false })
    );
    expect(result.status).toBe("Not Enough Information");
    expect(result.overridden).toBe(true);
    expect(result.reason).toBeDefined();
  });

  it("does NOT override a non-Implemented status even if permittedStatus is false", () => {
    // permittedStatus:false is specifically about earning "Implemented" --
    // a model correctly proposing "Partially Implemented" should not be
    // second-guessed by this check.
    const result = applySafetyOverrides(
      makeProposed({ overallStatus: "Partially Implemented" }),
      makeMcpValidation({ permittedStatus: false })
    );
    expect(result.status).toBe("Partially Implemented");
    expect(result.overridden).toBe(false);
  });

  it("leaves a valid, permitted 'Implemented' status untouched", () => {
    const result = applySafetyOverrides(
      makeProposed({ overallStatus: "Implemented" }),
      makeMcpValidation({ permittedStatus: true, validControlReference: true })
    );
    expect(result.status).toBe("Implemented");
    expect(result.overridden).toBe(false);
  });
});

describe("buildFixedFields", () => {
  it("always returns the exact required disclaimer text", () => {
    const fields = buildFixedFields("nist-800-53-r5", "AC-2", "Account Management");
    expect(fields.disclaimer).toContain("does not constitute an audit opinion");
  });

  it("returns a valid ISO timestamp", () => {
    const fields = buildFixedFields("nist-800-53-r5", "AC-2", "Account Management");
    expect(() => new Date(fields.assessmentTimestamp).toISOString()).not.toThrow();
  });
});
