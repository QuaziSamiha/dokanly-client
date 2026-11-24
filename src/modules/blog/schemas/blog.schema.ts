import { z } from "zod";

export const BlogStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const BlogTypeStatusEnum = z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]);

/**
 * Base validation rules shared by the add and edit blog forms.
 *
 * `blogType` is a string because `<SingleSelectSearch />` hands back option ids
 * as strings; it is coerced to a number when the payload is built.
 */
const baseBlogSchema = {
  title: z
    .string()
    .min(3, "Title is too short")
    .max(255, "Title cannot be longer than 255 characters"),

  // Optional: the API builds it from the title when it is left empty. Only
  // English letters, digits and hyphens can form a URL, so a Bangla title
  // needs one typed here.
  slug: z
    .string()
    .max(255, "Slug cannot be longer than 255 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase English letters, numbers and single hyphens only",
    )
    .optional()
    .or(z.literal("")),

  blogType: z.string().min(1, "Please select a blog type"),

  status: BlogStatusEnum,

  excerpt: z
    .string()
    .max(500, "Excerpt cannot be longer than 500 characters")
    .optional()
    .or(z.literal("")),

  // Rich text field (Quill). An "empty" editor still submits `<p><br></p>`.
  content: z
    .string()
    .min(1, "Content is required")
    .refine((val) => val !== "<p><br></p>", "Content cannot be empty"),

  tags: z.string().optional().or(z.literal("")),

  authorName: z
    .string()
    .max(200, "Author name is too long")
    .optional()
    .or(z.literal("")),

  // `InputField` with `inputType="number"` emits a number, or `null` once the
  // field is cleared — so the schema has to accept both, not a string.
  readTime: z
    .number()
    .int("Read time must be a whole number of minutes")
    .min(1, "Read time must be at least 1 minute")
    .nullable()
    .optional(),

  featured: z.boolean().optional(),
  allowComments: z.boolean().optional(),

  banner: z.any().optional(),

  bannerAlt: z
    .string()
    .max(255, "Alt text cannot be longer than 255 characters")
    .optional()
    .or(z.literal("")),

  videoUrl: z
    .string()
    .url("Video URL must be a valid URL")
    .optional()
    .or(z.literal("")),

  metaTitle: z
    .string()
    .max(255, "Meta title cannot be longer than 255 characters")
    .optional()
    .or(z.literal("")),

  metaDescription: z.string().optional().or(z.literal("")),

  metaKeywords: z.string().optional().or(z.literal("")),
};

/**
 * 1. ADD BLOG SCHEMA
 */
export const CreateBlogSchema = z.object({
  title: baseBlogSchema.title,
  slug: baseBlogSchema.slug,
  blogType: baseBlogSchema.blogType,
  status: baseBlogSchema.status,
  excerpt: baseBlogSchema.excerpt,
  content: baseBlogSchema.content,
  tags: baseBlogSchema.tags,
  authorName: baseBlogSchema.authorName,
  readTime: baseBlogSchema.readTime,
  featured: baseBlogSchema.featured,
  allowComments: baseBlogSchema.allowComments,
  banner: baseBlogSchema.banner,
  bannerAlt: baseBlogSchema.bannerAlt,
  videoUrl: baseBlogSchema.videoUrl,
  metaTitle: baseBlogSchema.metaTitle,
  metaDescription: baseBlogSchema.metaDescription,
  metaKeywords: baseBlogSchema.metaKeywords,
});

/**
 * 2. EDIT BLOG SCHEMA
 * `.partial()` so only changed fields (dirtyFields) need to validate.
 */
export const UpdateBlogSchema = z.object({ ...baseBlogSchema }).partial();

/**
 * 3. BLOG TYPE SCHEMAS
 */
export const CreateBlogTypeSchema = z.object({
  name: z
    .string()
    .min(2, "Name is too short")
    .max(100, "Name cannot be longer than 100 characters"),
  description: z.string().optional().or(z.literal("")),
  status: BlogTypeStatusEnum,
  // A number for the same reason as `readTime` above.
  sortOrder: z
    .number()
    .int("Order must be a whole number")
    .min(0, "Order cannot be negative")
    .nullable()
    .optional(),
  isDefault: z.boolean().optional(),
});

export const UpdateBlogTypeSchema = CreateBlogTypeSchema.partial();

export type CreateBlogType = z.infer<typeof CreateBlogSchema>;
export type UpdateBlogType = z.infer<typeof UpdateBlogSchema>;
export type CreateBlogTypeType = z.infer<typeof CreateBlogTypeSchema>;
export type UpdateBlogTypeType = z.infer<typeof UpdateBlogTypeSchema>;
