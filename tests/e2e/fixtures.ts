import type { Page } from "@playwright/test";

// Shared mock assessment response used across e2e specs. Matches
// FullAssessmentResultSchema exactly -- if the schema changes and this
// fixture drifts, the app's own Zod validation would reject it at
// runtime, but Playwright can't catch that statically, so keep this in
// sync with lib/ai/outputSchema.ts by hand.
export const MOCK_ASSESSMENT = {
  overallStatus: "Partially Implemented",
  confidenceLevel: "Moderate",
  statementQualityAnalysis: [
    { category: "Who", presence: "Present", explanation: "IT Security team is named." },
    { category: "What", presence: "Present", explanation: "Account review and disablement described." },
    { category: "When", presence: "Present", explanation: "Quarterly frequency stated." },
    { category: "How", presence: "Missing", explanation: "No technology or procedure named." },
    { category: "Evidence", presence: "Missing", explanation: "No evidence source mentioned." },
    { category: "Scope", presence: "Partially Present", explanation: "Active accounts mentioned, but not which systems." },
    { category: "Responsibilities", presence: "Present", explanation: "IT Security named as owner." },
    { category: "Measurability", presence: "Partially Present", explanation: "Quarterly is measurable but no deadline given." },
  ],
  strengths: ["Names a responsible team.", "Gives a specific review frequency."],
  gaps: [
    {
      title: "No evidence retention location",
      explanation: "The statement does not say where review evidence is kept.",
      whyItMatters: "Assessors need a defined location to examine evidence.",
      relatedRequirement: "Evidence location",
      severity: "Moderate",
      recommendedImprovement: "State where review exports and approvals are retained.",
    },
  ],
  evidenceAssessment: {
    evidenceMentioned: [],
    evidenceExpected: ["Account review exports"],
    evidenceMissing: ["Reviewer sign-off"],
    evidenceSufficiency: "Insufficient",
    operatingEffectivenessVerifiable: false,
  },
  recommendedStatement: "The IT Security team reviews [SYSTEM] accounts quarterly using [TECHNOLOGY REQUIRED]...",
  followUpQuestions: ["Where is evidence retained?", "What technology performs the review?"],
  frameworkId: "nist-800-53-r5",
  controlId: "AC-2",
  controlName: "Account Management",
  assessmentTimestamp: new Date().toISOString(),
  disclaimer:
    "This assessment is an AI-assisted preliminary review. It does not constitute an audit opinion, authorization decision, legal determination, or certification of compliance. Final conclusions require qualified human review and appropriate evidence testing.",
  completenessScore: 61,
  scoreBreakdown: [
    { category: "Who", weight: 15, presence: "Present", pointsEarned: 15, excluded: false },
    { category: "What", weight: 20, presence: "Present", pointsEarned: 20, excluded: false },
  ],
  mcpValidation: {
    validControlReference: true,
    unsupportedClaims: [],
    missingRequiredConsiderations: [],
    permittedStatus: true,
    validationWarnings: [],
    sourceReferences: ["https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final"],
  },
  statusWasOverridden: false,
};

// Next.js client components attach their event handlers via React hydration
// *after* the browser has already painted the server-rendered HTML.
// Playwright's page.goto() resolves as soon as navigation completes -- it
// does not wait for hydration. A .fill()/.click() that lands in that gap
// hits real, visible, "actionable" DOM elements (so Playwright's own
// auto-waiting doesn't catch the problem) but no React state update
// happens, because no listener is attached yet. The result: a real user
// typing a moment later works fine (confirmed manually many times), but a
// script that fills the instant the page responds can lose that first
// keystroke event permanently.
//
// Fix: wait for network activity to settle after navigation, which for
// this app (no polling, no long-lived connections) reliably means the JS
// bundle has loaded and hydration has had time to complete. Use this
// instead of a bare page.goto() in any test that interacts with the page
// immediately afterward.
export async function gotoReady(page: Page, url: string) {
  await page.goto(url);
  await page.waitForLoadState("networkidle");
}
