import type { DashboardStats } from "@/lib/dashboard/computeStats";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ImplementationStatus } from "@/lib/types/assessment";

const STATUS_DISPLAY_ORDER: ImplementationStatus[] = [
  "Implemented",
  "Partially Implemented",
  "Not Implemented",
  "Not Enough Information",
  "Not Applicable - Requires Justification",
];

export function StatsCards({ stats }: { stats: DashboardStats }) {
  if (stats.totalReviews === 0) {
    return (
      <Card>
        <p className="text-sm text-ink-soft">
          No reviews yet. Submit a review on the New Review page and your
          statistics will appear here.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <p className="text-xs text-ink-faint">Total reviews</p>
          <p className="text-3xl font-display font-semibold text-ink mt-1">{stats.totalReviews}</p>
        </Card>
        <Card>
          <p className="text-xs text-ink-faint">Average completeness score</p>
          <p className="text-3xl font-display font-semibold text-ink mt-1">
            {stats.averageCompletenessScore}%
          </p>
        </Card>
      </div>

      <Card>
        <h3 className="text-sm font-semibold text-ink mb-3">Reviews by status</h3>
        <div className="space-y-2">
          {STATUS_DISPLAY_ORDER.map((status) => (
            <div key={status} className="flex items-center justify-between gap-3">
              <StatusBadge status={status} />
              <span className="text-sm text-ink-soft font-medium">
                {stats.statusCounts[status]}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {stats.mostFrequentGaps.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-ink mb-3">Most frequently identified gaps</h3>
          <ul className="space-y-1.5">
            {stats.mostFrequentGaps.map((g) => (
              <li key={g.title} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-ink-soft">{g.title}</span>
                <span className="text-ink-faint text-xs shrink-0">
                  {g.count} review{g.count === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
