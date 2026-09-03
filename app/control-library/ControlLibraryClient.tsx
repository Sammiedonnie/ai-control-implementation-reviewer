"use client";

import { useState } from "react";
import Link from "next/link";
import type { Control, ControlFamily } from "@/lib/types/framework";
import { ControlBrowser } from "@/components/review/ControlBrowser";
import { ControlDetailPanel } from "@/components/review/ControlDetailPanel";

export function ControlLibraryClient({
  controls,
  families,
}: {
  controls: Control[];
  families: ControlFamily[];
}) {
  const [selectedId, setSelectedId] = useState(controls[0]?.controlId);
  const selected = controls.find((c) => c.controlId === selectedId);

  return (
    <div className="flex h-[calc(100vh-97px)]">
      <div className="w-80 shrink-0 border-r border-line bg-paper-raised">
        <ControlBrowser
          controls={controls}
          families={families}
          selectedControlId={selectedId}
          onSelect={setSelectedId}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {selected ? (
          <>
            <ControlDetailPanel control={selected} />
            <div className="px-6 pb-6">
              <Link
                href={`/new-review?control=${selected.controlId}`}
                className="inline-block text-sm font-medium text-white bg-accent hover:opacity-90 transition-opacity rounded-md px-4 py-2"
              >
                Start a review from this control
              </Link>
            </div>
          </>
        ) : (
          <p className="p-6 text-sm text-ink-soft">Select a control to view details.</p>
        )}
      </div>
    </div>
  );
}
