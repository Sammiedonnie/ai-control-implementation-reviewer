import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export default function NewReviewPage() {
  return (
    <>
      <PageHeader
        title="New Review"
        description="Select a framework and control, then submit an implementation statement for review."
      />
      <div className="p-6 md:p-10">
        <Card>
          <p className="text-sm text-ink-soft">
            The framework/control selectors, statement form, and results
            tabs are built in later chunks (data layer, then MCP, then AI
            integration). This placeholder confirms routing works.
          </p>
        </Card>
      </div>
    </>
  );
}
