import type { StoredReview } from "@/lib/storage/reviewHistory";
import type { ImplementationStatus } from "@/lib/types/assessment";
import { IMPLEMENTATION_STATUSES } from "@/lib/types/assessment";

export type DashboardStats = {
  totalReviews: number;
  statusCounts: Record<ImplementationStatus, number>;
  averageCompletenessScore: number | null;
  mostFrequentGaps: { title: string; count: number }[];
};

// Pure function over stored review history -- no I/O, fully unit-testable.
export function computeDashboardStats(reviews: StoredReview[]): DashboardStats {
  const statusCounts = Object.fromEntries(
    IMPLEMENTATION_STATUSES.map((s) => [s, 0])
  ) as Record<ImplementationStatus, number>;

  const gapCounts = new Map<string, number>();
  let scoreSum = 0;

  for (const review of reviews) {
    const status = review.assessment.overallStatus;
    statusCounts[status] = (statusCounts[status] ?? 0) + 1;
    scoreSum += review.assessment.completenessScore;
    for (const gap of review.assessment.gaps) {
      gapCounts.set(gap.title, (gapCounts.get(gap.title) ?? 0) + 1);
    }
  }

  const mostFrequentGaps = [...gapCounts.entries()]
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalReviews: reviews.length,
    statusCounts,
    averageCompletenessScore:
      reviews.length === 0 ? null : Math.round(scoreSum / reviews.length),
    mostFrequentGaps,
  };
}
