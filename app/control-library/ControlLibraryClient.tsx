"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import type { Control, ControlFamily, Framework } from "@/lib/types/framework";
import { ControlBrowser } from "@/components/review/ControlBrowser";
import { ControlDetailPanel } from "@/components/review/ControlDetailPanel";

export function ControlLibraryClient({
  frameworks,
  frameworkId,
  controls,
  families,
}: {
  frameworks: Framework[];
  frameworkId: string;
  controls: Control[];
  families: ControlFamily[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState(controls[0]?.controlId);
  const selected = controls.find((c) => c.controlId === selectedId);

  function handleFrameworkChange(newFrameworkId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (newFrameworkId === "nist-800-53-r5") {
      params.delete("framework");
    } else {
      params.set("framework", newFrameworkId);
    }
    router.push(`/control-library${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <div>
      <div className="px-6 pt-4 flex items-center gap-3 text-sm">
        <label htmlFor="library-framework-select" className="text-ink-soft">
          Framework:
        </label>
        <select
          id="library-framework-select"
          value={frameworkId}
          onChange={(e) => handleFrameworkChange(e.target.value)}
          className="border border-line rounded-md px-2 py-1 text-sm font-medium text-ink bg-paper-raised"
        >
          {frameworks.map((fw) => (
            <option key={fw.id} value={fw.id}>
              {fw.name} ({fw.version})
            </option>
          ))}
        </select>
      </div>
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
                  href={`/new-review?control=${selected.controlId}${
                    frameworkId !== "nist-800-53-r5" ? `&framework=${frameworkId}` : ""
                  }`}
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
    </div>
  );
}