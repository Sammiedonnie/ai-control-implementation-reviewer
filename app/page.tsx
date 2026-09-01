import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="An overview of implementation reviews performed in this session."
      />
      <div className="p-6 md:p-10">
        <Card>
          <p className="text-sm text-ink-soft">
            Review statistics will appear here once the scoring engine and
            history store are built (Chunk 6). This page confirms the
            navigation shell and design system are working.
          </p>
        </Card>
      </div>
    </>
  );
}
