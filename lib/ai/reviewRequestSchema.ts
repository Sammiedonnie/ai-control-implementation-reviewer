import { z } from "zod";

// Input validation for POST /api/review -- length limits per spec
// section 16 ("input length limits"). Rejected before anything is sent to
// the model.
export const ReviewRequestSchema = z.object({
  frameworkId: z.string().min(1).max(100),
  controlId: z.string().min(1).max(20),
  statement: z.string().min(1, "Implementation statement is required.").max(4000),
  context: z
    .object({
      systemName: z.string().max(200).optional(),
      systemOwner: z.string().max(200).optional(),
      technologyUsed: z.string().max(200).optional(),
      responsibleRole: z.string().max(200).optional(),
      reviewFrequency: z.string().max(200).optional(),
      evidenceAvailable: z.string().max(1000).optional(),
    })
    .optional(),
});
export type ReviewRequest = z.infer<typeof ReviewRequestSchema>;
