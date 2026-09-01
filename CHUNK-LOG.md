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

## Chunk 2 -- next up: framework data + Control Library + New Review static UI
Not started.

## Remaining chunks (per Phase 1 plan)
3. MCP server (all 8 tools, Zod schemas, tests)
4. AI assistant integration (system prompt, AI SDK route, structured output)
5. Deterministic scoring engine
6. History (browser storage) + report export
7. Testing (Vitest unit, Playwright e2e) + security hardening + docs/THREAT-MODEL.md
8. GitHub + Vercel deployment walkthrough
