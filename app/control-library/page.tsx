import { PageHeader } from "@/components/ui/PageHeader";
import { loadControls, loadFamilies, listFrameworks } from "@/lib/data/frameworkLoader";
import { ControlLibraryClient } from "./ControlLibraryClient";

const DEFAULT_FRAMEWORK_ID = "nist-800-53-r5";

export default async function ControlLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ framework?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const frameworks = listFrameworks();
  const frameworkId = resolvedSearchParams.framework ?? DEFAULT_FRAMEWORK_ID;

  const controls = loadControls(frameworkId);
  const families = loadFamilies(frameworkId);

  return (
    <>
      <PageHeader
        title="Control Library"
        description="Browse and search controls across supported frameworks."
      />
      <ControlLibraryClient
        frameworks={frameworks}
        frameworkId={frameworkId}
        controls={controls}
        families={families}
      />
    </>
  );
}