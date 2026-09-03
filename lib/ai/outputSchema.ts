import { z } from "zod";
import { IMPLEMENTATION_STATUSES, GAP_SEVERITIES, FINDING_PRESENCE } from "@/lib/types/assessment";

// The exact structured shape the AI must fill via the submit_assessment
// tool call (spec section 7). Nothing the model writes reaches the UI
// without passing this schema -- a malformed response is treated as a
// tool/AI-provider error (spec section 19), not silently patched over.

export const statementFindingSchema = z.object({
  category: z.enum([
    "Who", "What", "When", "How", "Evidence", "Scope", "Responsibilities", "Measurability",
  ]),
  presence: z.enum(FINDING_PRESENCE),
  explanation: z.string().min(1).max(600),
});

export const gapSchema = z.object({
  title: z.string().min(1).max(150),
  explanation: z.string().min(1).max(800),
  whyItMatters: z.string().min(1).max(500),
  relatedRequirement: z.string().min(1).max(300),
  severity: z.enum(GAP_SEVERITIES),
  recommendedImprovement: z.string().min(1).max(500),
});

export const evidenceAssessmentSchema = z.object({
  evidenceMentioned: z.array(z.string().max(300)),
  evidenceExpected: z.array(z.string().max(300)),
  evidenceMissing: z.array(z.string().max(300)),
  evidenceAge: z.string().max(200).optional(),
  evidenceSufficiency: z.enum(["Sufficient", "Insufficient", "Unknown"]),
  operatingEffectivenessVerifiable: z.boolean(),
});

// Raw shape (for the submit_assessment tool's inputSchema) and a
// corresponding z.object (for standalone validation) must match exactly.
export const assessmentOutputShape = {
  overallStatus: z.enum(IMPLEMENTATION_STATUSES),
  confidenceLevel: z.enum(["High", "Moderate", "Low"]),
  statementQualityAnalysis: z.array(statementFindingSchema).min(1),
  strengths: z.array(z.string().max(400)),
  gaps: z.array(gapSchema),
  evidenceAssessment: evidenceAssessmentSchema,
  recommendedStatement: z.string().min(1).max(3000),
  followUpQuestions: z.array(z.string().max(400)),
};

export const AssessmentOutputSchema = z.object(assessmentOutputShape);
export type AssessmentOutput = z.infer<typeof AssessmentOutputSchema>;

// The full record returned to the browser -- adds fields the application
// computes/injects deterministically, which the model never controls:
// framework/control identity, the fixed disclaimer, a timestamp, MCP
// validation results, and the deterministic completeness score.
export const FullAssessmentResultSchema = AssessmentOutputSchema.extend({
  frameworkId: z.string(),
  controlId: z.string(),
  controlName: z.string(),
  assessmentTimestamp: z.string(),
  disclaimer: z.string(),
  completenessScore: z.number(),
  scoreBreakdown: z.array(
    z.object({
      category: z.string(),
      weight: z.number(),
      presence: z.string(),
      pointsEarned: z.number(),
      excluded: z.boolean(),
    })
  ),
  mcpValidation: z.object({
    validControlReference: z.boolean(),
    unsupportedClaims: z.array(z.string()),
    missingRequiredConsiderations: z.array(z.string()),
    permittedStatus: z.boolean(),
    validationWarnings: z.array(z.string()),
    sourceReferences: z.array(z.string()),
  }),
  statusWasOverridden: z.boolean(),
  overrideReason: z.string().optional(),
});
export type FullAssessmentResult = z.infer<typeof FullAssessmentResultSchema>;

export const REQUIRED_DISCLAIMER =
  "This assessment is an AI-assisted preliminary review. It does not constitute an audit opinion, authorization decision, legal determination, or certification of compliance. Final conclusions require qualified human review and appropriate evidence testing.";
