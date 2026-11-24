import { z } from "zod";

export const topTitleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title must be less than 255 characters"),
  status: z.enum(["ACTIVE", "INACTIVE"], {
    message: "Status must be Active or Inactive",
  }),
});

export type TopTitleFormData = z.infer<typeof topTitleSchema>;
