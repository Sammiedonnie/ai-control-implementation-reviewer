"use client";

import { useState } from "react";
import { Info } from "lucide-react";

export type OptionalContext = {
  systemName: string;
  systemOwner: string;
  technologyUsed: string;
  responsibleRole: string;
  reviewFrequency: string;
  evidenceAvailable: string;
};

export function StatementForm({
  onSubmit,
}: {
  onSubmit: (statement: string, context: OptionalContext) => void;
}) {
  const [statement, setStatement] = useState("");
  const [showOptional, setShowOptional] = useState(false);
  const [context, setContext] = useState<OptionalContext>({
    systemName: "",
    systemOwner: "",
    technologyUsed: "",
    responsibleRole: "",
    reviewFrequency: "",
    evidenceAvailable: "",
  });

  const fieldClass =
    "w-full px-3 py-2 text-sm rounded-md border border-line bg-paper-raised focus-visible:outline-2 focus-visible:outline-accent";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(statement, context);
      }}
      className="space-y-4"
    >
      <div className="rounded-md border border-line bg-status-not-enough-info-bg px-3 py-2.5 flex gap-2 items-start">
        <Info className="size-4 text-status-not-enough-info shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-xs text-ink-soft">
          Don&apos;t submit real PHI, PII, credentials, production secrets, or
          confidential audit evidence -- this is a public demonstration
          application. Statements are not stored server-side by default.
        </p>
      </div>

      <div>
        <label htmlFor="statement" className="block text-sm font-medium text-ink mb-1.5">
          Implementation statement
        </label>
        <textarea
          id="statement"
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          rows={6}
          maxLength={4000}
          placeholder="Describe how this control is implemented..."
          className={fieldClass}
        />
        <p className="mt-1 text-xs text-ink-faint">{statement.length}/4000</p>
      </div>

      <button
        type="button"
        onClick={() => setShowOptional((v) => !v)}
        className="text-sm text-accent hover:underline"
      >
        {showOptional ? "Hide" : "Add"} optional context (system name, owner,
        technology, role, frequency, evidence)
      </button>

      {showOptional && (
        <div className="grid sm:grid-cols-2 gap-3">
          {(
            [
              ["systemName", "System name"],
              ["systemOwner", "System owner"],
              ["technologyUsed", "Technology used"],
              ["responsibleRole", "Responsible role"],
              ["reviewFrequency", "Review frequency"],
              ["evidenceAvailable", "Evidence available"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label htmlFor={key} className="block text-xs font-medium text-ink-soft mb-1">
                {label}
              </label>
              <input
                id={key}
                type="text"
                value={context[key]}
                onChange={(e) =>
                  setContext((c) => ({ ...c, [key]: e.target.value }))
                }
                className={fieldClass}
              />
            </div>
          ))}
        </div>
      )}

      <button
        type="submit"
        disabled={!statement.trim()}
        className="w-full sm:w-auto text-sm font-medium text-white bg-accent hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity rounded-md px-5 py-2.5"
      >
        Review Implementation
      </button>
    </form>
  );
}
