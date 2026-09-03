import { loadFramework, loadControl } from "@/lib/data/frameworkLoader";
import type { FindingPresence } from "@/lib/types/assessment";

// The last line of defense before an AI-proposed assessment reaches the
// deterministic scoring engine (Chunk 5) or the UI: catches a status that
// isn't earned by the findings, findings that skip required categories, and
// claims made with no evidence information behind them. This tool does not
// compute the completeness score -- see spec section 8, that stays
// deterministic application code, not this tool and not the model.

const REQUIRED_CATEGORIES = [
  "Who",
  "What",
  "When",
  "How",
  "Evidence",
  "Scope",
  "Responsibilities",
  "Measurability",
];

export function validateAssessmentTool(input: {
  frameworkId: string;
  controlId: string;
  proposedFindings: { category: string; presence: FindingPresence; explanation: string }[];
  proposedStatus: string;
  evidenceInformation?: string;
}) {
  const framework = loadFramework(input.frameworkId);
  const control = framework ? loadControl(input.frameworkId, input.controlId) : null;
  const validControlReference = Boolean(framework && control);

  const unsupportedClaims: string[] = [];
  const missingRequiredConsiderations: string[] = [];
  const validationWarnings: string[] = [];

  if (!validControlReference) {
    unsupportedClaims.push(
      `The proposed assessment references ${input.frameworkId}/${input.controlId}, which could not be validated against known framework data. No conclusion can be trusted until the reference is corrected.`
    );
  }

  const presentCategories = new Set(input.proposedFindings.map((f) => f.category));
  for (const cat of REQUIRED_CATEGORIES) {
    if (!presentCategories.has(cat)) {
      missingRequiredConsiderations.push(
        `No finding was provided for '${cat}' -- this category must be explicitly addressed (even if the answer is 'Not Applicable' with justification).`
      );
    }
  }

  const anyMissingPresence = input.proposedFindings.some((f) => f.presence === "Missing");
  const evidenceInfoProvided = Boolean(input.evidenceInformation?.trim());

  let permittedStatus = true;

  if (input.proposedStatus === "Implemented") {
    if (!evidenceInfoProvided) {
      permittedStatus = false;
      unsupportedClaims.push(
        "Status 'Implemented' was proposed with no evidence information provided. A status of Implemented requires evidence, not just a well-written statement."
      );
    }
    if (anyMissingPresence) {
      permittedStatus = false;
      unsupportedClaims.push(
        "Status 'Implemented' was proposed even though at least one required finding category is 'Missing'. A statement cannot be fully implemented while a required element is absent."
      );
    }
    validationWarnings.push(
      "Statement completeness and evidence presence do not, by themselves, confirm operating effectiveness. Flag clearly that operating effectiveness has not been independently verified unless the evidence information demonstrates it was tested."
    );
  }

  if (input.proposedStatus !== "Not Enough Information" && missingRequiredConsiderations.length > 2) {
    validationWarnings.push(
      "More than two required categories were left unaddressed -- consider whether 'Not Enough Information' is the more defensible status."
    );
  }

  const sourceReferences = control
    ? [control.sourceUrl, `${framework!.name} ${framework!.version} -- ${control.controlId} ${control.controlName}`]
    : [];

  return {
    validControlReference,
    unsupportedClaims,
    missingRequiredConsiderations,
    permittedStatus,
    validationWarnings,
    sourceReferences,
  };
}
