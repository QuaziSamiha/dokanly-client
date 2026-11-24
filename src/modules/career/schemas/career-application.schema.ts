import { validatePhone } from "@/lib/utils/validation.utils";
import z from "zod";
import {
  RESUME_MAX_MB,
  RESUME_MIME_TYPES,
} from "../constants/career.constants";

/**
 * Same rules as the server's `CreateApplicationMultipartDto`, so a candidate
 * sees every problem before the upload starts.
 */
export const applyJobSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Name must be at most 100 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .max(255, "Email must be at most 255 characters"),
  phone: z.string().trim().refine(validatePhone, {
    message:
      "Enter a valid phone number, e.g. +8801712345678 or 01712345678",
  }),
  address: z
    .string()
    .max(255, "Address must be at most 255 characters")
    .optional(),
  // `InputField` hands back `null` for an emptied number input, not undefined.
  yearOfExperience: z
    .number({ message: "Enter a number" })
    .min(0, "Experience cannot be less than 0")
    .max(50, "Experience cannot be more than 50 years")
    .refine(
      (val) => Number.isInteger(val * 10),
      "Use at most one decimal place, e.g. 2.5",
    )
    .nullish(),
  skills: z
    .string()
    .max(1000, "Skills must be at most 1000 characters")
    .optional(),
  resumeFile: z
    .any()
    .refine((file) => file instanceof File, "Please attach your resume")
    .refine(
      (file) => !(file instanceof File) || RESUME_MIME_TYPES.includes(file.type),
      "Only PDF, DOC or DOCX files are accepted",
    )
    .refine(
      (file) =>
        !(file instanceof File) || file.size <= RESUME_MAX_MB * 1024 * 1024,
      `The file must be ${RESUME_MAX_MB} MB or smaller`,
    ),
});

export type ApplyJobForm = z.infer<typeof applyJobSchema>;
