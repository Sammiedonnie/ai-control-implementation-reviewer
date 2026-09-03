import type { AssessmentOutput } from "@/lib/ai/outputSchema";
import type { ImplementationStatus } from "@/lib/types/assessment";
import { REQUIRED_DISCLAIMER } from "@/lib/ai/outputSchema";

// Defense in depth: the system prompt instructs the model to honor
// validate_assessment's verdict, but instructions can be ignored (by the
// model, or by a prompt-injection attempt buried in the statement text).
// This function re-checks server-side, independent of what the model
// claims to have done, and is pure/synchronous so it's fully unit-testable
// without a live Anthropic API key or network access.

export type McpValidation = {
  validControlReference: boolean;
  unsupportedClaims: string[];
  missingRequiredConsiderations: string[];
  permittedStatus: boolean;
  validationWarnings: string[];
  sourceReferences: string[];
};

export function applySafetyOverrides(
  proposed: AssessmentOutput,
  mcpValidation: McpValidation
): { status: ImplementationStatus; overridden: boolean; reason?: string } {
  if (!mcpValidation.validControlReference) {
    return {
      status: "Not Enough Information",
      overridden: proposed.overallStatus !== "Not Enough Information",
      reason:
        "The control reference could not be validated against known framework data, so no conclusion can be trusted.",
    };
  }

  if (!mcpValidation.permittedStatus && proposed.overallStatus === "Implemented") {
    return {
      status: "Not Enough Information",
      overridden: true,
      reason:
        "The proposed 'Implemented' status was not supported by the evidence and findings provided (see unsupported claims below), so it was downgraded automatically.",
    };
  }

  return { status: proposed.overallStatus, overridden: false };
}

// Builds the final, app-controlled fields that are never left to the model:
// the disclaimer text is always exactly the required wording, never
// whatever (if anything) the model produced. Completeness score is
// computed deterministically here, from the model's category findings --
// see lib/scoring/calculateCompleteness.ts for the weighting rules.
export function buildFixedFields(frameworkId: string, controlId: string, controlName: string) {
  return {
    frameworkId,
    controlId,
    controlName,
    assessmentTimestamp: new Date().toISOString(),
    disclaimer: REQUIRED_DISCLAIMER,
  };
}
