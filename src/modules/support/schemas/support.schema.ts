import { z } from "zod";

export const supportSchema = z.object({
  description: z
    .string()
    .min(1, "Policy content is required")
    .refine((val) => val !== "<p><br></p>", "Policy content cannot be empty"),
});

export type SupportType = z.infer<typeof supportSchema>;
