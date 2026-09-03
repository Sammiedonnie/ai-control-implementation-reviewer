"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, Construction } from "lucide-react";
import type { Control, ControlFamily } from "@/lib/types/framework";
import { ControlBrowser } from "@/components/review/ControlBrowser";
import { ControlDetailPanel } from "@/components/review/ControlDetailPanel";
import { StatementForm, type OptionalContext } from "@/components/review/StatementForm";
import { Card } from "@/components/ui/Card";

export function NewReviewClient({
  controls,
  families,
}: {
  controls: Control[];
  families: ControlFamily[];
}) {
  const searchParams = useSearchParams();
  const preselected = searchParams.get("control")?.toUpperCase();
  const [selectedId, setSelectedId] = useState<string | undefined>(
    controls.find((c) => c.controlId === preselected)?.controlId
  );
  const [submitted, setSubmitted] = useState<{
    statement: string;
    context: OptionalContext;
  } | null>(null);

  const selected = useMemo(
    () => controls.find((c) => c.controlId === selectedId),
    [controls, selectedId]
  );

  if (!selected) {
    return (
      <div className="p-6 md:p-10">
        <p className="text-sm text-ink-soft mb-4">
          Framework: <span className="font-medium text-ink">NIST SP 800-53 Rev. 5</span>{" "}
          (the only framework in this MVP -- the data layer supports adding
          more without rewriting this page).
        </p>
        <div className="border border-line rounded-[var(--radius)] overflow-hidden max-w-3xl h-[520px] bg-paper-raised">
          <ControlBrowser
            controls={controls}
            families={families}
            selectedControlId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl space-y-6">
      <button
        type="button"
        onClick={() => {
          setSelectedId(undefined);
          setSubmitted(null);
        }}
        className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        Choose a different control
      </button>

      <Card className="p-0 overflow-hidden">
        <ControlDetailPanel control={selected} />
      </Card>

      {!submitted ? (
        <Card>
          <StatementForm
            onSubmit={(statement, context) => setSubmitted({ statement, context })}
          />
        </Card>
      ) : (
        <Card className="flex gap-3 items-start">
          <Construction className="size-5 text-status-partial shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h3 className="text-sm font-semibold text-ink">
              Statement captured -- AI review isn&apos;t wired up yet
            </h3>
            <p className="mt-1 text-sm text-ink-soft">
              This confirms the form, control selection, and data flow all
              work end to end. The MCP server (Chunk 3) and the AI review
              call (Chunk 4) will turn this into an actual structured
              assessment.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(null)}
              className="mt-3 text-sm text-accent hover:underline"
            >
              Edit statement
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
