import { createServer } from "@/lib/mcp/server";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { checkRateLimit } from "@/lib/security/rateLimit";

// Stateless mode: a fresh server + transport per request. This fits a
// serverless deployment target (Vercel Functions) far better than a
// long-lived session -- there's no persistent connection to keep alive
// between invocations, and every tool here is a pure read against static
// JSON data, so there's no state that would benefit from a session anyway.

// Rate limited more generously than /api/review since this endpoint is
// meant to be called several times per single review (validate_control_
// reference, get_control_details, get_evidence_requirements,
// validate_assessment), but it's still a public endpoint (OWASP API4:
// unrestricted resource consumption) and shouldn't be left unbounded.
const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60_000;

async function handle(req: Request) {
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimit = checkRateLimit(`mcp:${clientIp}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({ error: "Too many requests." }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": Math.ceil(rateLimit.retryAfterMs / 1000).toString(),
      },
    });
  }

  const server = createServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);
  return transport.handleRequest(req);
}

export async function POST(req: Request) {
  return handle(req);
}

export async function GET(req: Request) {
  return handle(req);
}

export async function DELETE(req: Request) {
  return handle(req);
}
