import { loadControl } from "@/lib/data/frameworkLoader";

// Generic, control-family-agnostic quality bar and audit-method guidance --
// combined with the control's own evidenceExamples/interviewQuestions
// (Chunk 2 data) to answer this tool. The generic parts are
// application-authored, not official NIST assessment procedures.
const GENERIC_EVIDENCE_QUALITY = [
  "Evidence should be current -- covering the period under review, not a one-time snapshot from setup",
  "Evidence should identify the specific system, account, or record it applies to",
  "Evidence should show who performed the activity and when (name/role and timestamp)",
  "Evidence should be retrievable from a defined, access-controlled location",
];

const GENERIC_EXAMINATION_PROCEDURES = [
  "Request the most recent instance of the evidence and confirm it covers the stated frequency",
  "Trace a sample record end-to-end (e.g., one account from request through to review) to confirm the process matches the statement",
  "Confirm the evidence owner named in the statement can actually produce the evidence on request",
];

const GENERIC_TESTING_CONSIDERATIONS = [
  "Statement completeness and evidence presence are necessary but not sufficient -- operating effectiveness requires observing the control perform correctly over the review period",
  "A single well-documented instance does not confirm the control operates consistently; consider sample size appropriate to control frequency",
];

export function getEvidenceRequirementsTool(input: {
  frameworkId: string;
  controlId: string;
}) {
  const control = loadControl(input.frameworkId, input.controlId);
  if (!control) {
    return {
      found: false,
      evidenceTypes: [],
      evidenceQualityRequirements: [],
      suggestedInterviewQuestions: [],
      suggestedExaminationProcedures: [],
      suggestedTestingConsiderations: [],
    };
  }
  return {
    found: true,
    evidenceTypes: control.evidenceExamples,
    evidenceQualityRequirements: GENERIC_EVIDENCE_QUALITY,
    suggestedInterviewQuestions: control.interviewQuestions,
    suggestedExaminationProcedures: GENERIC_EXAMINATION_PROCEDURES,
    suggestedTestingConsiderations: GENERIC_TESTING_CONSIDERATIONS,
  };
}
