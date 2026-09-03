import { PageHeader } from "@/components/ui/PageHeader";
import { HistoryClient } from "./HistoryClient";

export default function HistoryPage() {
  return (
    <>
      <PageHeader
        title="Review History"
        description="Past reviews from this browser session."
      />
      <HistoryClient />
    </>
  );
}
