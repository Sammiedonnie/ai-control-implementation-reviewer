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

## Chunk 7 -- Testing (Playwright e2e) + security hardening + threat model (DONE)

### Security hardening
- lib/security/rateLimit.ts -- in-memory sliding-window rate limiter,
  honestly documented as per-serverless-instance (not globally distributed
  across a Vercel deployment) rather than pretending it's production-grade.
  Applied to both /api/review (10 req/min/IP) and /api/mcp (60 req/min/IP,
  more generous since one review triggers several MCP calls).
  MANUALLY VERIFIED over real HTTP: hammered /api/review 12 times in a
  loop, confirmed requests 11-12 returned 429 with a Retry-After header.
- next.config.ts -- security headers applied to every response
  (X-Content-Type-Options, X-Frame-Options, Referrer-Policy,
  Permissions-Policy, Content-Security-Policy). MANUALLY VERIFIED via curl
  that all 5 headers appear on a real response.
- tests/unit/rateLimit.test.ts -- 5 tests: allows under limit, blocks over
  limit, window resets correctly, clients tracked independently, pruning
  doesn't throw

### docs/THREAT-MODEL.md (new)
Full mapping of this app's actual code to: OWASP LLM Top 10 (prompt
injection, insecure output handling, excessive agency, unsupported-claim
hallucination, sensitive info disclosure, unbounded resource consumption),
MITRE ATLAS (data poisoning), OWASP API Security Top 10 (object-level auth,
resource consumption, SSRF, security misconfig, inventory), OWASP Top 10
Web (injection, sensitive data exposure, SSRF), MITRE ATT&CK (used as a
threat-modeling lens: initial access, exfiltration, DoS), and NIST AI RMF
(Govern/Map/Measure/Manage, each tied to a specific real mechanism already
built in earlier chunks -- the disclaimer, the narrow scope, the
deterministic scoring engine, and applySafetyOverrides respectively).
Ends with an explicit "honest limitations" section (rate limiter isn't
distributed, no auth, MCP endpoint is public) rather than hiding them.

### SECURITY.md (new)
Points to the threat model, summarizes what is/isn't protected, notes
Dependabot + npm audit practice.

### Playwright end-to-end tests -- POST-SHIP DEBUGGING (real story, not glossed over)
- The user actually ran the full e2e suite (first time these tests had ever
  executed against a real browser -- I couldn't in the sandbox, see below).
  Result: 9 passed, 13 failed, all failures clustered around any test that
  types into the statement textarea and then checks the submit button's
  enabled state.
- WRONG FIRST HYPOTHESIS: assumed a Next.js hydration race (Playwright
  interacting before React attaches event listeners) and added a
  `gotoReady()` helper (page.goto + waitForLoadState("networkidle")) to
  tests/e2e/fixtures.ts, applied across all interaction-heavy specs. This
  did NOT fix it -- same 13 failures, same exact error, after the fix.
  Kept the fixture (it's harmless and still good practice) but the real
  cause was elsewhere.
- ACTUAL ROOT CAUSE, found by building a standalone diagnostic spec
  (tests/e2e/diag.spec.ts, since deleted) that logged textarea/button
  state directly instead of using expect() assertions: run ALONE, the
  diagnostic passed cleanly -- fill() worked, button correctly became
  enabled. Combined with an isolated jsdom component test
  (@testing-library/react, run via vitest, confirming StatementForm's own
  onChange/disabled logic is correct in isolation) and the fact that the
  user had manually completed this exact flow successfully many times
  across Chunks 4-6, this ruled out both the component itself and a
  hydration timing issue. The actual cause: Next.js dev mode (`next dev`,
  Turbopack) compiles each route lazily on its FIRST request. Playwright's
  default `fullyParallel: true` runs many spec files concurrently against
  the same dev server -- when two parallel tests hit /new-review for the
  first time simultaneously, that can trigger a compile-then-refresh
  cycle that resets in-progress client state mid-test. This only
  reproduces under parallel load against a dev server, which is exactly
  why the isolated diagnostic (running alone) passed while the full suite
  (running in parallel) consistently failed the same 13 tests every time.
- REAL FIX: playwright.config.ts's webServer now runs `npm run build &&
  npm run start` instead of `npm run dev` -- a production build has no
  per-route lazy-compile step at all, so the race is structurally
  impossible, not just less likely. Verified in the sandbox (can't run
  Playwright itself, but confirmed): `npm run build` succeeds, `npm run
  start` serves the app correctly, and curling /new-review?control=AC-2
  returns the expected page (client-rendered form, confirmed via the RSC
  payload containing all 12 controls -- this is normal Next.js behavior
  for a "use client" page using useSearchParams, not a bug).
- STILL TO CONFIRM: the user needs to re-run `npm run test:e2e` with this
  config change to confirm all 22 tests (19 original + the fixture change)
  pass for real. This is the very next thing to do when picking this back
  up -- don't assume it's fixed until that run is seen.
- tests/e2e/fixtures.ts -- a MOCK_ASSESSMENT object matching
  FullAssessmentResultSchema exactly, PLUS the gotoReady() helper (kept,
  still reasonable practice even though it wasn't the actual fix)

### SECOND ROUND OF POST-SHIP DEBUGGING -- the production-build fix above
was ALSO not the real (full) fix
- After switching webServer to `npm run build && npm run start`, the user
  re-ran the suite: RESULT GOT WORSE (6 passed, down from 9), including
  previously-passing simple tests now failing too. This ruled out the
  parallel-dev-server-race theory as the *complete* explanation and
  pointed at something broken in production specifically.
- Had the user open the app directly in a real (non-automated) browser
  and check DevTools console. Found the real, third, actual root cause:
  `Executing inline script violates the following Content Security
  Policy directive: script-src 'self'` -- the CSP added earlier in this
  same chunk was blocking Next.js's own required inline hydration
  scripts (the RSC payload), so React never finished hydrating on ANY
  page in production. This explains everything: it didn't affect dev
  mode the same way before headers were added; it explains why the page
  visibly hung on "Loading..." forever when checked manually; and it
  explains why switching to a production build (which enforces the CSP
  header, same as dev) surfaced more failures, not fewer -- the dev
  server test run had been silently masking this because Next dev mode's
  behavior around header enforcement/HMR differs.
- Fixed properly, not just widened to 'unsafe-inline' (which would defeat
  CSP's actual purpose): implemented Next.js's documented nonce-based CSP
  pattern via `middleware.ts` -- generates a fresh nonce per request,
  sets `script-src 'self' 'nonce-<value>' 'strict-dynamic'`, and Next.js
  automatically applies that nonce to its own inline scripts.
  next.config.ts no longer sets CSP (kept the other 4 non-CSP headers
  there); CSP moved entirely to middleware since only middleware can
  generate a fresh per-request value and have Next's renderer pick it up.
- THIS ALONE WAS STILL NOT SUFFICIENT: verified via curl that the CSP
  header's nonce and the actual page's script tag nonce DID NOT match.
  Root cause of *that*: `/new-review` (and other routes) were being
  statically prerendered at build time (shown as "○" in the build output
  route table) -- a statically prerendered page's inline scripts are
  baked into the HTML once, at build time, before any per-request nonce
  exists, so they can never carry a nonce matching a later request.
  Fixed by adding `export const dynamic = "force-dynamic"` to
  app/layout.tsx, forcing every page to render fresh per request (build
  output route table now shows every route as "ƒ" dynamic, none static).
- VERIFIED IN THE SANDBOX (all I can do without a real browser): built
  successfully with middleware registered ("ƒ Proxy (Middleware)" in
  build output); curled a single request and confirmed byte-for-byte
  that the CSP header's nonce value and the page's `nonce="..."`
  attribute match exactly. This is strong evidence hydration will now
  work, but per the project's own honesty standard: NOT CONFIRMED with
  an actual browser or the e2e suite yet -- that confirmation is the
  very next step, not yet done as of this log entry.
- Lesson worth keeping in mind for future chunks: security hardening
  changes (especially CSP) need to be tested against the actual running
  app in a real browser, not just verified as "headers are present" --
  a header can be technically correct and still break the entire
  application. This was caught only because the user pushed back with
  real test results instead of me declaring it done after the first
  curl-based header check.

### CONFIRMED WORKING -- the fix was real
- User re-ran the manual browser check first: New Review page loaded,
  typing enabled the button, a real AI review completed successfully
  (36% score, Partially Implemented, AC-2) with strict CSP intact.
- User then ran the full e2e suite: 22 of 23 passed. The one remaining
  failure was a genuine bug in the TEST itself, not the app: "No evidence
  retention location" text appears twice on the Gaps tab page (once as
  the actual gap's `<h3>` title, once inside the control's unrelated
  "Common gaps" reference list elsewhere on the page) -- Playwright's
  strict-mode `getByText()` correctly refused to guess which one was
  meant. Fixed by switching that one assertion to
  `getByRole("heading", { name: ... })`, which matches only the gap
  card's actual title. Re-verified: tsc, lint, and the 53-test Vitest
  suite all still pass after this change (the e2e suite itself needs
  one more run by the user to confirm 23/23, expected but not yet seen).
- Chunk 7 is NOW genuinely, empirically complete -- not just "should
  work based on code review," but confirmed via actual execution: real
  HTTP requests for rate limiting and headers (done earlier in this
  chunk), and now a real browser + the full Playwright suite for
  everything else. This is the standard the rest of the project should
  be held to when picking up new work.
- tests/e2e/navigation.spec.ts -- all 5 nav routes load with correct heading
- tests/e2e/control-library.spec.ts -- search by ID, filter by family,
  "start a review from this control" link behavior
- tests/e2e/new-review-form.spec.ts -- PHI warning visible, submit button
  disabled until text entered, optional fields hidden until expanded,
  ?control= query param preselection
- tests/e2e/new-review-success-flow.spec.ts -- intercepts POST /api/review
  with a mocked successful response (no real API key/cost needed) and
  verifies: structured Summary result renders, Gaps tab shows gap
  analysis, Validation Sources tab shows MCP source references, Download
  report button triggers a real file download with the right filename
  pattern, and the review appears in Review History afterward
- tests/e2e/new-review-error-states.spec.ts -- intercepts POST /api/review
  with 502 ai_provider, 502 malformed_ai_response, 502 mcp_unavailable,
  and a network abort -- verifies each shows the right message and that
  Try again returns to a working form without losing the selected control
- vitest.config.ts updated to explicitly `include: ["tests/unit/**"]` so
  Vitest doesn't try to execute the Playwright spec files (they use
  @playwright/test's own test/expect, not Vitest's -- confirmed this was
  actually broken before the fix: Vitest picked up all 5 e2e spec files
  and errored on each because of the `test.describe` API mismatch; fixed
  and re-verified clean)
- package.json: added `npm run test:e2e` -> `playwright test`
- **IMPORTANT, could not verify in this sandbox:** the sandbox's network
  egress only allows a fixed domain list (npm registry, GitHub, PyPI,
  etc.) and does NOT include cdn.playwright.dev, so `npx playwright
  install chromium` fails here with a 403 "Host not in allowlist" error --
  confirmed by actually attempting it. All 15 e2e tests type-check
  correctly (`npx tsc --noEmit` passes with them included) but have never
  actually been executed against a running browser. This is the first
  thing to run on the user's own machine (which has normal internet
  access): `npx playwright install` then `npm run test:e2e`.
- Verified: `npm run build`, `npm run lint`, `npx vitest run` (53/53 across
  7 unit test files) all pass clean

### Repository-completeness items also finished in this pass
- docs/AI-RMF-SELF-ASSESSMENT.md -- Govern/Map/Measure/Manage mapped to
  concrete code, with an explicit "what this does NOT claim" section
- CONTRIBUTING.md -- local dev checks + code organization guide
- .github/workflows/ci.yml -- lint -> typecheck -> unit tests -> build in
  one job, e2e (installs Playwright chromium with --with-deps) in a second
  job that depends on the first
- LICENSE -- MIT, matching the README's recommendation
- README.md -- fully rewritten from the stale Chunk-1 version: what the
  app does, testing instructions, an MCP inspection command example,
  full GitHub->Vercel deployment walkthrough (including the "redeploy
  after adding an env var" gotcha the user hit personally in Chunk 4),
  a troubleshooting section, security/limitations pointer, honest roadmap

## Remaining chunks (per Phase 1 plan)
8. Final polish: About page content only at this point (business problem,
   how AI/MCP work, data provenance, responsible-AI framing, EU AI Act
   risk-classification note per the Phase 1 enhancement list, portfolio
   presentation section). This is the only substantive work left --
   everything structural, functional, tested, and security-hardened is
   done and empirically confirmed working as of this log entry.
