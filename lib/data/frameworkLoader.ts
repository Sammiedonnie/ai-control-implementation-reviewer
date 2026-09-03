import fs from "node:fs";
import path from "node:path";
import {
  FrameworkSchema,
  ControlFamilySchema,
  ControlSchema,
  type Framework,
  type ControlFamily,
  type Control,
} from "@/lib/types/framework";

// Server-only data access layer. Reads JSON off disk and validates every
// record against its Zod schema on the way out -- this is the same
// validation the MCP tools (Chunk 3) will lean on, so a malformed or
// hand-edited JSON file fails loudly here instead of silently reaching the UI.

const FRAMEWORKS_DIR = path.join(process.cwd(), "data", "frameworks");

function frameworkDir(frameworkId: string) {
  return path.join(FRAMEWORKS_DIR, frameworkId);
}

export function listFrameworkIds(): string[] {
  if (!fs.existsSync(FRAMEWORKS_DIR)) return [];
  return fs
    .readdirSync(FRAMEWORKS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

export function loadFramework(frameworkId: string): Framework | null {
  const file = path.join(frameworkDir(frameworkId), "framework.json");
  if (!fs.existsSync(file)) return null;
  const raw = JSON.parse(fs.readFileSync(file, "utf-8"));
  return FrameworkSchema.parse(raw);
}

export function listFrameworks(): Framework[] {
  return listFrameworkIds()
    .map(loadFramework)
    .filter((f): f is Framework => f !== null);
}

export function loadFamilies(frameworkId: string): ControlFamily[] {
  const file = path.join(frameworkDir(frameworkId), "families.json");
  if (!fs.existsSync(file)) return [];
  const raw = JSON.parse(fs.readFileSync(file, "utf-8"));
  return z_array_families(raw);
}

function z_array_families(raw: unknown): ControlFamily[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((f) => ControlFamilySchema.parse(f));
}

export function loadControls(frameworkId: string): Control[] {
  const dir = path.join(frameworkDir(frameworkId), "controls");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const raw = JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8"));
      return ControlSchema.parse(raw);
    })
    .sort((a, b) => a.controlId.localeCompare(b.controlId));
}

export function loadControl(
  frameworkId: string,
  controlId: string
): Control | null {
  const all = loadControls(frameworkId);
  return (
    all.find(
      (c) => c.controlId.toLowerCase() === controlId.toLowerCase()
    ) ?? null
  );
}

export function searchControls(
  frameworkId: string,
  searchTerm: string,
  familyId?: string
): Control[] {
  const all = loadControls(frameworkId).filter((c) =>
    familyId ? c.family === familyId : true
  );
  if (!searchTerm.trim()) return all;
  const term = searchTerm.toLowerCase();
  return all.filter(
    (c) =>
      c.controlId.toLowerCase().includes(term) ||
      c.controlName.toLowerCase().includes(term) ||
      c.summary.toLowerCase().includes(term)
  );
}

export function loadCrosswalks(frameworkId: string) {
  const file = path.join(frameworkDir(frameworkId), "crosswalks.json");
  if (!fs.existsSync(file)) return [];
  const raw = JSON.parse(fs.readFileSync(file, "utf-8"));
  if (!Array.isArray(raw)) return [];
  return raw as import("@/lib/types/framework").CrosswalkEntry[];
}
