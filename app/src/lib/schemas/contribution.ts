import { z } from "zod"

export const contributionSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(120),
  description: z
    .string()
    .min(20, "Please describe your contribution in at least 20 characters")
    .max(2000),
  area: z.enum(["PRODUCTIVITY", "DELIVERABLE", "INNOVATION", "OTHER"]),
  benefit: z
    .string()
    .min(10, "Please describe the benefit (at least 10 characters)")
    .max(1000),
  impact: z.enum(["LOW", "MEDIUM", "HIGH", "TRANSFORMATIVE"]),
  scope: z.enum(["CAPGEMINI", "CLIENT", "BOTH"]),
})

export type ContributionInput = z.infer<typeof contributionSchema>
