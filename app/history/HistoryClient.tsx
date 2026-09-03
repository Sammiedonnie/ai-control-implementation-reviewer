"use client";

import { useEffect, useState } from "react";
import { Trash2, Info } from "lucide-react";
import {
  getReviewHistory,
  deleteReviewFromHistory,
  clearReviewHistory,
  type StoredReview,
} from "@/lib/storage/reviewHistory";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ResultsView } from "@/components/review/ResultsView";
import { DownloadReportButton } from "@/components/review/DownloadReportButton";
import { Card } from "@/components/ui/Card";

export function HistoryClient() {
  const [history, setHistory] = useState<StoredReview[] | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    // Reading localStorage must happen client-side after mount (not during
    // SSR, which has no window) -- this is a legitimate exception to the
    // "no setState in effect" rule, not an accidental external-sync pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHistory(getReviewHistory());
  }, []);

  if (history === null) {
    return <p className="p-6 md:p-10 text-sm text-ink-soft">Loading...</p>;
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl space-y-4">
      <Card className="flex gap-2.5 items-start bg-status-not-enough-info-bg border-none">
        <Info className="size-4 text-status-not-enough-info shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-xs text-ink-soft">
          Review history is stored in this browser&apos;s local storage only
          -- it is never sent to or kept on a server, is private to this
          device, and will be lost if you clear your browser&apos;s site
          data. There is no account system in this MVP.
        </p>
      </Card>

      {history.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-soft">
            No reviews yet. Reviews you submit on the New Review page will
            appear here.
          </p>
        </Card>
      ) : (
        <>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                clearReviewHistory();
                setHistory([]);
                setExpandedId(null);
              }}
              className="text-xs text-ink-faint hover:text-status-not-implemented transition-colors"
            >
              Clear all history
            </button>
          </div>
          <div className="space-y-3">
            {history.map((r) => (
              <Card key={r.id} className="p-0 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                  className="w-full text-left p-4 flex items-center justify-between gap-3 hover:bg-accent-soft transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="control-id text-xs text-accent font-medium">{r.controlId}</span>
                      <span className="text-sm font-medium text-ink">{r.controlName}</span>
                    </div>
                    <p className="text-xs text-ink-faint mt-0.5">
                      {new Date(r.savedAt).toLocaleString()} &middot; {r.assessment.completenessScore}% complete
                    </p>
                  </div>
                  <StatusBadge status={r.assessment.overallStatus} />
                </button>

                {expandedId === r.id && (
                  <div className="border-t border-line p-4">
                    <div className="flex justify-between items-center gap-2 mb-3">
                      <DownloadReportButton review={r} />
                      <button
                        type="button"
                        onClick={() => {
                          deleteReviewFromHistory(r.id);
                          setHistory(getReviewHistory());
                          setExpandedId(null);
                        }}
                        className="inline-flex items-center gap-1 text-xs text-ink-faint hover:text-status-not-implemented transition-colors"
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                        Delete this review
                      </button>
                    </div>
                    <ResultsView result={r.assessment} />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
