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

## Chunk 3 -- next up: MCP server (all 8 tools, Zod schemas, tests)
Not started. The 8 tools should be thin wrappers around lib/data/frameworkLoader.ts
functions already built in Chunk 2 -- validate_control_reference, get_control_details,
get_evidence_requirements, search_controls, list_frameworks, list_control_families
map almost directly. map_control and validate_assessment are new logic.

## Remaining chunks (per Phase 1 plan)
4. AI assistant integration (system prompt, AI SDK route, structured output)
5. Deterministic scoring engine
6. History (browser storage) + report export
7. Testing (Vitest unit, Playwright e2e) + security hardening + docs/THREAT-MODEL.md
8. GitHub + Vercel deployment walkthrough
