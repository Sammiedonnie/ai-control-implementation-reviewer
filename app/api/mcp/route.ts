import { createServer } from "@/lib/mcp/server";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";

// Stateless mode: a fresh server + transport per request. This fits a
// serverless deployment target (Vercel Functions) far better than a
// long-lived session -- there's no persistent connection to keep alive
// between invocations, and every tool here is a pure read against static
// JSON data, so there's no state that would benefit from a session anyway.
async function handle(req: Request) {
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
