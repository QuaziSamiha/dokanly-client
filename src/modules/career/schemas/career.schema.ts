import { z } from "zod";

export const StatusEnum = z.enum(["ACTIVE", "INACTIVE"]);
export const JobTypeEnum = z.enum([
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
]);
export const JobLocationTypeEnum = z.enum(["ONSITE", "HYBRID", "ONLINE"]);

/** An editor with nothing typed in still holds markup such as "<p><br></p>". */
const hasText = (html: string) =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim().length > 0;

const requiredRichText = (label: string) =>
  z
    .string({ message: `${label} are required` })
    .refine(hasText, `${label} are required`);

/**
 * Field rules shared by the add and edit forms. Limits match the server's
 * `CreateJobDto`, so a value is rejected here before it is sent.
 */
const baseJobSchema = {
  position: z
    .string()
    .trim()
    .min(2, "Position title is too short")
    .max(255, "Position title must be at most 255 characters")
    .refine((val) => /[a-z0-9]/i.test(val), "Use at least one letter or digit"),

  deadline: z
    .string({ message: "Deadline is required" })
    .min(1, "Deadline is required")
    .refine((val) => !isNaN(Date.parse(val)), "Invalid deadline"),

  jobType: z
    .string({ message: "Please select a job type" })
    .min(1, "Please select a job type")
    .refine(
      (val) => (JobTypeEnum.options as string[]).includes(val),
      "Please select a job type",
    ),

  jobLocationType: z.string().optional().or(z.literal("")),

  location: z
    .string()
    .trim()
    .min(2, "Location is required")
    .max(255, "Location must be at most 255 characters"),

  salary: z
    .string()
    .max(100, "Salary must be at most 100 characters")
    .optional()
    .or(z.literal("")),

  overview: z.string().optional().or(z.literal("")),
  requirements: requiredRichText("Requirements"),
  responsibilities: requiredRichText("Responsibilities"),
  facilities: z.string().optional().or(z.literal("")),

  status: StatusEnum,
};

export const CreateCareerSchema = z.object({
  position: baseJobSchema.position,
  deadline: baseJobSchema.deadline,
  jobType: baseJobSchema.jobType,
  jobLocationType: baseJobSchema.jobLocationType,
  location: baseJobSchema.location,
  salary: baseJobSchema.salary,
  overview: baseJobSchema.overview,
  requirements: baseJobSchema.requirements,
  responsibilities: baseJobSchema.responsibilities,
  facilities: baseJobSchema.facilities,
});

/**
 * Every field optional, because only the changed (dirty) fields are sent; adds
 * the status field, which only the edit form has.
 */
export const UpdateCareerSchema = z.object(baseJobSchema).partial();

export type CreateCareerType = z.infer<typeof CreateCareerSchema>;
export type UpdateCareerType = z.infer<typeof UpdateCareerSchema>;
