import { z } from "zod";
import {
  FrameworkSchema,
  ControlFamilySchema,
  ControlSchema,
} from "@/lib/types/framework";
import { IMPLEMENTATION_STATUSES, FINDING_PRESENCE } from "@/lib/types/assessment";

// Raw-shape (plain object of Zod types) input/output schemas for each of the
// 8 MCP tools, per spec section 9. Every tool's input and output is
// validated -- nothing reaches the AI assistant, or comes back from it,
// without passing through one of these.

export const mapConfidenceSchema = z.enum([
  "Exact",
  "Related",
  "Partial",
  "Informational",
  "Not Available",
]);

// --- list_frameworks ---
export const listFrameworksInput = {};
export const listFrameworksOutput = {
  frameworks: z.array(FrameworkSchema),
};

// --- list_control_families ---
export const listControlFamiliesInput = {
  frameworkId: z.string(),
};
export const listControlFamiliesOutput = {
  families: z.array(ControlFamilySchema),
};

// --- search_controls ---
export const searchControlsInput = {
  frameworkId: z.string(),
  searchTerm: z.string().optional(),
  family: z.string().optional(),
};
export const searchControlsOutput = {
  controls: z.array(ControlSchema),
};

// --- get_control_details ---
export const getControlDetailsInput = {
  frameworkId: z.string(),
  controlId: z.string(),
};
export const getControlDetailsOutput = {
  found: z.boolean(),
  control: ControlSchema.optional(),
};

// --- get_evidence_requirements ---
export const getEvidenceRequirementsInput = {
  frameworkId: z.string(),
  controlId: z.string(),
};
export const getEvidenceRequirementsOutput = {
  found: z.boolean(),
  evidenceTypes: z.array(z.string()),
  evidenceQualityRequirements: z.array(z.string()),
  suggestedInterviewQuestions: z.array(z.string()),
  suggestedExaminationProcedures: z.array(z.string()),
  suggestedTestingConsiderations: z.array(z.string()),
};

// --- validate_control_reference ---
export const validateControlReferenceInput = {
  frameworkId: z.string(),
  controlId: z.string(),
};
export const validateControlReferenceOutput = {
  frameworkExists: z.boolean(),
  controlExists: z.boolean(),
  canonicalControlId: z.string().optional(),
  controlVersion: z.string().optional(),
  sourceUrl: z.string().optional(),
};

// --- map_control ---
export const mapControlInput = {
  sourceFrameworkId: z.string(),
  sourceControlId: z.string(),
  targetFrameworkId: z.string(),
};
export const mapControlOutput = {
  confidence: mapConfidenceSchema,
  targetControlId: z.string().optional(),
  notes: z.string(),
};

// --- validate_assessment ---
export const proposedFindingSchema = z.object({
  category: z.string(), // e.g. "Who", "What", "When", "How", "Evidence", "Scope"
  presence: z.enum(FINDING_PRESENCE),
  explanation: z.string(),
});

export const validateAssessmentInput = {
  frameworkId: z.string(),
  controlId: z.string(),
  proposedFindings: z.array(proposedFindingSchema),
  proposedStatus: z.enum(IMPLEMENTATION_STATUSES),
  evidenceInformation: z.string().optional(),
};
export const validateAssessmentOutput = {
  validControlReference: z.boolean(),
  unsupportedClaims: z.array(z.string()),
  missingRequiredConsiderations: z.array(z.string()),
  permittedStatus: z.boolean(),
  validationWarnings: z.array(z.string()),
  sourceReferences: z.array(z.string()),
};
