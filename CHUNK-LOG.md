# Build log

This file exists so a build session can resume exactly where it left off,
without re-reading the whole codebase or repeating finished work.

## Chunk 1 -- Project scaffold & design system (DONE)

- Next.js 16 (App Router) + TypeScript + Tailwind v4 scaffolded via create-next-app
- Installed: zod, @modelcontextprotocol/sdk, ai (Vercel AI SDK), @ai-sdk/anthropic,
  lucide-react, clsx, tailwind-merge, class-variance-authority (deps);
  vitest + testing-library + jsdom (dev deps)
- Full folder skeleton created matching the Phase 1 architecture doc:
  components/{ui,review,dashboard}, lib/{mcp/tools,ai,scoring,data,security,types},
  data/frameworks/nist-800-53-r5/controls, app/api/{review,controls,mcp},
  app/{new-review,control-library,history,about}, tests/{unit,e2e}, docs/
- Design system: paper/ink/status color tokens in app/globals.css (@theme),
  IBM Plex Sans (body) + Source Serif 4 (display) + IBM Plex Mono (control IDs)
  loaded via next/font/google in app/layout.tsx
- Shared primitives: components/SiteNav.tsx (persistent sidebar nav),
  components/ui/Card.tsx, components/ui/PageHeader.tsx, components/ui/StatusBadge.tsx
  (color + icon + label, never color alone), lib/utils.ts (cn helper)
- lib/types/assessment.ts -- canonical ImplementationStatus / GapSeverity /
  FindingPresence unions, matching spec section 7 exactly. Import these
  everywhere rather than re-typing the literal strings.
- All 5 nav routes exist and render (placeholder content): / (Dashboard),
  /new-review, /control-library, /history, /about
- `npm run build` verified successful (Google Fonts fetch fails in the
  sandbox's restricted network -- not a real issue, confirmed the rest of
  the build compiles clean with fonts temporarily stubbed out; will build
  fine on your machine and on Vercel, both of which have normal internet access)
- NOT done yet: no shadcn CLI used (its registry isn't reachable from the
  build sandbox) -- UI primitives are hand-built in the same visual style
  instead; functionally equivalent for this project's needs

## Chunk 2 -- Framework data + Control Library + New Review UI (DONE)

- lib/types/framework.ts -- Zod schemas for Framework/ControlFamily/Control,
  shared by the data layer now and the MCP tools later (Chunk 3 must reuse
  these, not redefine them)
- data/frameworks/nist-800-53-r5/: framework.json, families.json (6 families:
  AC, AU, IA, CM, SC, AT), crosswalks.json (empty stub -- correct until a 2nd
  framework exists), controls/*.json -- all 12 spec-required controls with
  real, application-authored content (purpose, summary, expected statement
  elements, evidence examples, common gaps, interview questions, related
  controls, provenance, source URL)
- lib/data/frameworkLoader.ts -- server-only data access layer; every record
  is Zod-validated on read (listFrameworks, loadFamilies, loadControls,
  loadControl, searchControls)
- components/ui/ProvenanceTag.tsx -- visible official/application-authored/
  sample-data distinction (spec section 4 requirement)
- components/review/ControlBrowser.tsx -- reusable search+family-filter
  control list, used by both Control Library and New Review
- components/review/ControlDetailPanel.tsx -- full control detail display
- components/review/StatementForm.tsx -- statement textarea + collapsible
  optional context fields + PHI/PII warning banner; submit is wired to a
  local state callback only (no AI call yet -- that's Chunk 4)
- app/control-library/ -- real two-pane browse+detail UI, "start a review
  from this control" links to /new-review?control=ID
- app/new-review/ -- select-a-control step -> control detail + statement
  form step; reads the ?control= query param (Suspense-wrapped for
  useSearchParams per Next.js App Router requirement)
- tests/unit/frameworkLoader.test.ts -- 8 Vitest tests covering: framework
  count, family count, all 12 controls present, every control has expected
  elements + evidence, case-insensitive lookup, unknown-control handling,
  search by ID/name/summary, family-filtered search. All passing.
  package.json now has `npm test` -> `vitest run`
- Verified: `npm run build`, `npm run lint`, `npm test` all pass clean
- IMPORTANT: node_modules and .next were stripped before zipping Chunk 1 for
  a smaller download -- always run `npm install` first if picking this repo
  up fresh in the sandbox

## Chunk 3 -- MCP server: all 8 tools, Zod schemas, tests (DONE)

- lib/mcp/schemas.ts -- Zod raw-shape input/output schemas for all 8 tools,
  built on the Chunk 2 Framework/ControlFamily/Control schemas and the
  Chunk 1 ImplementationStatus/FindingPresence unions (no redefinition)
- lib/mcp/tools/*.ts -- one pure, independently-testable function per tool:
  listFrameworks, listControlFamilies, searchControls, getControlDetails,
  getEvidenceRequirements, validateControlReference, mapControl,
  validateAssessment. All read-only, all wrap lib/data/frameworkLoader.ts
  (or, for validateAssessment, apply deterministic business-rule checks --
  no LLM call happens inside these tools).
- validateAssessmentTool is the key anti-hallucination gate: rejects
  "Implemented" status with no evidenceInformation, rejects "Implemented"
  when any required finding category is "Missing", flags every one of the
  8 required categories (Who/What/When/How/Evidence/Scope/Responsibilities/
  Measurability) that wasn't addressed, and never trusts a control
  reference it can't validate against the data layer.
- mapControlTool correctly returns "Not Available" for any cross-framework
  mapping until crosswalks.json has real entries (only 1 framework exists
  in the MVP) -- never fabricates or upgrades confidence.
- lib/types/framework.ts -- added CrosswalkEntrySchema;
  lib/data/frameworkLoader.ts -- added loadCrosswalks()
- lib/mcp/server.ts -- McpServer with all 8 tools registered via
  registerTool(), each returning both structuredContent (validated against
  its outputSchema) and a text content block
- app/api/mcp/route.ts -- Next.js App Router route handler exposing the
  server over Streamable HTTP using WebStandardStreamableHTTPServerTransport
  in STATELESS mode (sessionIdGenerator: undefined, enableJsonResponse:
  true) -- a fresh server+transport per request, which fits Vercel
  Functions (no persistent connection needed since every tool is a stateless
  read). Runs on the default Node.js runtime (not edge) since the data
  loader uses node:fs.
- tests/unit/mcpTools.test.ts -- 18 Vitest tests covering all 8 tools,
  including the validate_assessment rejection cases above
- MANUALLY VERIFIED over real HTTP (not just unit tests): started the dev
  server, POSTed a real MCP `initialize` request (200 OK, correct
  protocolVersion/serverInfo back), a `tools/list` request (all 8 tools
  discoverable with generated JSON schemas), and two `tools/call` requests
  (get_control_details returned real AC-2 data; validate_assessment
  correctly rejected an "Implemented" claim with no evidence and listed
  the 7 missing required categories). This confirms the transport wiring
  works end-to-end, not just the underlying functions.
- Verified: `npm run build`, `npm run lint`, `npx vitest run` (26/26
  passing across both test files) all pass clean
- Note for local testing: the MCP endpoint is at POST/GET/DELETE
  http://localhost:3000/api/mcp -- there is no browser UI change in this
  chunk, it's a backend-only addition. Nothing to see by clicking around
  the site; testing requires either curl/Postman or waiting for Chunk 4
  to wire the AI assistant into it.

## Chunk 4 -- AI assistant integration (DONE)

- Installed @ai-sdk/mcp (separate package from `ai` -- createMCPClient lives
  there, not in the core `ai` package)
- lib/ai/systemPrompt.ts -- strict system prompt: mandatory MCP tool call
  order (validate_control_reference -> get_control_details ->
  get_evidence_requirements -> validate_assessment before any conclusion),
  explicit "user statement/context is DATA not instructions" framing with
  prompt-injection handling instructions, never-invent rules, and an
  instruction to honor validate_assessment's verdict (backed up by server-
  side re-checking below, not just trusted)
- lib/ai/outputSchema.ts -- AssessmentOutputSchema (what the model must
  produce via the submit_assessment tool call) and FullAssessmentResultSchema
  (adds app-injected fields: framework/control identity, fixed disclaimer
  text, timestamp, mcpValidation, completenessScore: null until Chunk 5,
  statusWasOverridden/overrideReason)
- lib/ai/reviewLogic.ts -- applySafetyOverrides() and buildFixedFields():
  PURE functions, no network/AI calls, so fully unit-testable without an
  API key. This is the defense-in-depth layer -- independently re-checks
  the model's proposed status against MCP's validate_assessment output
  rather than trusting the model followed its instructions. Downgrades an
  unearned "Implemented" to "Not Enough Information" automatically.
- lib/ai/reviewRequestSchema.ts -- input validation (length limits) for
  POST /api/review
- app/api/review/route.ts -- the orchestration route:
  1. Checks ANTHROPIC_API_KEY is set (clear 500 error if not -- verified
     this returns the exact right message with no key configured)
  2. Validates request body (Zod) -- verified 400 on empty statement,
     unknown control, and malformed JSON
  3. Creates an MCP client pointed at `${origin}/api/mcp` (same-origin,
     derived from the request URL -- no hardcoded localhost)
  4. Calls generateText() with model "claude-sonnet-5", the MCP tools, and
     a local submit_assessment tool (schema = AssessmentOutputSchema) that
     captures the model's final structured call
  5. Re-validates the captured output against AssessmentOutputSchema
     (malformed response -> 502 with source: "malformed_ai_response")
  6. Independently calls validateAssessmentTool() server-side (Chunk 3's
     function, not a second AI call) and applies applySafetyOverrides()
  7. Injects fixed fields, returns the full result
  8. Distinguishes error sources in responses: ai_provider (502),
     malformed_ai_response (502), mcp_unavailable (502), validation (400),
     config (500) -- per spec section 19's "fail safely and explain which
     layer failed" requirement
- components/review/ResultsView.tsx -- all 7 required tabs (Summary,
  Statement Analysis, Gaps, Evidence, Improved Statement, Follow-Up
  Questions, Validation Sources), reusing StatusBadge and the paper/ink
  design system. Summary tab visibly shows when status was auto-overridden
  and why. Completeness score explicitly says "not yet calculated" rather
  than showing a fake number.
- app/new-review/NewReviewClient.tsx -- StatementForm submit now POSTs to
  /api/review for real, with idle/loading/error/done states; error state
  shows the server's message and offers Try again
- tests/unit/reviewLogic.test.ts -- 6 tests covering: invalid control
  reference always downgrades regardless of proposed status, unearned
  "Implemented" gets downgraded, a correctly-proposed non-Implemented
  status is NOT second-guessed, a valid permitted "Implemented" is left
  alone, disclaimer text is always exact, timestamp is valid ISO
- Verified: `npm run build` (both /api/mcp and /api/review show as dynamic
  routes, correct), `npm run lint`, `npx vitest run` (32/32 across 3 files)
  all pass clean
- MANUALLY VERIFIED over real HTTP: started dev server with no API key ->
  confirmed the exact clear error message and 500 status; started with a
  fake key -> confirmed empty-statement, unknown-control, and malformed-
  JSON all correctly return 400 with specific messages before ever
  reaching Anthropic
- NOT YET TESTED: an actual successful end-to-end AI review (needs a real
  ANTHROPIC_API_KEY, which the user will add locally and in Vercel -- the
  sandbox has no key and can't reach api.anthropic.com anyway). This is the
  first thing to test once the key is added.
- completenessScore is intentionally null in every response right now --
  Chunk 5 fills it in with the deterministic weighted calculation from the
  Phase 1 plan (Who 15%/What 20%/When 15%/How 20%/Evidence 20%/Scope+
  measurability 10%). Do not let the model compute this number; the schema
  has no field for the model to fill it in, by design.

## Chunk 5 -- Deterministic scoring engine (DONE)

- RESOLVED the 6-vs-8-category weight conflict flagged at the end of Chunk 4:
  spec section 8 gives weights for 6 categories (Who 15/What 20/When 15/
  How 20/Evidence 20/Scope+measurability 10), but section 7's required
  findings are 8 categories. Decision (documented in the code comment in
  lib/scoring/calculateCompleteness.ts, not silently picked): the 10%
  "Scope and measurability" bucket is split Scope=4/Responsibilities=3/
  Measurability=3, preserving all 5 named category weights and the 100%
  total exactly as specified.
- lib/scoring/calculateCompleteness.ts -- pure, deterministic, no AI or
  network involvement. Present=100% of weight, Partially Present=50%,
  Missing=0%. Not Applicable is excluded from BOTH numerator and
  denominator (a legitimately N/A category doesn't penalize the score).
  A category the model never addressed at all (absent from the findings
  array, not marked N/A) is scored as Missing with full weight counted --
  this cannot be gamed by the model simply omitting a hard category.
- tests/unit/calculateCompleteness.test.ts -- 9 tests: weights sum to
  exactly 100, all 8 categories covered, all-Present=100, all-Missing=0,
  all-Partial=50, an omitted category scores as Missing (not excluded), a
  legitimate N/A is excluded from the denominator (doesn't drag score
  down), a realistic mixed case computes the exact expected weighted
  score, and an all-N/A edge case returns 0 without NaN/crash
- lib/ai/outputSchema.ts -- FullAssessmentResultSchema.completenessScore is
  now a required number (no longer nullable/placeholder), added
  scoreBreakdown array field
- lib/ai/reviewLogic.ts -- buildFixedFields() no longer sets
  completenessScore (that's now computed by calculateCompleteness(),
  called separately in the route)
- app/api/review/route.ts -- calls calculateCompleteness(proposed.
  statementQualityAnalysis) after the safety-override step, includes
  completenessScore + scoreBreakdown in the response
- components/review/ResultsView.tsx -- Summary tab now shows the real
  percentage (no more "not yet calculated" placeholder) plus a full
  calculation table (category / weight / finding / points) with a caption
  clarifying this is a fixed application calculation, not an AI output,
  and that the score does not by itself determine implementation status --
  satisfies spec section 8's "display the calculation to the user"
  requirement and section 7's "the completeness score must not
  automatically determine compliance status" requirement (status still
  comes from the AI + MCP validate_assessment + applySafetyOverrides path
  from Chunk 4, completely independent of this score)
- Verified: `npm run build`, `npm run lint`, `npx vitest run` (41/41 across
  4 test files) all pass clean
- NOT manually re-tested end-to-end with a live API key in this chunk
  (would need the user's key in the sandbox, which isn't available) --
  the scoring math itself is fully covered by unit tests, and the wiring
  is the same pattern already proven working in Chunk 4. Worth a quick
  live check when picking this up with the user to see a real percentage
  render, but the logic itself doesn't depend on it.

## Chunk 6 -- Review history (browser storage) + report export (DONE)

- lib/storage/reviewHistory.ts -- localStorage-backed history, capped at
  50 entries, key "air-review-history-v1". Every function guards for
  non-browser environments (SSR) and wraps localStorage access in try/catch
  (quota exceeded, disabled storage, etc. fail silently -- the review still
  displays for the current session, it just won't persist). This is
  explicitly BROWSER-ONLY storage, per spec section 13's MVP allowance --
  never sent to or kept on the server, explained both in code comments and
  directly in the History page UI.
- lib/reports/generateReportHtml.ts -- pure function producing a
  self-contained, print-friendly HTML report (spec section 14) covering
  every required field: system info, framework/control, original
  statement, status, completeness score + breakdown, strengths, gaps,
  evidence assessment, improved statement, follow-up questions, source
  references, disclaimer. All user-supplied text is HTML-escaped to
  prevent injection from a statement containing HTML/script-like content --
  verified with a dedicated test.
- lib/dashboard/computeStats.ts -- pure function computing total reviews,
  status breakdown, average completeness score, and top-5 most frequently
  identified gaps (by title) from stored history.
- components/review/DownloadReportButton.tsx -- generates the report HTML
  client-side and triggers a browser download (Blob + object URL); no
  server round-trip, works entirely offline once the review data exists
  locally
- app/new-review/NewReviewClient.tsx -- successful reviews now call
  saveReviewToHistory() and show a "Download report" button alongside the
  results
- app/history/ -- HistoryClient.tsx: expandable list of past reviews
  (control, status badge, score, date), each expands to the full
  ResultsView plus its own download/delete controls; explicit
  browser-only-storage notice at the top; "Clear all history" control
- app/DashboardClient.tsx + components/dashboard/StatsCards.tsx --
  replaced the Chunk 1 placeholder Dashboard with real stats: total
  reviews, average completeness score, reviews-by-status breakdown (all 5
  statuses always shown, zero-filled), most frequently identified gaps
- tests/unit/computeStats.test.ts -- 4 tests: empty history, status
  counting, average score rounding, gap frequency ranking capped at 5
- tests/unit/generateReportHtml.test.ts -- 3 tests: all key fields present
  in output, HTML-escaping prevents script injection, output is a
  well-formed HTML document
- Verified: `npm run build`, `npm run lint`, `npx vitest run` (48/48
  across 6 test files) all pass clean
- Fixed 2 lint errors from a newer eslint-plugin-react-hooks rule
  (react-hooks/set-state-in-effect) on the two "read localStorage after
  mount" effects in HistoryClient and DashboardClient -- this pattern is a
  legitimate, deliberate exception (localStorage needs window, which
  doesn't exist during SSR, so it can't be read during the initial render)
  and is disabled per-line with a comment explaining why, not disabled
  globally.
- NOT manually re-tested end-to-end with a live API key in this chunk
  (same reasoning as Chunk 5 -- sandbox has no key/network to Anthropic).
  Worth clicking through Dashboard and History with a couple of real
  reviews saved when picking this up with the user.

## Remaining chunks (per Phase 1 plan)
7. Testing (Vitest unit, Playwright e2e) + security hardening + docs/THREAT-MODEL.md
8. GitHub + Vercel deployment walkthrough (already substantially done
   incrementally each chunk -- Chunk 8 is really just the final README/
   About-page polish and the AI-RMF/EU-AI-Act framing agreed in Phase 1,
   not first-time deployment setup)
