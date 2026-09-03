"use client";

import { Download } from "lucide-react";
import type { StoredReview } from "@/lib/storage/reviewHistory";
import { generateReportHtml } from "@/lib/reports/generateReportHtml";

export function DownloadReportButton({ review }: { review: StoredReview }) {
  function handleDownload() {
    const html = generateReportHtml(review);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assessment-${review.controlId}-${review.id.slice(0, 8)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-accent border border-accent rounded-md px-3 py-1.5 hover:bg-accent-soft transition-colors"
    >
      <Download className="size-4" aria-hidden="true" />
      Download report
    </button>
  );
}
