import { z } from "zod";

/**
 * A file already stored on the backend, echoed back by `<SingleMediaInput />`
 * when the user leaves an existing attachment untouched.
 */
const existingMediaSchema = z.object({
  filePath: z.string(),
  name: z.string(),
  attachId: z.number(),
});

/**
 * The edit form seeds `media` / `videoFile` from `mediaUrl` / `videoUrl`, which
 * carry no `attachId`, so the update schema accepts any object shape here.
 */
const seededMediaSchema = z.record(z.string(), z.unknown());

const sourceUrlSchema = z.object({
  url: z.string().url("Please enter a valid URL").or(z.literal("")),
});

/**
 * A video may come from an upload or from an external link, never both.
 * Shared by the create and update schemas.
 */
const refineExclusiveVideo = (
  data: { videoFile?: unknown; videoUrl?: string | null },
  ctx: z.RefinementCtx,
  message: string,
) => {
  const hasVideoFile = !!data.videoFile;
  const hasVideoUrl = !!data.videoUrl && data.videoUrl.trim() !== "";

  if (hasVideoFile && hasVideoUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["videoFile"],
      message,
    });
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["videoUrl"],
      message,
    });
  }
};

/**
 * 1. CREATE MEDIA & NEWS SCHEMA
 *
 * Every field is required up front, and the entry must carry at least one of
 * image, video file, video URL or source link — an entry with none of them has
 * nothing to show on the public carousel.
 */
export const CreateMediaNewsSchema = z
  .object({
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

    status: z.string().min(1, "Status is required"),

    category: z.string().min(1, "Category is required"),

    sourceUrls: z.array(sourceUrlSchema).default([{ url: "" }]),

    media: z
      .union([z.instanceof(File), existingMediaSchema, z.null()])
      .optional()
      .nullable()
      .default(null),

    videoFile: z
      .union([z.instanceof(File), existingMediaSchema, z.null()])
      .optional()
      .nullable()
      .default(null),

    videoUrl: z
      .string()
      .url("Please enter a valid URL")
      .or(z.literal(""))
      .default(""),
  })
  .superRefine((data, ctx) => {
    refineExclusiveVideo(
      data,
      ctx,
      "Please provide either a video file OR a video URL, not both",
    );

    const hasAnyMedia =
      !!data.media ||
      !!data.videoFile ||
      (!!data.videoUrl && data.videoUrl.trim() !== "") ||
      data.sourceUrls.some((source) => source.url.trim() !== "");

    if (!hasAnyMedia) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["media"],
        message:
          "At least one media must be provided (media, video file, video URL, or source URLs)",
      });
    }
  });

/**
 * 2. UPDATE MEDIA & NEWS SCHEMA
 *
 * Mirrors the create rules but tolerates the loosely shaped attachments the
 * edit form seeds from the existing row. Source links do not satisfy the
 * "must have something to show" rule here — a saved entry already has one.
 */
export const UpdateMediaNewsSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters long")
      .max(255, "Title cannot be longer than 255 characters"),

    description: z
      .string()
      .min(1, "Description is required")
      .refine((val) => val !== "<p><br></p>", "Description cannot be empty"),

    status: z.string().min(1, "Status is required"),

    category: z.string().min(1, "Category is required"),

    sourceUrls: z
      .array(
        z.object({
          url: z.string().url("Invalid URL").or(z.literal("")).default(""),
        }),
      )
      .optional()
      .default([{ url: "" }]),

    media: z
      .union([z.instanceof(File), seededMediaSchema, z.null()])
      .optional(),

    videoFile: z
      .union([z.instanceof(File), seededMediaSchema, z.null()])
      .optional(),

    videoUrl: z.string().url("Invalid Video URL").optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    refineExclusiveVideo(
      data,
      ctx,
      "Provide either a video file or a video URL, not both",
    );

    const hasVideoUrl = !!data.videoUrl && data.videoUrl.trim() !== "";

    if (!data.media && !data.videoFile && !hasVideoUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["media"],
        message: "One of Image, Video File, or Video URL must be provided",
      });
    }
  });

// TypeScript types
export type CreateMediaNewsType = z.infer<typeof CreateMediaNewsSchema>;
export type UpdateMediaNewsType = z.infer<typeof UpdateMediaNewsSchema>;
