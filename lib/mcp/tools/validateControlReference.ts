import { loadFramework, loadControl } from "@/lib/data/frameworkLoader";

export function validateControlReferenceTool(input: {
  frameworkId: string;
  controlId: string;
}) {
  const framework = loadFramework(input.frameworkId);
  if (!framework) {
    return { frameworkExists: false, controlExists: false };
  }
  const control = loadControl(input.frameworkId, input.controlId);
  if (!control) {
    return { frameworkExists: true, controlExists: false };
  }
  return {
    frameworkExists: true,
    controlExists: true,
    canonicalControlId: control.controlId,
    controlVersion: control.frameworkVersion,
    sourceUrl: control.sourceUrl,
  };
}
