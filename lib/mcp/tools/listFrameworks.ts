import { listFrameworks as loadFrameworks } from "@/lib/data/frameworkLoader";

export function listFrameworksTool() {
  return { frameworks: loadFrameworks() };
}
