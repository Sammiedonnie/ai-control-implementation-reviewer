import { NextRequest, NextResponse } from "next/server";

// Generates a fresh, cryptographically random nonce on every request and
// sets a Content-Security-Policy that only trusts scripts carrying that
// nonce. Next.js automatically applies this nonce to its own
// framework-generated inline scripts (the RSC hydration payload) when it
// sees the CSP header set this way via middleware -- this is the
// officially documented pattern
// (https://nextjs.org/docs/app/guides/content-security-policy), and it's
// the only way to get a strict script-src without either breaking
// hydration (a static 'self'-only policy blocks Next's own inline
// scripts) or falling back to 'unsafe-inline' (which defeats CSP's main
// purpose against injected/XSS scripts).
//
// 'strict-dynamic' means browsers that support it trust scripts loaded
// BY a nonce'd script too (Next's chunk-loading pattern needs this),
// while still rejecting any inline script an attacker might inject that
// doesn't carry the current request's nonce.
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspHeader = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", cspHeader);
  return response;
}

export const config = {
  // Applies to page routes only -- API routes don't render HTML/scripts,
  // so there's nothing for a script-src nonce to protect there, and
  // static assets don't need it either.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
