import { PageHeader } from "@/components/ui/PageHeader";
import { loadControls, loadFamilies } from "@/lib/data/frameworkLoader";
import { ControlLibraryClient } from "./ControlLibraryClient";

const FRAMEWORK_ID = "nist-800-53-r5";

export default function ControlLibraryPage() {
  const controls = loadControls(FRAMEWORK_ID);
  const families = loadFamilies(FRAMEWORK_ID);

  return (
    <>
      <PageHeader
        title="Control Library"
        description="Browse and search NIST SP 800-53 Rev. 5 controls included in this demonstration."
      />
      <ControlLibraryClient controls={controls} families={families} />
    </>
  );
}
