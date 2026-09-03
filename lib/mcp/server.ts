import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  listFrameworksInput, listFrameworksOutput,
  listControlFamiliesInput, listControlFamiliesOutput,
  searchControlsInput, searchControlsOutput,
  getControlDetailsInput, getControlDetailsOutput,
  getEvidenceRequirementsInput, getEvidenceRequirementsOutput,
  validateControlReferenceInput, validateControlReferenceOutput,
  mapControlInput, mapControlOutput,
  validateAssessmentInput, validateAssessmentOutput,
} from "@/lib/mcp/schemas";
import { listFrameworksTool } from "@/lib/mcp/tools/listFrameworks";
import { listControlFamiliesTool } from "@/lib/mcp/tools/listControlFamilies";
import { searchControlsTool } from "@/lib/mcp/tools/searchControls";
import { getControlDetailsTool } from "@/lib/mcp/tools/getControlDetails";
import { getEvidenceRequirementsTool } from "@/lib/mcp/tools/getEvidenceRequirements";
import { validateControlReferenceTool } from "@/lib/mcp/tools/validateControlReference";
import { mapControlTool } from "@/lib/mcp/tools/mapControl";
import { validateAssessmentTool } from "@/lib/mcp/tools/validateAssessment";

// This server is the single source of truth the AI assistant must consult
// (Chunk 4) before returning any control-specific conclusion. Every tool
// here is read-only -- no write-capable tools exist, per spec section 16 --
// and every input/output is Zod-validated via the schemas in lib/mcp/schemas.ts.

function asToolResult(structuredContent: Record<string, unknown>) {
  return {
    structuredContent,
    content: [{ type: "text" as const, text: JSON.stringify(structuredContent) }],
  };
}

export function createServer() {
  const server = new McpServer({
    name: "ai-control-implementation-reviewer-mcp",
    version: "0.1.0",
  });

  server.registerTool(
    "list_frameworks",
    {
      title: "List frameworks",
      description: "Lists all compliance frameworks available in this deployment.",
      inputSchema: listFrameworksInput,
      outputSchema: listFrameworksOutput,
    },
    async () => asToolResult(listFrameworksTool())
  );

  server.registerTool(
    "list_control_families",
    {
      title: "List control families",
      description: "Lists the control families for a given framework.",
      inputSchema: listControlFamiliesInput,
      outputSchema: listControlFamiliesOutput,
    },
    async (input) => asToolResult(listControlFamiliesTool(input))
  );

  server.registerTool(
    "search_controls",
    {
      title: "Search controls",
      description: "Searches controls within a framework by keyword and/or family.",
      inputSchema: searchControlsInput,
      outputSchema: searchControlsOutput,
    },
    async (input) => asToolResult(searchControlsTool(input))
  );

  server.registerTool(
    "get_control_details",
    {
      title: "Get control details",
      description:
        "Returns full validated detail for a single control: purpose, summary, expected statement elements, evidence examples, common gaps, related controls, source, and provenance.",
      inputSchema: getControlDetailsInput,
      outputSchema: getControlDetailsOutput,
    },
    async (input) => asToolResult(getControlDetailsTool(input))
  );

  server.registerTool(
    "get_evidence_requirements",
    {
      title: "Get evidence requirements",
      description:
        "Returns evidence types, quality requirements, suggested interview questions, examination procedures, and testing considerations for a control.",
      inputSchema: getEvidenceRequirementsInput,
      outputSchema: getEvidenceRequirementsOutput,
    },
    async (input) => asToolResult(getEvidenceRequirementsTool(input))
  );

  server.registerTool(
    "validate_control_reference",
    {
      title: "Validate control reference",
      description:
        "Confirms whether a framework and control identifier are real and returns the canonical ID, version, and source.",
      inputSchema: validateControlReferenceInput,
      outputSchema: validateControlReferenceOutput,
    },
    async (input) => asToolResult(validateControlReferenceTool(input))
  );

  server.registerTool(
    "map_control",
    {
      title: "Map control across frameworks",
      description:
        "Returns crosswalk information between a control in one framework and another framework, only when mapping data exists. Never returns an approximate mapping as exact.",
      inputSchema: mapControlInput,
      outputSchema: mapControlOutput,
    },
    async (input) => asToolResult(mapControlTool(input))
  );

  server.registerTool(
    "validate_assessment",
    {
      title: "Validate a proposed assessment",
      description:
        "Checks a proposed implementation status and findings against the control reference, flagging unsupported claims, missing required categories, and status claims not earned by the evidence provided.",
      inputSchema: validateAssessmentInput,
      outputSchema: validateAssessmentOutput,
    },
    async (input) => asToolResult(validateAssessmentTool(input))
  );

  return server;
}
