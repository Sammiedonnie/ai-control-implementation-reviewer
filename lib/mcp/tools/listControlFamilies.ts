import { loadFamilies } from "@/lib/data/frameworkLoader";

export function listControlFamiliesTool(input: { frameworkId: string }) {
  return { families: loadFamilies(input.frameworkId) };
}
