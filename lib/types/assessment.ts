// Shared status/severity vocabulary used across the app -- kept in one place
// so the UI, scoring engine, and MCP validation all agree on the exact
// permitted values from the spec.

export const IMPLEMENTATION_STATUSES = [
  "Implemented",
  "Partially Implemented",
  "Not Implemented",
  "Not Enough Information",
  "Not Applicable - Requires Justification",
] as const;

export type ImplementationStatus = (typeof IMPLEMENTATION_STATUSES)[number];

export const GAP_SEVERITIES = ["Low", "Moderate", "High", "Critical"] as const;
export type GapSeverity = (typeof GAP_SEVERITIES)[number];

export const FINDING_PRESENCE = [
  "Present",
  "Partially Present",
  "Missing",
  "Not Applicable",
] as const;
export type FindingPresence = (typeof FINDING_PRESENCE)[number];
