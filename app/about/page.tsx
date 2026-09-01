import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="About This Project"
        description="The problem, the design, and why human review still matters."
      />
      <div className="p-6 md:p-10 space-y-4 max-w-2xl">
        <Card>
          <h2 className="font-display font-semibold text-ink mb-2">
            Content coming in a later chunk
          </h2>
          <p className="text-sm text-ink-soft">
            This page will cover the business problem, how AI and MCP are
            used, data provenance, the responsible-AI design, and the
            threat-model / AI-RMF / EU AI Act framing agreed in Phase 1.
          </p>
        </Card>
      </div>
    </>
  );
}
