# Contributing

This is primarily a personal portfolio project, but it's built with real
engineering practices and welcomes issues, questions, or suggestions.

## Local development

See the "Getting started" section in `README.md` for setup on Windows and
macOS/Linux.

## Before submitting a change

```bash
npm run lint
npm test          # Vitest unit tests
npm run test:e2e  # Playwright end-to-end tests (requires: npx playwright install)
npm run build
```

All four should pass clean. `npm run build` also runs a TypeScript check.

## Code organization

- `lib/mcp/` -- the MCP server and its 8 read-only tools. Add new tools
  here, register them in `lib/mcp/server.ts`, and give them a Zod schema
  in `lib/mcp/schemas.ts`.
- `lib/ai/` -- the system prompt, output schema, and the review route's
  supporting pure logic (`reviewLogic.ts` is intentionally free of any
  AI SDK or network calls so it stays unit-testable).
- `lib/scoring/` -- the deterministic completeness calculation. Keep this
  free of AI/model involvement -- see the comment at the top of
  `calculateCompleteness.ts` for why.
- `data/frameworks/` -- framework/control content as JSON. Adding a new
  framework means adding a new folder here plus `crosswalks.json` entries
  if you want `map_control` to find it -- no application code should need
  to change.
- `components/` -- `ui/` for generic shared primitives, `review/` and
  `dashboard/` for feature-specific components.

## Adding a new control or framework

Control JSON must validate against `ControlSchema` in
`lib/types/framework.ts`. See any existing file under
`data/frameworks/nist-800-53-r5/controls/` for the expected shape.
