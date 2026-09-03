import { Suspense } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { loadControls, loadFamilies } from "@/lib/data/frameworkLoader";
import { NewReviewClient } from "./NewReviewClient";

const FRAMEWORK_ID = "nist-800-53-r5";

export default function NewReviewPage() {
  const controls = loadControls(FRAMEWORK_ID);
  const families = loadFamilies(FRAMEWORK_ID);

  return (
    <>
      <PageHeader
        title="New Review"
        description="Select a control, then submit an implementation statement for review."
      />
      <Suspense fallback={<div className="p-10 text-sm text-ink-soft">Loading...</div>}>
        <NewReviewClient controls={controls} families={families} />
      </Suspense>
    </>
  );
}
