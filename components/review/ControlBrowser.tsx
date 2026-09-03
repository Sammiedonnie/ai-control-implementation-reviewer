"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Control, ControlFamily } from "@/lib/types/framework";
import { cn } from "@/lib/utils";

export function ControlBrowser({
  controls,
  families,
  selectedControlId,
  onSelect,
}: {
  controls: Control[];
  families: ControlFamily[];
  selectedControlId?: string;
  onSelect: (controlId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [familyFilter, setFamilyFilter] = useState<string | "all">("all");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return controls.filter((c) => {
      const matchesFamily = familyFilter === "all" || c.family === familyFilter;
      const matchesTerm =
        !term ||
        c.controlId.toLowerCase().includes(term) ||
        c.controlName.toLowerCase().includes(term) ||
        c.summary.toLowerCase().includes(term);
      return matchesFamily && matchesTerm;
    });
  }, [controls, query, familyFilter]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-line space-y-2">
        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-ink-faint"
            aria-hidden="true"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by ID or keyword..."
            aria-label="Search controls"
            className="w-full pl-8 pr-3 py-2 text-sm rounded-md border border-line bg-paper-raised focus-visible:outline-2 focus-visible:outline-accent"
          />
        </div>
        <select
          value={familyFilter}
          onChange={(e) => setFamilyFilter(e.target.value)}
          aria-label="Filter by control family"
          className="w-full px-3 py-2 text-sm rounded-md border border-line bg-paper-raised"
        >
          <option value="all">All families</option>
          {families.map((f) => (
            <option key={f.id} value={f.id}>
              {f.id} -- {f.name}
            </option>
          ))}
        </select>
      </div>
      <ul className="overflow-y-auto flex-1" role="listbox" aria-label="Controls">
        {filtered.length === 0 ? (
          <li className="p-4 text-sm text-ink-faint">No controls match.</li>
        ) : (
          filtered.map((c) => (
            <li key={c.controlId}>
              <button
                type="button"
                onClick={() => onSelect(c.controlId)}
                role="option"
                aria-selected={c.controlId === selectedControlId}
                className={cn(
                  "w-full text-left px-4 py-3 border-b border-line hover:bg-accent-soft transition-colors",
                  c.controlId === selectedControlId && "bg-accent-soft"
                )}
              >
                <div className="flex items-baseline gap-2">
                  <span className="control-id text-xs font-medium text-accent">
                    {c.controlId}
                  </span>
                  <span className="text-sm text-ink font-medium">
                    {c.controlName}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-ink-soft line-clamp-2">
                  {c.summary}
                </p>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
