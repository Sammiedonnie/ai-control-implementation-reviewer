import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export default function ControlLibraryPage() {
  return (
    <>
      <PageHeader
        title="Control Library"
        description="Browse and search NIST SP 800-53 Rev. 5 controls included in this demonstration."
      />
      <div className="p-6 md:p-10">
        <Card>
          <p className="text-sm text-ink-soft">
            Populated once the framework JSON data (Chunk 3) and the MCP
            search_controls tool (Chunk 4) exist.
          </p>
        </Card>
      </div>
    </>
  );
}
