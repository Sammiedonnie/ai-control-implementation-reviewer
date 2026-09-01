import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export default function HistoryPage() {
  return (
    <>
      <PageHeader
        title="Review History"
        description="Past reviews from this browser session."
      />
      <div className="p-6 md:p-10">
        <Card>
          <p className="text-sm text-ink-soft">
            Review history is stored in browser storage for this MVP, not a
            server-side database -- so history is private to your browser and
            not persisted across devices. Built in Chunk 6.
          </p>
        </Card>
      </div>
    </>
  );
}
