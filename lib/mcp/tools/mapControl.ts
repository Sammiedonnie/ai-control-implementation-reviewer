import { loadFramework, loadControl, loadCrosswalks } from "@/lib/data/frameworkLoader";

// Never upgrades an approximate mapping to an exact one, and never invents a
// mapping that isn't in crosswalks.json -- with only one framework in the
// MVP, this correctly returns "Not Available" for everything except a
// same-framework, same-control lookup, until a second framework's crosswalk
// data exists.
export function mapControlTool(input: {
  sourceFrameworkId: string;
  sourceControlId: string;
  targetFrameworkId: string;
}) {
  const sourceFramework = loadFramework(input.sourceFrameworkId);
  const sourceControl = sourceFramework
    ? loadControl(input.sourceFrameworkId, input.sourceControlId)
    : null;

  if (!sourceFramework || !sourceControl) {
    return {
      confidence: "Not Available" as const,
      notes: "The source framework or control could not be validated.",
    };
  }

  if (input.sourceFrameworkId === input.targetFrameworkId) {
    return {
      confidence: "Exact" as const,
      targetControlId: sourceControl.controlId,
      notes: "Source and target framework are the same -- this is the same control, not a crosswalk.",
    };
  }

  const targetFramework = loadFramework(input.targetFrameworkId);
  if (!targetFramework) {
    return {
      confidence: "Not Available" as const,
      notes: `No framework named '${input.targetFrameworkId}' exists in this demonstration.`,
    };
  }

  const crosswalks = loadCrosswalks(input.sourceFrameworkId);
  const match = crosswalks.find(
    (c) =>
      c.sourceControlId.toLowerCase() === sourceControl.controlId.toLowerCase() &&
      c.targetFrameworkId === input.targetFrameworkId
  );

  if (!match) {
    return {
      confidence: "Not Available" as const,
      notes: `No crosswalk data exists yet from ${sourceControl.controlId} to ${input.targetFrameworkId}. Only ${input.sourceFrameworkId} is populated in this MVP.`,
    };
  }

  return {
    confidence: match.confidence,
    targetControlId: match.targetControlId,
    notes: match.notes,
  };
}
