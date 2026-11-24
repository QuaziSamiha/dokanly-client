import { z } from "zod";

// * Limits match the server (home.prisma VARCHAR sizes / UpdateHomeContentMultipartDto).
export const platformRedirectSchema = z.object({
  // * platformName and platformType are fixed once the platform is added, so
  // * they are shown read-only and are not part of the edit form.

  // * Required: a platform icon with no link goes nowhere, and the server
  // * rejects an empty link for this section.
  url: z
    .string()
    .trim()
    .min(1, "Link is required")
    .max(255, "Link must be at most 255 characters")
    .regex(/^https?:\/\//i, "Link must start with http:// or https://")
    .url("Please enter a valid link"),
  media: z
    .union([z.string(), z.instanceof(File)])
    .refine((val) => !!val, "Icon is required"),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  order: z.number().positive("Position must be 1 or higher").optional(),
});

export type PlatformRedirectFormData = z.infer<typeof platformRedirectSchema>;
