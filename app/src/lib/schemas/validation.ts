import { z } from "zod"

export const validationSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  rating: z.number().int().min(1).max(5),
  note: z.string().max(500).optional(),
})

export type ValidationInput = z.infer<typeof validationSchema>
