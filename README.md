# AI Control Implementation Reviewer

A portfolio project for GRC analysts, ISSOs, and security control assessors:
enter a security-control implementation statement, and get a structured,
explainable assessment -- validated against a custom Model Context Protocol
(MCP) server so the AI can't invent control requirements, evidence
expectations, or compliance conclusions.

**Status: functionally complete, under active polish. See `CHUNK-LOG.md`
for exactly what's done and what's next** -- that file is the source of
truth if a build session gets interrupted.

## What it does

1. Select a NIST SP 800-53 Rev. 5 control (12 included in this demo).
2. Enter an implementation statement (optionally with system/owner/
   technology/frequency/evidence context).
3. Claude assesses it -- but only after calling MCP tools to retrieve the
   real control requirements and validate its own proposed findings before
   finalizing an answer.
4. Get back a structured result: implementation status, a deterministic
   completeness score (calculated by application code, never the model),
   strengths, gaps with severity, evidence assessment, an improved
   statement with placeholders for missing info, follow-up questions, and
   MCP-validated source references.
5. Every review is saved to your browser's local history (never sent to a
   server) and can be downloaded as a print-friendly HTML report.

## Tech stack

Next.js (App Router) · TypeScript · React · Tailwind CSS · Vercel AI SDK ·
Anthropic Claude API · a custom TypeScript MCP server (Streamable HTTP) ·
Zod · Vitest · Playwright · deployed via GitHub -> Vercel.

## Getting started (local development)

### Prerequisites
- [Node.js](https://nodejs.org/) 20 or later
- An [Anthropic API key](https://console.anthropic.com/) (required for the
  AI review feature -- the rest of the app works without one)

### Windows (PowerShell)

```powershell
cd ai-control-implementation-reviewer
npm install
copy .env.example .env.local
```

Then open `.env.local` and paste your key after `ANTHROPIC_API_KEY=`.

```powershell
npm run dev
```

Then open http://localhost:3000 in your browser.

### macOS / Linux

```bash
cd ai-control-implementation-reviewer
npm install
cp .env.example .env.local
```

Then open `.env.local` and paste your key after `ANTHROPIC_API_KEY=`.

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

## Testing

```bash
npm run lint       # ESLint
npx tsc --noEmit   # Type check
npm test           # Vitest unit tests (~50+ tests covering data loading,
                    # all 8 MCP tools, the scoring engine, safety-override
                    # logic, dashboard stats, and report generation)
npm run test:e2e   # Playwright end-to-end tests -- run `npx playwright
                    # install` once first to download browser binaries
```

CI (`.github/workflows/ci.yml`) runs all of these automatically on every
push to `main`.

## MCP server instructions

The MCP server lives at `POST /api/mcp` (Streamable HTTP, stateless mode)
and runs as part of the same Next.js deployment -- there's nothing separate
to start. To inspect it manually, POST a JSON-RPC message, e.g.:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/mcp" -Method Post `
  -ContentType "application/json" `
  -Headers @{Accept="application/json, text/event-stream"} `
  -Body '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## Deployment (GitHub -> Vercel)

1. Push this repository to GitHub.
2. Import it into [Vercel](https://vercel.com) (New Project -> select the
   repo).
3. In the Vercel project's Settings -> Environment Variables, add
   `ANTHROPIC_API_KEY` with your key, applied to Production (and Preview/
   Development if you want those to work too).
4. Deploy. Every future push to `main` auto-deploys.
5. If you add or change an environment variable after the first deploy,
   trigger a manual **Redeploy** from the Deployments tab -- Vercel does
   not automatically rebuild just because a variable changed.

No localhost URLs are hardcoded anywhere -- the MCP client URL is derived
from each request's own origin (`app/api/review/route.ts`), so this works
identically in local dev and in any Vercel deployment URL.

## Troubleshooting

- **"The server is not configured with an Anthropic API key yet"** --
  `ANTHROPIC_API_KEY` isn't set. Check `.env.local` locally, or Vercel's
  Environment Variables (and redeploy after adding it there).
- **A review fails immediately** -- check the browser console/network tab
  for the actual error `source` field (`ai_provider`, `malformed_ai_response`,
  or `mcp_unavailable` -- see `app/api/review/route.ts`) to know which
  layer failed.
- **`npm install` warnings about install-scripts** -- these are safe to
  ignore; they're about optional native dependencies, not errors.

## Project structure

```
app/            Next.js routes (pages + API routes)
components/     Shared UI (components/ui) and feature components
lib/            MCP server + tools, AI integration, scoring engine,
                framework data loader, security helpers, shared types
data/           Framework control content (JSON), one file per control
tests/          Vitest unit tests, Playwright end-to-end tests
docs/           Threat model and AI-governance documentation
.github/        CI workflow
```

## Security & limitations

See `SECURITY.md` and `docs/THREAT-MODEL.md` for the full picture,
including honest limitations (rate limiting is per-instance, not globally
distributed; there is no authentication or account system in this MVP).

## Roadmap

- Broken object-level authorization / account system (not needed until
  multi-user data isolation matters)
- Shared-store rate limiting (Vercel KV / Upstash) instead of per-instance
- Additional frameworks (HIPAA, NIST CSF, SOC 2, etc.) -- the data layer
  and MCP `map_control` tool were built to support this without rewriting
  application code
- PDF export as an alternative to the current HTML report

## License

MIT.
