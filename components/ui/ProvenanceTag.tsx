import { BadgeCheck, PenLine, FlaskConical } from "lucide-react";
import type { DataProvenance } from "@/lib/types/framework";
import { cn } from "@/lib/utils";

// Distinguishes official NIST public-domain content from application-authored
// guidance from sample/demo data -- spec section 4 requires this be visible,
// not just tracked internally.
const CONFIG: Record<
  DataProvenance,
  { label: string; icon: typeof BadgeCheck; className: string }
> = {
  "official-public-domain": {
    label: "Official public-domain content",
    icon: BadgeCheck,
    className: "text-accent bg-accent-soft",
  },
  "application-authored": {
    label: "Application-authored guidance",
    icon: PenLine,
    className: "text-ink-soft bg-line/40",
  },
  "sample-demonstration-data": {
    label: "Sample demonstration data",
    icon: FlaskConical,
    className: "text-status-partial bg-status-partial-bg",
  },
};

export function ProvenanceTag({
  provenance,
  className,
}: {
  provenance: DataProvenance;
  className?: string;
}) {
  const { label, icon: Icon, className: colorClass } = CONFIG[provenance];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        colorClass,
        className
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
