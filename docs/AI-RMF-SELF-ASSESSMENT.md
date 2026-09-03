# NIST AI RMF Self-Assessment

A short, honest mapping of this project to the NIST AI Risk Management
Framework's four functions. This is a self-assessment for a portfolio
demonstration project, not a formal audit -- written to show the design
was informed by AI RMF thinking, not to claim certification.

## Govern

- The disclaimer shown on every assessment (`REQUIRED_DISCLAIMER` in
  `lib/ai/outputSchema.ts`) is injected by application code, never written
  by the model -- it cannot be omitted or rephrased away by an unusual
  prompt or a model that "forgets."
- `docs/THREAT-MODEL.md` and this document exist specifically so the
  project's AI-governance posture is written down, not just implied by
  the code.
- The system prompt (`lib/ai/systemPrompt.ts`) is itself a governance
  artifact -- it encodes explicit rules about what the model may and may
  not claim, reviewed and versioned in source control like any other code.

## Map

- Scope is deliberately narrow: one framework (NIST SP 800-53 Rev. 5),
  12 controls, read-only MCP tools, no account system, no write access to
  anything. This scope is documented (README, About page) rather than
  left implicit or allowed to creep.
- Intended users (GRC analysts, ISSOs, assessors, students -- see spec
  section 2) and the explicit non-use case (this is not an audit tool,
  not a compliance certifier, not a replacement for human review) are
  both stated plainly in the UI disclaimer and the About page.

## Measure

- The completeness score (`lib/scoring/calculateCompleteness.ts`) is
  calculated by deterministic application code, not the model -- the
  schema the model must fill in has no field for a numeric score, by
  design, so there is nothing for the model to silently invent here.
- `validate_assessment` (an MCP tool, not an LLM call) provides a second,
  independent measurement of whether the model's own proposed findings
  actually support its proposed status.
- Every category the model must assess (Who/What/When/How/Evidence/Scope/
  Responsibilities/Measurability) is validated against a fixed, required
  list -- a model that skips a hard category is caught, not silently
  trusted.

## Manage

- `applySafetyOverrides()` (`lib/ai/reviewLogic.ts`) is the concrete
  "manage" control: it automatically downgrades an "Implemented" status
  that validate_assessment says isn't earned, regardless of what
  instructions the model was given or whether it says it checked.
  Instructions alone are not treated as sufficient risk management --
  code enforces the outcome.
- Rate limiting (`lib/security/rateLimit.ts`) and input length limits
  manage resource-consumption risk from the AI-facing endpoint.
- The "Review failed" error states (spec section 19) manage the failure
  mode where the AI provider, MCP server, or model output itself is
  unavailable or malformed -- the user gets an honest, specific message
  rather than a silent wrong answer or a crash.

## What this self-assessment does NOT claim

- This is not a certified or externally audited AI RMF assessment.
- "Manage" here covers the specific risks this app's design anticipated
  (unearned status claims, resource exhaustion, malformed output) -- it
  does not claim comprehensive risk coverage for every possible AI RMF
  category (e.g., fairness/bias testing was not performed, since the
  model's task here is document analysis against a fixed rubric, not a
  decision about people).
