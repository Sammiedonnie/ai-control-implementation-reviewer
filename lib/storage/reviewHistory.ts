import type { FullAssessmentResult } from "@/lib/ai/outputSchema";

// Review history lives in the BROWSER's localStorage only -- never sent to
// or stored by the server (spec section 13: "For the MVP, review history
// may use browser storage... clearly explain the choice" -- explained here
// and again in the History page UI). This means history is private to this
// browser/device and is lost if the user clears site data; there is no
// account system or cross-device sync in this MVP. Capped at 50 entries so
// localStorage (typically ~5-10MB per origin) never becomes a problem.

export type StoredReview = {
  id: string;
  savedAt: string; // ISO timestamp
  frameworkId: string;
  controlId: string;
  controlName: string;
  statement: string;
  assessment: FullAssessmentResult;
};

const STORAGE_KEY = "air-review-history-v1";
const MAX_ENTRIES = 50;

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getReviewHistory(): StoredReview[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveReviewToHistory(entry: Omit<StoredReview, "id" | "savedAt">): StoredReview {
  const stored: StoredReview = {
    ...entry,
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
  };
  if (!isBrowser()) return stored;
  try {
    const current = getReviewHistory();
    const updated = [stored, ...current].slice(0, MAX_ENTRIES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage full or unavailable -- fail silently, review still
    // displays to the user this session, it just won't persist
  }
  return stored;
}

export function deleteReviewFromHistory(id: string): void {
  if (!isBrowser()) return;
  try {
    const updated = getReviewHistory().filter((r) => r.id !== id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function clearReviewHistory(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
