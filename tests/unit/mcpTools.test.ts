import { describe, it, expect } from "vitest";
import { listFrameworksTool } from "@/lib/mcp/tools/listFrameworks";
import { listControlFamiliesTool } from "@/lib/mcp/tools/listControlFamilies";
import { searchControlsTool } from "@/lib/mcp/tools/searchControls";
import { getControlDetailsTool } from "@/lib/mcp/tools/getControlDetails";
import { getEvidenceRequirementsTool } from "@/lib/mcp/tools/getEvidenceRequirements";
import { validateControlReferenceTool } from "@/lib/mcp/tools/validateControlReference";
import { mapControlTool } from "@/lib/mcp/tools/mapControl";
import { validateAssessmentTool } from "@/lib/mcp/tools/validateAssessment";

const FW = "nist-800-53-r5";

describe("list_frameworks", () => {
  it("returns the NIST framework", () => {
    const result = listFrameworksTool();
    expect(result.frameworks).toHaveLength(1);
    expect(result.frameworks[0].id).toBe(FW);
  });
});

describe("list_control_families", () => {
  it("returns 6 families for a known framework", () => {
    expect(listControlFamiliesTool({ frameworkId: FW }).families).toHaveLength(6);
  });
  it("returns empty for an unknown framework", () => {
    expect(listControlFamiliesTool({ frameworkId: "nope" }).families).toHaveLength(0);
  });
});

describe("search_controls", () => {
  it("finds AC-2 by ID", () => {
    const result = searchControlsTool({ frameworkId: FW, searchTerm: "AC-2" });
    expect(result.controls).toHaveLength(1);
    expect(result.controls[0].controlId).toBe("AC-2");
  });
  it("filters by family", () => {
    const result = searchControlsTool({ frameworkId: FW, family: "AU" });
    expect(result.controls).toHaveLength(2);
  });
});

describe("get_control_details", () => {
  it("returns found:true with full detail for a known control", () => {
    const result = getControlDetailsTool({ frameworkId: FW, controlId: "AC-2" });
    expect(result.found).toBe(true);
    expect(result.control?.controlName).toBe("Account Management");
  });
  it("returns found:false for an unknown control -- never invents one", () => {
    const result = getControlDetailsTool({ frameworkId: FW, controlId: "ZZ-99" });
    expect(result.found).toBe(false);
    expect(result.control).toBeUndefined();
  });
});

describe("get_evidence_requirements", () => {
  it("returns evidence types and interview questions for a known control", () => {
    const result = getEvidenceRequirementsTool({ frameworkId: FW, controlId: "AU-6" });
    expect(result.found).toBe(true);
    expect(result.evidenceTypes.length).toBeGreaterThan(0);
    expect(result.suggestedInterviewQuestions.length).toBeGreaterThan(0);
  });
  it("returns found:false for an unknown control", () => {
    expect(getEvidenceRequirementsTool({ frameworkId: FW, controlId: "ZZ-99" }).found).toBe(false);
  });
});

describe("validate_control_reference", () => {
  it("confirms a real control", () => {
    const result = validateControlReferenceTool({ frameworkId: FW, controlId: "SC-7" });
    expect(result.frameworkExists).toBe(true);
    expect(result.controlExists).toBe(true);
    expect(result.canonicalControlId).toBe("SC-7");
  });
  it("flags an unknown framework", () => {
    const result = validateControlReferenceTool({ frameworkId: "nope", controlId: "SC-7" });
    expect(result.frameworkExists).toBe(false);
    expect(result.controlExists).toBe(false);
  });
  it("flags an unknown control within a real framework", () => {
    const result = validateControlReferenceTool({ frameworkId: FW, controlId: "ZZ-99" });
    expect(result.frameworkExists).toBe(true);
    expect(result.controlExists).toBe(false);
  });
});

describe("map_control", () => {
  it("returns Not Available when no crosswalk data exists to another framework", () => {
    const result = mapControlTool({
      sourceFrameworkId: FW,
      sourceControlId: "AC-2",
      targetFrameworkId: "hipaa-security-rule",
    });
    expect(result.confidence).toBe("Not Available");
  });
  it("never returns Exact for a cross-framework mapping with no data", () => {
    const result = mapControlTool({
      sourceFrameworkId: FW,
      sourceControlId: "AC-2",
      targetFrameworkId: "some-other-framework",
    });
    expect(result.confidence).not.toBe("Exact");
  });
});

describe("validate_assessment", () => {
  it("rejects Implemented status with no evidence information", () => {
    const result = validateAssessmentTool({
      frameworkId: FW,
      controlId: "AC-2",
      proposedFindings: [
        { category: "Who", presence: "Present", explanation: "x" },
        { category: "What", presence: "Present", explanation: "x" },
        { category: "When", presence: "Present", explanation: "x" },
        { category: "How", presence: "Present", explanation: "x" },
        { category: "Evidence", presence: "Present", explanation: "x" },
        { category: "Scope", presence: "Present", explanation: "x" },
        { category: "Responsibilities", presence: "Present", explanation: "x" },
        { category: "Measurability", presence: "Present", explanation: "x" },
      ],
      proposedStatus: "Implemented",
    });
    expect(result.permittedStatus).toBe(false);
    expect(result.unsupportedClaims.length).toBeGreaterThan(0);
  });

  it("rejects Implemented status when any required category is Missing", () => {
    const result = validateAssessmentTool({
      frameworkId: FW,
      controlId: "AC-2",
      proposedFindings: [
        { category: "Who", presence: "Missing", explanation: "not stated" },
      ],
      proposedStatus: "Implemented",
      evidenceInformation: "Some evidence text",
    });
    expect(result.permittedStatus).toBe(false);
  });

  it("flags missing required finding categories", () => {
    const result = validateAssessmentTool({
      frameworkId: FW,
      controlId: "AC-2",
      proposedFindings: [{ category: "Who", presence: "Present", explanation: "x" }],
      proposedStatus: "Not Enough Information",
    });
    expect(result.missingRequiredConsiderations.length).toBe(7); // 8 required - 1 provided
  });

  it("flags an invalid control reference", () => {
    const result = validateAssessmentTool({
      frameworkId: FW,
      controlId: "ZZ-99",
      proposedFindings: [],
      proposedStatus: "Not Enough Information",
    });
    expect(result.validControlReference).toBe(false);
    expect(result.unsupportedClaims.length).toBeGreaterThan(0);
  });
});
