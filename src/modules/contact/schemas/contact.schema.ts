// import { validatePhone } from "@/lib/utils/validation.utils";
import { z } from "zod";

export const messageSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { message: "First name is required" })
    .max(100, { message: "First name will contain max 100 character" }), // min 1 and max 100 character
  lastName: z.string().trim().optional(), // min 1 and max 100 character
  phone: z
    .string()
    .trim()
    // .refine(validatePhone, {
    //   message:
    //     "Valid phone number (e.g., +88017XXXXXXX or 017XXXXXXX) is required",
    // })
    .optional(),

  // ======= New address fields (DETAILS ADDRESS) =======
  message: z.string().trim().min(1, { message: "Message is required" }),
});

export type MessageFormType = z.infer<typeof messageSchema>;
