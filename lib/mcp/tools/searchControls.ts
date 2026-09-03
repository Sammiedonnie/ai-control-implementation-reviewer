import { searchControls } from "@/lib/data/frameworkLoader";

export function searchControlsTool(input: {
  frameworkId: string;
  searchTerm?: string;
  family?: string;
}) {
  return {
    controls: searchControls(input.frameworkId, input.searchTerm ?? "", input.family),
  };
}
