import { z } from "zod";

// Limits match the server's CreateCategoryDto (natura-care-server/docs/category.md#validation-reference).
// The admin form only edits these fields; the server keeps the rest at their defaults.
export const CATEGORY_NAME_MAX = 100;
export const CATEGORY_DESCRIPTION_MAX = 2000;

export const categorySchema = z.object({
  categoryName: z
    .string({ message: "Category name is required" })
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(
      CATEGORY_NAME_MAX,
      `Category name must be at most ${CATEGORY_NAME_MAX} characters`,
    )
    // The server builds the URL slug from the name, which needs a-z or 0-9
    .regex(/[a-z0-9]/i, "Include at least one English letter or number"),
  // "0" (TOP_LEVEL_PARENT) means top level
  categoryParentId: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
  description: z
    .string()
    .trim()
    .max(
      CATEGORY_DESCRIPTION_MAX,
      `Description must be at most ${CATEGORY_DESCRIPTION_MAX} characters`,
    )
    .optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

export const editCategorySchema = categorySchema;

export type EditCategoryFormData = z.infer<typeof editCategorySchema>;
