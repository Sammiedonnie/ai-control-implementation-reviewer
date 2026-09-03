"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, Loader2, AlertCircle } from "lucide-react";
import type { Control, ControlFamily } from "@/lib/types/framework";
import type { FullAssessmentResult } from "@/lib/ai/outputSchema";
import { ControlBrowser } from "@/components/review/ControlBrowser";
import { ControlDetailPanel } from "@/components/review/ControlDetailPanel";
import { StatementForm, type OptionalContext } from "@/components/review/StatementForm";
import { ResultsView } from "@/components/review/ResultsView";
import { DownloadReportButton } from "@/components/review/DownloadReportButton";
import { Card } from "@/components/ui/Card";
import { saveReviewToHistory, type StoredReview } from "@/lib/storage/reviewHistory";

const FRAMEWORK_ID = "nist-800-53-r5";

type ReviewState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; result: FullAssessmentResult; stored: StoredReview };

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
  const [review, setReview] = useState<ReviewState>({ status: "idle" });

  const selected = useMemo(
    () => controls.find((c) => c.controlId === selectedId),
    [controls, selectedId]
  );

  async function handleSubmit(statement: string, context: OptionalContext) {
    if (!selected) return;
    setReview({ status: "loading" });
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frameworkId: FRAMEWORK_ID,
          controlId: selected.controlId,
          statement,
          context,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReview({ status: "error", message: data.error ?? "Something went wrong." });
        return;
      }
      const stored = saveReviewToHistory({
        frameworkId: FRAMEWORK_ID,
        controlId: selected.controlId,
        controlName: selected.controlName,
        statement,
        assessment: data.assessment,
      });
      setReview({ status: "done", result: data.assessment, stored });
    } catch {
      setReview({
        status: "error",
        message: "Couldn't reach the server. Check your connection and try again.",
      });
    }
  }

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
          setReview({ status: "idle" });
        }}
        className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        Choose a different control
      </button>

      <Card className="p-0 overflow-hidden">
        <ControlDetailPanel control={selected} />
      </Card>

      {review.status !== "done" && (
        <Card>
          <StatementForm onSubmit={handleSubmit} />
        </Card>
      )}

      {review.status === "loading" && (
        <Card className="flex gap-3 items-center">
          <Loader2 className="size-5 text-accent animate-spin shrink-0" aria-hidden="true" />
          <p className="text-sm text-ink-soft">
            Validating against MCP-served control data and generating a structured assessment...
          </p>
        </Card>
      )}

      {review.status === "error" && (
        <Card className="border-status-not-implemented bg-status-not-implemented-bg flex gap-3 items-start">
          <AlertCircle className="size-5 text-status-not-implemented shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h3 className="text-sm font-semibold text-ink">Review failed</h3>
            <p className="mt-1 text-sm text-ink-soft">{review.message}</p>
            <button
              type="button"
              onClick={() => setReview({ status: "idle" })}
              className="mt-3 text-sm text-accent hover:underline"
            >
              Try again
            </button>
          </div>
        </Card>
      )}

      {review.status === "done" && (
        <>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs text-ink-faint">Saved to your Review History (this browser only)</p>
            <DownloadReportButton review={review.stored} />
          </div>
          <ResultsView result={review.result} />
          <button
            type="button"
            onClick={() => setReview({ status: "idle" })}
            className="text-sm text-accent hover:underline"
          >
            Submit a different statement
          </button>
        </>
      )}
    </div>
  );
}
