# Threat Model & Security Design

This document maps the AI Control Implementation Reviewer's actual design
decisions to established security and AI-governance frameworks. Every row
references real code in this repository, not aspirational controls --
where a mitigation is partial or MVP-level rather than production-grade,
that's stated plainly rather than glossed over.

Frameworks referenced: **OWASP LLM Top 10**, **OWASP API Security Top 10**,
**OWASP Top 10 (Web)**, **MITRE ATT&CK**, **MITRE ATLAS**, **NIST AI RMF**,
**NIST SP 800-53 Rev. 5**.

---

## 1. AI/LLM-specific risks (OWASP LLM Top 10 & MITRE ATLAS)

| Risk | Framework reference | Mitigation in this app | Location |
|---|---|---|---|
| Prompt injection via user-supplied statement/context text | OWASP LLM01; MITRE ATLAS (Prompt Injection) | System prompt explicitly frames statement/context fields as untrusted data, not instructions, with directions to ignore embedded commands and continue evaluating normally | `lib/ai/systemPrompt.ts` |
| Insecure output handling -- trusting the model's structured response without checking it | OWASP LLM05 | Every AI response is parsed against a strict Zod schema (`AssessmentOutputSchema`) before it reaches the UI; a non-conforming response is rejected with a `malformed_ai_response` error, never silently coerced | `lib/ai/outputSchema.ts`, `app/api/review/route.ts` |
| Excessive agency -- letting the model take actions beyond "answer the question" | OWASP LLM06 | All 8 MCP tools are read-only; there is no write-capable tool for the model to call, so there is nothing to restrict permission-wise even if the model tried | `lib/mcp/server.ts` |
| The model asserting a compliance conclusion not actually supported by evidence (a domain-specific hallucination risk, not just factual hallucination) | OWASP LLM09 (Misinformation); MITRE ATLAS (LLM output manipulation of a downstream decision) | `validate_assessment` MCP tool is called by the model before finalizing, AND independently re-run server-side (`applySafetyOverrides`) regardless of what the model claims to have done -- an unearned "Implemented" status is automatically downgraded | `lib/mcp/tools/validateAssessment.ts`, `lib/ai/reviewLogic.ts` |
| Sensitive information disclosure through the AI response (e.g., leaking the system prompt, environment details) | OWASP LLM02 | System prompt explicitly instructs the model never to reveal instructions/environment/server configuration regardless of what statement text asks; statements are never logged; no secrets are ever included in any prompt sent to the model | `lib/ai/systemPrompt.ts` |
| Unbounded resource consumption via repeated or oversized AI requests | OWASP LLM10 | Input length limits (4000 chars on statement, shorter on context fields) via Zod; rate limiting on `/api/review` (10 requests/min/IP) | `lib/ai/reviewRequestSchema.ts`, `lib/security/rateLimit.ts` |
| Data poisoning of the knowledge base the model relies on | MITRE ATLAS (Data Poisoning) | Framework/control JSON is static, checked into git, code-reviewed, and read-only at runtime -- there is no user-facing or AI-facing write path that could modify `data/frameworks/` | `lib/data/frameworkLoader.ts`, `data/frameworks/` |

---

## 2. API-layer risks (OWASP API Security Top 10)

| Risk | Reference | Mitigation | Location |
|---|---|---|---|
| Broken object-level authorization | API1 | Not applicable in the current MVP -- there is no per-user data or multi-tenant access to protect (no accounts exist). Explicitly listed as a roadmap item rather than silently ignored, since it will matter the moment accounts are added. | `README.md` roadmap |
| Broken authentication | API2 | No authentication exists in the MVP by design (public demonstration app, no PII/PHI persisted). Documented, not accidental. | -- |
| Unrestricted resource consumption | API4 | Rate limiting on both `/api/review` (10/min/IP) and `/api/mcp` (60/min/IP); input length caps everywhere | `lib/security/rateLimit.ts` |
| Server-side request forgery / unsafe URL handling | API7 | The MCP client URL is derived from the incoming request's own origin (`new URL(req.url).origin`), never from user-controllable input | `app/api/review/route.ts` |
| Security misconfiguration | API8 | Security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) applied to every response; `.env.example` documents required variables without real secrets; secrets are never committed (`.gitignore`) | `next.config.ts` (non-CSP headers), `middleware.ts` (per-request nonce-based CSP), `.env.example`, `.gitignore` |
| Improper inventory management (undocumented or forgotten endpoints) | API9 | Only 2 API routes exist (`/api/mcp`, `/api/review`), both documented here and in the README | -- |

---

## 3. Web application risks (OWASP Top 10)

| Risk | Reference | Mitigation | Location |
|---|---|---|---|
| Injection (HTML/script injection via user-supplied statement text appearing in reports) | A03:2021 | The downloadable HTML report escapes all user-supplied text (`esc()` helper) before interpolating it into HTML | `lib/reports/generateReportHtml.ts` |
| Cryptographic failures / sensitive data exposure | A02:2021 | No PHI/PII/credentials are meant to be submitted (explicit warning banner on the statement form); statements are not persisted server-side; review history lives only in the user's own browser localStorage | `components/review/StatementForm.tsx`, `lib/storage/reviewHistory.ts` |
| Security misconfiguration | A05:2021 | Same security-headers mitigation as the API section above | `next.config.ts` |
| Server-side request forgery | A10:2021 | Same as OWASP API7 above -- no user-controllable URL is ever fetched server-side | `app/api/review/route.ts` |

---

## 4. Conventional attack-technique framing (MITRE ATT&CK)

Used here as a threat-modeling lens, not because this app defends network
infrastructure directly -- it informs what a compromised or malicious
input could realistically attempt:

- **Initial Access via public-facing application (T1190):** the only
  public-facing inputs are the statement text and optional context
  fields, both length-limited, schema-validated, and treated as inert data
  by the AI rather than as commands.
- **Exfiltration (TA0010) via a crafted statement asking the AI to reveal
  secrets:** mitigated by the system prompt's explicit refusal instruction
  and by the fact that no secrets are ever placed in any prompt to begin
  with -- there's nothing to exfiltrate even if the instruction were ignored.
- **Resource exhaustion / Denial of Service (T1499):** mitigated by rate
  limiting and input length caps, with the honest caveat (see below) that
  the current rate limiter is per-instance, not globally distributed.

---

## 5. NIST AI RMF framing (Govern / Map / Measure / Manage)

- **Govern:** this document itself, plus the disclaimer injected into
  every assessment (never written by the model) and the explicit
  "human review required" language throughout the app.
- **Map:** the app's scope is deliberately narrow -- one framework, 12
  controls, no write access to anything, no account system. That scope is
  documented, not implicit.
- **Measure:** the deterministic completeness score
  (`lib/scoring/calculateCompleteness.ts`) is calculated by application
  code, not the model, specifically so the "measurement" step of a
  compliance judgment is auditable and reproducible independent of any
  particular AI response.
- **Manage:** `applySafetyOverrides()` is the concrete "manage" control --
  an automated check that overrides the model's own conclusion when it
  isn't earned, rather than trusting the model's self-assessment of its
  own output.

---

## 6. Honest limitations (not hidden)

- **Rate limiting is per-serverless-instance, not globally distributed.**
  On Vercel, each warm function instance has its own memory; a determined
  attacker distributing requests across many cold starts could exceed the
  intended global limit. A production deployment would move this to a
  shared store (Vercel KV / Upstash Redis) -- noted as a roadmap item.
- **No authentication or per-user isolation exists.** This is a public
  demonstration app; anyone with the URL can submit a review. Acceptable
  for a portfolio demo given the explicit no-PHI/PII warning and
  non-persistence of statements server-side, but would need addressing
  before handling real organizational data.
- **The MCP endpoint (`/api/mcp`) is publicly reachable**, not restricted
  to same-origin calls only. It's read-only and rate-limited, which
  bounds the impact, but it is not behind any access control.
- **CSP is per-request-nonce-based with `strict-dynamic`, not just
  same-origin, and has not been tested against every browser edge
  case** -- worth a dedicated pass if this app ever left demo status.
  It was actually tested and initially found broken (a plain `script-src
  'self'` without a nonce blocks Next.js's own required inline hydration
  scripts, hanging every page on "Loading..." forever) -- fixed with
  `middleware.ts` generating a per-request nonce and `app/layout.tsx`
  forcing dynamic rendering so the nonce is always fresh and matching.
- **All pages are forced to render dynamically (`export const dynamic =
  "force-dynamic"` in `app/layout.tsx`)**, giving up static prerendering's
  performance benefit, as a direct consequence of the nonce-based CSP
  above -- a statically prerendered page's inline scripts are baked in at
  build time, before any per-request nonce exists, so they can never
  carry a valid nonce. Acceptable for a portfolio demo's traffic level;
  would be worth reconsidering (e.g., excluding truly static pages like
  `/about` from the nonce requirement) at production scale.
