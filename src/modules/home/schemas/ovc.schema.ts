import { z } from "zod";
const existingMediaSchema = z.object({
  filePath: z.string(),
  name: z.string(),
  attachId: z.number(),
});

// src/modules/home/schemas/ovc.schema.ts
export const ovcSchema = z
  .object({
    videoFile: z
      .union([z.instanceof(File), existingMediaSchema, z.null()])
      .default(null),
    gifFile: z
      .union([z.instanceof(File), existingMediaSchema, z.null()])
      .default(null),
    imageFile: z
      .union([z.instanceof(File), existingMediaSchema, z.null()])
      .default(null),
    videoUrl: z.string().url("Please enter a valid URL").or(z.literal("")),
    redirectUrl: z
      .string()
      .url("Please enter a valid URL")
      .or(z.literal(""))
      .optional(),
    status: z.string().nullable().default("ACTIVE"),
    order: z.number().positive().nullable().default(1),
  })
  .superRefine((data, ctx) => {
    const { videoFile, gifFile, imageFile, videoUrl } = data;

    // Count how many media items are provided
    const provided = [
      !!videoFile,
      !!gifFile,
      !!imageFile,
      videoUrl.trim() !== "",
    ].filter(Boolean).length;

    if (provided === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide at least one: Video, GIF, Image, or URL",
        path: ["videoFile"], // Pointing to first field
      });
    }

    if (provided > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "You can only provide ONE media type at a time",
        path: ["videoFile"],
      });
    }
  });

export type OvcFormData = z.infer<typeof ovcSchema>;

/**
 * Edit OVC: the media itself can't be swapped (delete and re-create instead),
 * so only the link, position and status are editable. Limits match the server.
 */
export const ovcEditSchema = z.object({
  // * Optional: an empty value removes the link.
  redirectUrl: z
    .string()
    .trim()
    .max(255, "Link must be at most 255 characters")
    .refine(
      (value) => value === "" || /^https?:\/\/\S+\.\S+/i.test(value),
      "Link must be a full address starting with http:// or https://",
    ),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  order: z.number().positive("Position must be 1 or higher").optional(),
});

export type OvcEditFormData = z.infer<typeof ovcEditSchema>;
