import { z } from "zod";

// Canonical shape for framework, family, and control records -- the MCP
// tools (Chunk 3) validate their responses against these same schemas, so
// the data layer and the MCP layer can never drift apart.

export const DataProvenanceSchema = z.enum([
  "official-public-domain",
  "application-authored",
  "sample-demonstration-data",
]);
export type DataProvenance = z.infer<typeof DataProvenanceSchema>;

export const FrameworkSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  description: z.string(),
  sourceUrl: z.string().url(),
  contentStatusNotice: z.string(),
});
export type Framework = z.infer<typeof FrameworkSchema>;

export const ControlFamilySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
});
export type ControlFamily = z.infer<typeof ControlFamilySchema>;

export const ControlSchema = z.object({
  frameworkId: z.string(),
  frameworkVersion: z.string(),
  controlId: z.string(),
  controlName: z.string(),
  family: z.string(), // family id, e.g. "AC"
  purpose: z.string(),
  summary: z.string(), // application-authored plain-language summary
  expectedStatementElements: z.array(z.string()),
  evidenceExamples: z.array(z.string()),
  commonGaps: z.array(z.string()),
  interviewQuestions: z.array(z.string()),
  relatedControls: z.array(z.string()),
  sourceUrl: z.string().url(),
  provenance: DataProvenanceSchema,
  lastReviewed: z.string(), // ISO date
});
export type Control = z.infer<typeof ControlSchema>;

export const CrosswalkEntrySchema = z.object({
  sourceFrameworkId: z.string(),
  sourceControlId: z.string(),
  targetFrameworkId: z.string(),
  targetControlId: z.string(),
  confidence: z.enum(["Exact", "Related", "Partial", "Informational"]),
  notes: z.string(),
});
export type CrosswalkEntry = z.infer<typeof CrosswalkEntrySchema>;
