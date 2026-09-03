import type { NextConfig } from "next";

// Non-CSP security headers only here. Content-Security-Policy moved to
// middleware.ts -- Next.js's App Router renders required inline scripts
// for React hydration (the RSC payload), and a static CSP header with a
// plain `script-src 'self'` blocks those scripts outright, which breaks
// the entire app (confirmed: the New Review page hung on "Loading..."
// forever with a real "Executing inline script violates CSP" console
// error once this was deployed -- a genuine bug caught by actually
// testing in a browser, not a hypothetical). The correct fix is a
// per-request nonce, which only middleware can generate and have Next.js
// automatically apply to its own inline scripts.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
