import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="About This Project"
        description="The problem, the design, and why human review still matters."
      />
      <div className="p-6 md:p-10 space-y-6 max-w-2xl">
        <Card>
          <h2 className="font-display font-semibold text-ink mb-2">
            The Problem
          </h2>
          <p className="text-sm text-ink-soft">
            GRC analysts and ISSOs spend hours manually checking control
            implementation statements against frameworks like NIST SP
            800-53. This tool speeds up that first pass — flagging gaps,
            missing evidence, and vague language — while keeping a human
            firmly in the loop for the final call.
          </p>
        </Card>

        <Card>
          <h2 className="font-display font-semibold text-ink mb-2">
            How AI and MCP Are Used
          </h2>
          <p className="text-sm text-ink-soft">
            The AI assessment is powered by Claude, connected through a
            custom Model Context Protocol (MCP) server. Critically, the
            model cannot invent control requirements from memory — it must
            call MCP tools to retrieve the actual NIST 800-53 control text,
            evidence requirements, and related controls before it can draw
            any conclusion. A server-side validation layer independently
            re-checks the AI's proposed status against the same source
            data, regardless of what the model claims to have done.
          </p>
        </Card>

        <Card>
          <h2 className="font-display font-semibold text-ink mb-2">
            Data Provenance
          </h2>
          <p className="text-sm text-ink-soft">
            All control content is sourced directly from NIST SP 800-53
            Revision 5. Nothing is generated or paraphrased from the
            model's general knowledge — every control definition, gap, and
            evidence requirement traces back to the underlying dataset
            shipped with this application.
          </p>
        </Card>

        <Card>
          <h2 className="font-display font-semibold text-ink mb-2">
            Responsible AI Design
          </h2>
          <p className="text-sm text-ink-soft">
            This project treats every user-submitted statement as untrusted
            input, not as instructions to the model. A deterministic
            scoring engine — not the AI — calculates the final completeness
            score, so results stay consistent and explainable rather than
            subject to model variance. The AI's role is limited to analysis
            and explanation, never final judgment.
          </p>
        </Card>

        <Card>
          <h2 className="font-display font-semibold text-ink mb-2">
            Threat Model &amp; Governance Framing
          </h2>
          <p className="text-sm text-ink-soft">
            The design draws on the NIST AI Risk Management Framework and
            considers relevant EU AI Act obligations around transparency
            and human oversight for AI systems used in compliance-adjacent
            decisions. This tool is explicitly positioned as decision
            support, not decision automation — it accelerates review, but
            a qualified human analyst makes the final determination.
          </p>
        </Card>

        <Card>
          <h2 className="font-display font-semibold text-ink mb-2">
            Why Human Review Still Matters
          </h2>
          <p className="text-sm text-ink-soft">
            No AI system should be the sole authority on whether a control
            is truly implemented — organizational context, compensating
            controls, and risk tolerance require human judgment. This tool
            is built to make that judgment faster and better-informed, not
            to replace it.
          </p>
        </Card>
      </div>
    </>
  );
}