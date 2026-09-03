import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, pruneRateLimitBuckets, _resetRateLimitStateForTests } from "@/lib/security/rateLimit";

beforeEach(() => {
  _resetRateLimitStateForTests();
});

describe("checkRateLimit", () => {
  it("allows requests under the limit", () => {
    const r1 = checkRateLimit("client-a", 3, 60_000, 1000);
    const r2 = checkRateLimit("client-a", 3, 60_000, 1100);
    const r3 = checkRateLimit("client-a", 3, 60_000, 1200);
    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it("blocks a request once the limit is exceeded within the window", () => {
    checkRateLimit("client-b", 2, 60_000, 1000);
    checkRateLimit("client-b", 2, 60_000, 1100);
    const blocked = checkRateLimit("client-b", 2, 60_000, 1200);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it("resets the window after windowMs has elapsed", () => {
    checkRateLimit("client-c", 1, 1000, 0);
    const stillBlocked = checkRateLimit("client-c", 1, 1000, 500);
    const afterWindow = checkRateLimit("client-c", 1, 1000, 1500);
    expect(stillBlocked.allowed).toBe(false);
    expect(afterWindow.allowed).toBe(true);
  });

  it("tracks separate clients independently", () => {
    checkRateLimit("client-d", 1, 60_000, 1000);
    const otherClient = checkRateLimit("client-e", 1, 60_000, 1000);
    expect(otherClient.allowed).toBe(true);
  });
});

describe("pruneRateLimitBuckets", () => {
  it("does not throw and is safe to call repeatedly", () => {
    checkRateLimit("client-f", 5, 1000, 0);
    expect(() => pruneRateLimitBuckets(1000, 5000)).not.toThrow();
  });
});
