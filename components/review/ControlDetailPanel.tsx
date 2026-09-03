import type { Control } from "@/lib/types/framework";
import { ProvenanceTag } from "@/components/ui/ProvenanceTag";
import { ExternalLink } from "lucide-react";

export function ControlDetailPanel({ control }: { control: Control }) {
  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="control-id text-sm font-semibold text-accent">
            {control.controlId}
          </span>
          <h2 className="text-lg font-display font-semibold text-ink">
            {control.controlName}
          </h2>
        </div>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <ProvenanceTag provenance={control.provenance} />
          <a
            href={control.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
          >
            Source reference <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        </div>
      </div>

      <section>
        <h3 className="text-sm font-semibold text-ink mb-1">Purpose</h3>
        <p className="text-sm text-ink-soft">{control.purpose}</p>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-ink mb-1">Plain-language summary</h3>
        <p className="text-sm text-ink-soft">{control.summary}</p>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-ink mb-1.5">
          What a complete statement should cover
        </h3>
        <ul className="space-y-1">
          {control.expectedStatementElements.map((el) => (
            <li key={el} className="text-sm text-ink-soft flex gap-2">
              <span className="text-accent" aria-hidden="true">
                &middot;
              </span>
              {el}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-ink mb-1.5">
          Example expected evidence
        </h3>
        <ul className="space-y-1">
          {control.evidenceExamples.map((ev) => (
            <li key={ev} className="text-sm text-ink-soft flex gap-2">
              <span className="text-accent" aria-hidden="true">
                &middot;
              </span>
              {ev}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-ink mb-1.5">Common gaps</h3>
        <ul className="space-y-1">
          {control.commonGaps.map((gap) => (
            <li key={gap} className="text-sm text-ink-soft flex gap-2">
              <span className="text-status-partial" aria-hidden="true">
                &middot;
              </span>
              {gap}
            </li>
          ))}
        </ul>
      </section>

      {control.relatedControls.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-ink mb-1.5">Related controls</h3>
          <div className="flex gap-2 flex-wrap">
            {control.relatedControls.map((rc) => (
              <span
                key={rc}
                className="control-id text-xs px-2 py-1 rounded border border-line text-ink-soft"
              >
                {rc}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
