import { z } from "zod";

// ========== PERSONAL INFORMATION ==========
export const updatePersonalInfoSchema = z.object({
  firstName: z
    .string({ message: "First name is required" })
    .trim()
    .min(1, "First name is required")
    .max(100, "First name must be less than 100 characters"),
  lastName: z
    .string()
    .trim()
    .max(100, "Last name must be less than 100 characters")
    .optional(),
  phone: z.string().trim().optional(),
});

export type UpdatePersonalInfoFormData = z.infer<
  typeof updatePersonalInfoSchema
>;

// ========== PASSWORD ==========
export const updatePasswordFormSchema = z
  .object({
    currentPassword: z
      .string({ message: "Current password is required" })
      .min(1, "Current password is required"),
    newPassword: z
      .string({ message: "New password is required" })
      .min(8, "Password must be at least 8 characters long")
      .max(255, "Password must be less than 255 characters"),
    confirmNewPassword: z
      .string({ message: "Please confirm your new password" })
      .min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from the current one",
    path: ["newPassword"],
  });

export type UpdatePasswordFormData = z.infer<typeof updatePasswordFormSchema>;
