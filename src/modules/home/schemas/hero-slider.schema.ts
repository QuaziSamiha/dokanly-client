import { z } from "zod";

// * Shared by Add and Edit Hero Slider. Limits match the server.
export const heroSliderSchema = z.object({
  media: z
    .union([z.string(), z.instanceof(File)])
    .refine((val) => !!val, "Slide image is required"),
  // * Optional: an empty value means the slide isn't clickable.
  redirectUrl: z
    .string()
    .trim()
    .max(255, "Link must be at most 255 characters")
    .refine(
      (value) => value === "" || /^https?:\/\/\S+\.\S+/i.test(value),
      "Link must be a full address starting with http:// or https://",
    )
    .optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  order: z.number().positive("Position must be 1 or higher").optional(),
});

export type HeroSliderFormData = z.infer<typeof heroSliderSchema>;
