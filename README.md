# AI Control Implementation Reviewer

A portfolio project for GRC analysts, ISSOs, and security control assessors:
enter a security-control implementation statement, and get a structured,
explainable assessment -- validated against a custom Model Context Protocol
(MCP) server so the AI can't invent control requirements, evidence
expectations, or compliance conclusions.

**Status: under active build, in chunks. See `CHUNK-LOG.md` for exactly
what's done and what's next** -- that file is the source of truth if a build
session gets interrupted.

## Tech stack

Next.js (App Router) · TypeScript · React · Tailwind CSS · Vercel AI SDK ·
Anthropic Claude API · a custom TypeScript MCP server (Streamable HTTP) ·
Zod · Vitest · Playwright · deployed via GitHub -> Vercel.

## Getting started (local development)

### Prerequisites
- [Node.js](https://nodejs.org/) 20 or later
- A free [Anthropic API key](https://console.anthropic.com/) (only needed
  once the AI review feature is built -- not required to view the static
  UI today)

### Windows (PowerShell)

```powershell
cd ai-control-implementation-reviewer
npm install
copy .env.example .env.local
npm run dev
```

Then open http://localhost:3000 in your browser.

### macOS / Linux

```bash
cd ai-control-implementation-reviewer
npm install
cp .env.example .env.local
npm run dev
```

Then open http://localhost:3000 in your browser.

## What you should see right now (Chunk 1)

A working left-hand navigation with five pages -- Dashboard, New Review,
Control Library, Review History, About This Project -- each showing a
placeholder card explaining what chunk fills it in. This confirms the
project scaffold, design system, and routing all work before any real
logic is added.

## Project structure

```
app/            Next.js routes (pages + API routes)
components/     Shared UI (components/ui) and feature components
lib/            MCP server + tools, AI integration, scoring engine,
                framework data loader, security helpers, shared types
data/           Framework control content (JSON), one file per control
tests/          Vitest unit tests, Playwright end-to-end tests
docs/           Threat model and AI-governance documentation
```

## License

TBD -- recommend MIT for a portfolio project unless you want otherwise.
