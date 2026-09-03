import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AI Control Implementation Reviewer",
  description:
    "Reviews security-control implementation statements against NIST SP 800-53 Rev. 5, with MCP-validated control data and a deterministic completeness score.",
};

// Every page must render dynamically (per-request), not be statically
// prerendered at build time. This is required for the nonce-based CSP
// in middleware.ts to work at all: a statically prerendered page's HTML
// -- including its inline hydration scripts -- is generated once during
// `next build`, before any per-request nonce exists, so those scripts
// can never carry a nonce matching a later request's CSP header. This
// was confirmed as the actual cause of a real bug (the New Review page
// hanging on "Loading..." forever after CSP was added) by checking the
// build output, seeing /new-review listed as statically prerendered
// (an "○" route), and confirming its shipped HTML had no nonce
// attribute on its script tags. The tradeoff is losing static
// prerendering's performance benefit; acceptable here since this is a
// portfolio demo, not a high-traffic production site.
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plexSans.variable} ${plexMono.variable} ${sourceSerif.variable} antialiased`}
      >
        <div className="min-h-screen flex flex-col md:flex-row">
          <SiteNav />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
