import { CheckCircle2, CircleAlert, CircleX, HelpCircle, MinusCircle } from "lucide-react";
import type { ImplementationStatus } from "@/lib/types/assessment";
import { cn } from "@/lib/utils";

// Every status pairs a color with a distinct icon and its full text label --
// status is never communicated by color alone (spec section 13).
const STATUS_CONFIG: Record<
  ImplementationStatus,
  { color: string; bg: string; icon: typeof CheckCircle2 }
> = {
  Implemented: {
    color: "var(--status-implemented)",
    bg: "var(--status-implemented-bg)",
    icon: CheckCircle2,
  },
  "Partially Implemented": {
    color: "var(--status-partial)",
    bg: "var(--status-partial-bg)",
    icon: CircleAlert,
  },
  "Not Implemented": {
    color: "var(--status-not-implemented)",
    bg: "var(--status-not-implemented-bg)",
    icon: CircleX,
  },
  "Not Enough Information": {
    color: "var(--status-not-enough-info)",
    bg: "var(--status-not-enough-info-bg)",
    icon: HelpCircle,
  },
  "Not Applicable - Requires Justification": {
    color: "var(--status-not-applicable)",
    bg: "var(--status-not-applicable-bg)",
    icon: MinusCircle,
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: ImplementationStatus;
  className?: string;
}) {
  const { color, bg, icon: Icon } = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        className
      )}
      style={{ color, backgroundColor: bg }}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {status}
    </span>
  );
}
