import { describe, it, expect } from "vitest";
import {
  listFrameworks,
  loadFamilies,
  loadControls,
  loadControl,
  searchControls,
} from "@/lib/data/frameworkLoader";

const FRAMEWORK_ID = "nist-800-53-r5";

describe("frameworkLoader", () => {
  it("lists the NIST 800-53 framework", () => {
    const frameworks = listFrameworks();
    expect(frameworks).toHaveLength(1);
    expect(frameworks[0].id).toBe(FRAMEWORK_ID);
  });

  it("loads 6 control families", () => {
    const families = loadFamilies(FRAMEWORK_ID);
    expect(families).toHaveLength(6);
    expect(families.map((f) => f.id)).toContain("AC");
  });

  it("loads all 12 spec-required controls", () => {
    const controls = loadControls(FRAMEWORK_ID);
    const ids = controls.map((c) => c.controlId);
    expect(controls).toHaveLength(12);
    for (const id of [
      "AC-2", "AC-3", "AC-5", "AC-6", "AC-7",
      "AU-2", "AU-6", "IA-2", "CM-3", "CM-8", "SC-7", "AT-2",
    ]) {
      expect(ids).toContain(id);
    }
  });

  it("every control has at least one expected statement element and one evidence example", () => {
    for (const c of loadControls(FRAMEWORK_ID)) {
      expect(c.expectedStatementElements.length).toBeGreaterThan(0);
      expect(c.evidenceExamples.length).toBeGreaterThan(0);
    }
  });

  it("loads a single control case-insensitively", () => {
    expect(loadControl(FRAMEWORK_ID, "ac-2")?.controlName).toBe("Account Management");
    expect(loadControl(FRAMEWORK_ID, "AC-2")?.controlName).toBe("Account Management");
  });

  it("returns null for an unknown control", () => {
    expect(loadControl(FRAMEWORK_ID, "ZZ-99")).toBeNull();
  });

  it("searches by control ID, name, or summary text", () => {
    expect(searchControls(FRAMEWORK_ID, "AC-2")).toHaveLength(1);
    expect(searchControls(FRAMEWORK_ID, "least privilege").length).toBeGreaterThan(0);
  });

  it("filters search results by family", () => {
    const results = searchControls(FRAMEWORK_ID, "", "AU");
    expect(results.every((c) => c.family === "AU")).toBe(true);
    expect(results).toHaveLength(2); // AU-2, AU-6
  });
});
