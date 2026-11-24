import { z } from "zod";

export const userSchema = z.object({
  userName: z
    .string({
      message: "Category name is required",
    })
    .trim()
    .min(3, "Category name must be at least 3 characters long")
    .max(100, "Category name must be less than 100 characters")
    .refine((val) => val.length > 0, {
      message: "Category name cannot be empty or only whitespace",
    }),
  role: z.string().optional(),
  // status: z.boolean().optional(),
});

export type UserFormData = z.infer<typeof userSchema>;
