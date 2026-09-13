import { Suspense } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { loadControls, loadFamilies, listFrameworks } from "@/lib/data/frameworkLoader";
import { NewReviewClient } from "./NewReviewClient";

const DEFAULT_FRAMEWORK_ID = "nist-800-53-r5";

export default async function NewReviewPage({
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
        title="New Review"
        description="Select a framework and control, then submit an implementation statement for review."
      />
      <Suspense fallback={<div className="p-10 text-sm text-ink-soft">Loading...</div>}>
        <NewReviewClient
          frameworks={frameworks}
          frameworkId={frameworkId}
          controls={controls}
          families={families}
        />
      </Suspense>
    </>
  );
}