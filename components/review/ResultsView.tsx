"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import type { FullAssessmentResult } from "@/lib/ai/outputSchema";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const TABS = [
  "Summary",
  "Statement Analysis",
  "Gaps",
  "Evidence",
  "Improved Statement",
  "Follow-Up Questions",
  "Validation Sources",
] as const;
type Tab = (typeof TABS)[number];

const PRESENCE_ICON = {
  Present: { icon: CheckCircle2, className: "text-status-implemented" },
  "Partially Present": { icon: AlertTriangle, className: "text-status-partial" },
  Missing: { icon: XCircle, className: "text-status-not-implemented" },
  "Not Applicable": { icon: MinusCircle, className: "text-ink-faint" },
};

const SEVERITY_CLASS: Record<string, string> = {
  Low: "text-severity-low bg-status-implemented-bg",
  Moderate: "text-severity-moderate bg-status-partial-bg",
  High: "text-severity-high bg-status-partial-bg",
  Critical: "text-severity-critical bg-status-not-implemented-bg",
};

export function ResultsView({ result }: { result: FullAssessmentResult }) {
  const [tab, setTab] = useState<Tab>("Summary");

  return (
    <div>
      <div className="flex gap-1 border-b border-line overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
              tab === t
                ? "border-accent text-accent"
                : "border-transparent text-ink-soft hover:text-ink"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="pt-5">
        {tab === "Summary" && (
          <div className="space-y-4">
            {result.statusWasOverridden && (
              <Card className="border-status-partial bg-status-partial-bg flex gap-2.5 items-start">
                <AlertTriangle className="size-4 text-status-partial shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-ink">
                  <strong>Status adjusted automatically:</strong> {result.overrideReason}
                </p>
              </Card>
            )}
            <Card>
              <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-ink-faint">Framework</dt>
                  <dd className="text-ink font-medium">{result.frameworkId}</dd>
                </div>
                <div>
                  <dt className="text-ink-faint">Control</dt>
                  <dd className="text-ink font-medium control-id">
                    {result.controlId} -- {result.controlName}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-faint">Overall status</dt>
                  <dd className="mt-1">
                    <StatusBadge status={result.overallStatus} />
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-faint">Confidence level</dt>
                  <dd className="text-ink font-medium">{result.confidenceLevel}</dd>
                </div>
                <div>
                  <dt className="text-ink-faint">Completeness score</dt>
                  <dd className="text-ink font-medium text-lg">{result.completenessScore}%</dd>
                </div>
                <div>
                  <dt className="text-ink-faint">Assessed</dt>
                  <dd className="text-ink font-medium">
                    {new Date(result.assessmentTimestamp).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </Card>
            <Card>
              <h3 className="text-sm font-semibold text-ink mb-3">
                How the completeness score was calculated
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-ink-faint text-xs border-b border-line">
                    <th className="pb-2 font-medium">Category</th>
                    <th className="pb-2 font-medium">Weight</th>
                    <th className="pb-2 font-medium">Finding</th>
                    <th className="pb-2 font-medium text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {result.scoreBreakdown.map((b) => (
                    <tr key={b.category} className={b.excluded ? "text-ink-faint" : "text-ink-soft"}>
                      <td className="py-1.5">{b.category}</td>
                      <td className="py-1.5">{b.weight}%</td>
                      <td className="py-1.5">
                        {b.excluded ? `${b.presence} (excluded)` : b.presence}
                      </td>
                      <td className="py-1.5 text-right">
                        {b.excluded ? "--" : `${b.pointsEarned}/${b.weight}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-xs text-ink-faint">
                Score = sum of points earned / sum of applicable weight (Not
                Applicable categories are excluded from both). This is a
                fixed application calculation, not something the AI computed.
                It does not by itself determine implementation status --
                evidence sufficiency and operating effectiveness matter too.
              </p>
            </Card>
            {result.strengths.length > 0 && (
              <Card>
                <h3 className="text-sm font-semibold text-ink mb-2">Strengths</h3>
                <ul className="space-y-1">
                  {result.strengths.map((s) => (
                    <li key={s} className="text-sm text-ink-soft flex gap-2">
                      <CheckCircle2 className="size-4 text-status-implemented shrink-0 mt-0.5" aria-hidden="true" />
                      {s}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            <p className="text-xs text-ink-faint italic border-t border-line pt-4">{result.disclaimer}</p>
          </div>
        )}

        {tab === "Statement Analysis" && (
          <Card className="p-0 divide-y divide-line">
            {result.statementQualityAnalysis.map((f) => {
              const { icon: Icon, className } = PRESENCE_ICON[f.presence];
              return (
                <div key={f.category} className="p-4 flex gap-3">
                  <Icon className={cn("size-4 shrink-0 mt-0.5", className)} aria-hidden="true" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-ink">{f.category}</span>
                      <span className={cn("text-xs", className)}>{f.presence}</span>
                    </div>
                    <p className="text-sm text-ink-soft mt-0.5">{f.explanation}</p>
                  </div>
                </div>
              );
            })}
          </Card>
        )}

        {tab === "Gaps" && (
          <div className="space-y-3">
            {result.gaps.length === 0 ? (
              <p className="text-sm text-ink-soft">No gaps identified.</p>
            ) : (
              result.gaps.map((g) => (
                <Card key={g.title}>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold text-ink">{g.title}</h3>
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full shrink-0",
                        SEVERITY_CLASS[g.severity]
                      )}
                    >
                      {g.severity}
                    </span>
                  </div>
                  <p className="text-sm text-ink-soft mt-1.5">{g.explanation}</p>
                  <p className="text-sm text-ink-soft mt-2">
                    <span className="font-medium text-ink">Why it matters: </span>
                    {g.whyItMatters}
                  </p>
                  <p className="text-sm text-ink-soft mt-1">
                    <span className="font-medium text-ink">Related requirement: </span>
                    {g.relatedRequirement}
                  </p>
                  <p className="text-sm text-accent mt-2">
                    <span className="font-medium">Recommended: </span>
                    {g.recommendedImprovement}
                  </p>
                </Card>
              ))
            )}
          </div>
        )}

        {tab === "Evidence" && (
          <div className="space-y-4">
            <Card>
              <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-ink-faint">Evidence sufficiency</dt>
                  <dd className="text-ink font-medium">{result.evidenceAssessment.evidenceSufficiency}</dd>
                </div>
                <div>
                  <dt className="text-ink-faint">Operating effectiveness verifiable</dt>
                  <dd className="text-ink font-medium">
                    {result.evidenceAssessment.operatingEffectivenessVerifiable ? "Yes" : "No"}
                  </dd>
                </div>
                {result.evidenceAssessment.evidenceAge && (
                  <div>
                    <dt className="text-ink-faint">Evidence age</dt>
                    <dd className="text-ink font-medium">{result.evidenceAssessment.evidenceAge}</dd>
                  </div>
                )}
              </dl>
            </Card>
            {(
              [
                ["Evidence mentioned", result.evidenceAssessment.evidenceMentioned],
                ["Evidence expected", result.evidenceAssessment.evidenceExpected],
                ["Evidence missing", result.evidenceAssessment.evidenceMissing],
              ] as const
            ).map(([label, items]) => (
              <Card key={label}>
                <h3 className="text-sm font-semibold text-ink mb-2">{label}</h3>
                {items.length === 0 ? (
                  <p className="text-sm text-ink-faint">None</p>
                ) : (
                  <ul className="space-y-1">
                    {items.map((i) => (
                      <li key={i} className="text-sm text-ink-soft flex gap-2">
                        <span className="text-accent" aria-hidden="true">&middot;</span>
                        {i}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            ))}
          </div>
        )}

        {tab === "Improved Statement" && (
          <Card>
            <p className="text-sm text-ink-soft whitespace-pre-wrap">{result.recommendedStatement}</p>
          </Card>
        )}

        {tab === "Follow-Up Questions" && (
          <Card>
            {result.followUpQuestions.length === 0 ? (
              <p className="text-sm text-ink-soft">No follow-up questions.</p>
            ) : (
              <ul className="space-y-2">
                {result.followUpQuestions.map((q) => (
                  <li key={q} className="text-sm text-ink-soft flex gap-2">
                    <span className="text-accent" aria-hidden="true">&middot;</span>
                    {q}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        {tab === "Validation Sources" && (
          <div className="space-y-4">
            <Card>
              <h3 className="text-sm font-semibold text-ink mb-2">MCP-validated sources</h3>
              <ul className="space-y-1">
                {result.mcpValidation.sourceReferences.map((s) => (
                  <li key={s} className="text-sm text-ink-soft flex gap-2">
                    <span className="text-accent" aria-hidden="true">&middot;</span>
                    {s}
                  </li>
                ))}
              </ul>
            </Card>
            {result.mcpValidation.unsupportedClaims.length > 0 && (
              <Card className="border-status-not-implemented bg-status-not-implemented-bg">
                <h3 className="text-sm font-semibold text-ink mb-2">Unsupported claims flagged</h3>
                <ul className="space-y-1">
                  {result.mcpValidation.unsupportedClaims.map((c) => (
                    <li key={c} className="text-sm text-ink-soft">{c}</li>
                  ))}
                </ul>
              </Card>
            )}
            {result.mcpValidation.missingRequiredConsiderations.length > 0 && (
              <Card>
                <h3 className="text-sm font-semibold text-ink mb-2">Missing required considerations</h3>
                <ul className="space-y-1">
                  {result.mcpValidation.missingRequiredConsiderations.map((c) => (
                    <li key={c} className="text-sm text-ink-soft">{c}</li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
