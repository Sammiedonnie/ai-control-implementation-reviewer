"use client";

import { useEffect, useState } from "react";
import { getReviewHistory } from "@/lib/storage/reviewHistory";
import { computeDashboardStats, type DashboardStats } from "@/lib/dashboard/computeStats";
import { StatsCards } from "@/components/dashboard/StatsCards";

export function DashboardClient() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    // Same localStorage-after-mount exception as HistoryClient.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStats(computeDashboardStats(getReviewHistory()));
  }, []);

  if (!stats) {
    return <p className="text-sm text-ink-soft">Loading...</p>;
  }

  return <StatsCards stats={stats} />;
}
