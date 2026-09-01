import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-paper-raised border border-line rounded-[var(--radius)] p-5",
        className
      )}
      {...props}
    />
  );
}
