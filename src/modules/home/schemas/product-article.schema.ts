import { z } from "zod";

export const productArticleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title must be less than 255 characters"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .min(10, "Description must be at least 10 characters"),

  media: z
    .union([z.string(), z.instanceof(File)])
    .refine((val) => !!val, "Article image is required"),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  order: z.number().positive("Position must be 1 or higher").optional(),
});

export type ProductArticleFormData = z.infer<typeof productArticleSchema>;
