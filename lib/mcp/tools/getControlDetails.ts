import { loadControl } from "@/lib/data/frameworkLoader";

export function getControlDetailsTool(input: {
  frameworkId: string;
  controlId: string;
}) {
  const control = loadControl(input.frameworkId, input.controlId);
  return control ? { found: true, control } : { found: false };
}
