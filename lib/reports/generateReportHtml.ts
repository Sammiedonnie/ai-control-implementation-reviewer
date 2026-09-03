import type { StoredReview } from "@/lib/storage/reviewHistory";

// Print-friendly, self-contained HTML report (spec section 14: "a print-
// friendly HTML report is acceptable for the MVP"). Pure string-building
// function -- no DOM/browser APIs -- so it's unit-testable and the same
// code could later generate a PDF without rewriting the content logic.
// Escapes all user-supplied text to prevent HTML injection from a
// statement that happens to contain HTML-like characters.

function esc(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function list(items: string[]): string {
  if (items.length === 0) return "<p><em>None</em></p>";
  return `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
}

export function generateReportHtml(review: StoredReview): string {
  const { assessment } = review;
  const generatedAt = new Date().toLocaleString();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Assessment Report -- ${esc(assessment.controlId)}</title>
<style>
  body { font-family: Georgia, 'Times New Roman', serif; max-width: 800px; margin: 2rem auto; padding: 0 1.5rem; color: #1a2233; line-height: 1.5; }
  h1 { font-size: 1.4rem; border-bottom: 2px solid #1f3a5f; padding-bottom: 0.5rem; }
  h2 { font-size: 1.05rem; margin-top: 2rem; color: #1f3a5f; }
  .meta { font-size: 0.9rem; color: #47536b; }
  .badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.85rem; font-weight: 600; background: #e8edf4; color: #1f3a5f; }
  table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  th, td { text-align: left; padding: 0.4rem 0.5rem; border-bottom: 1px solid #dfdcd2; }
  .gap { border: 1px solid #dfdcd2; border-radius: 6px; padding: 0.75rem 1rem; margin-bottom: 0.75rem; }
  .disclaimer { margin-top: 2.5rem; padding-top: 1rem; border-top: 1px solid #dfdcd2; font-size: 0.85rem; font-style: italic; color: #47536b; }
  @media print { body { margin: 0; } }
</style>
</head>
<body>
  <h1>Control Implementation Assessment Report</h1>
  <p class="meta">
    Generated ${esc(generatedAt)} &middot; Report reflects an assessment performed ${new Date(assessment.assessmentTimestamp).toLocaleString()}
  </p>

  <h2>System information</h2>
  <table>
    <tr><th>Framework</th><td>${esc(assessment.frameworkId)}</td></tr>
    <tr><th>Control</th><td>${esc(assessment.controlId)} -- ${esc(assessment.controlName)}</td></tr>
  </table>

  <h2>Original implementation statement</h2>
  <p>${esc(review.statement)}</p>

  <h2>Assessment status</h2>
  <p><span class="badge">${esc(assessment.overallStatus)}</span> &nbsp; Confidence: ${esc(assessment.confidenceLevel)}</p>
  ${assessment.statusWasOverridden ? `<p><em>Note: this status was automatically adjusted by the application. ${esc(assessment.overrideReason ?? "")}</em></p>` : ""}

  <h2>Completeness score: ${assessment.completenessScore}%</h2>
  <table>
    <tr><th>Category</th><th>Weight</th><th>Finding</th><th>Points</th></tr>
    ${assessment.scoreBreakdown
      .map(
        (b) =>
          `<tr><td>${esc(b.category)}</td><td>${b.weight}%</td><td>${esc(b.presence)}</td><td>${
            b.excluded ? "--" : `${b.pointsEarned}/${b.weight}`
          }</td></tr>`
      )
      .join("")}
  </table>

  <h2>Strengths</h2>
  ${list(assessment.strengths)}

  <h2>Gaps</h2>
  ${
    assessment.gaps.length === 0
      ? "<p><em>None identified</em></p>"
      : assessment.gaps
          .map(
            (g) => `<div class="gap">
      <strong>${esc(g.title)}</strong> (${esc(g.severity)})
      <p>${esc(g.explanation)}</p>
      <p><em>Why it matters:</em> ${esc(g.whyItMatters)}</p>
      <p><em>Related requirement:</em> ${esc(g.relatedRequirement)}</p>
      <p><em>Recommended:</em> ${esc(g.recommendedImprovement)}</p>
    </div>`
          )
          .join("")
  }

  <h2>Evidence assessment</h2>
  <table>
    <tr><th>Sufficiency</th><td>${esc(assessment.evidenceAssessment.evidenceSufficiency)}</td></tr>
    <tr><th>Operating effectiveness verifiable</th><td>${assessment.evidenceAssessment.operatingEffectivenessVerifiable ? "Yes" : "No"}</td></tr>
  </table>
  <p><strong>Evidence mentioned:</strong></p>${list(assessment.evidenceAssessment.evidenceMentioned)}
  <p><strong>Evidence expected:</strong></p>${list(assessment.evidenceAssessment.evidenceExpected)}
  <p><strong>Evidence missing:</strong></p>${list(assessment.evidenceAssessment.evidenceMissing)}

  <h2>Recommended improved statement</h2>
  <p>${esc(assessment.recommendedStatement)}</p>

  <h2>Follow-up questions</h2>
  ${list(assessment.followUpQuestions)}

  <h2>Source references</h2>
  ${list(assessment.mcpValidation.sourceReferences)}

  <p class="disclaimer">${esc(assessment.disclaimer)}</p>
</body>
</html>`;
}
