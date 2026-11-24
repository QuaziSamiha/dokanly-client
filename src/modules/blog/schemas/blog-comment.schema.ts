import { z } from "zod";

export const CommentStatusEnum = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "SPAM",
]);

/**
 * Public "Leave a Reply" form.
 *
 * Name and email are required here because this schema backs the *guest* form.
 * A logged-in visitor is identified by their token, so those inputs are hidden
 * and the fields are pre-filled from the session before validation runs — see
 * `CommentForm`.
 */
export const CreateCommentSchema = z.object({
  content: z
    .string()
    .min(2, "Comment is too short")
    .max(5000, "Comment cannot be longer than 5000 characters")
    .refine((val) => val.trim().length > 0, "Comment cannot be empty"),

  guestName: z
    .string()
    .min(1, "Name is required")
    .max(150, "Name cannot be longer than 150 characters"),

  guestEmail: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),

  guestWebsite: z
    .string()
    .url("Website must be a valid URL")
    .optional()
    .or(z.literal("")),
});

/**
 * Same form, but for a signed-in commenter: the API reads their name and email
 * off the JWT, so those inputs are not rendered and must not be validated.
 */
export const CreateMemberCommentSchema = CreateCommentSchema.pick({
  content: true,
  guestWebsite: true,
});

/** Admin moderation action. */
export const ModerateCommentSchema = z.object({
  status: CommentStatusEnum,
  moderatorNotes: z.string().optional().or(z.literal("")),
});

export type CreateCommentType = z.infer<typeof CreateCommentSchema>;
export type CreateMemberCommentType = z.infer<typeof CreateMemberCommentSchema>;
export type ModerateCommentType = z.infer<typeof ModerateCommentSchema>;
