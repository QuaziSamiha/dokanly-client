import { validateEmail } from "@/lib/utils/validation.utils";
import { validatePhone } from "@/lib/utils/validation.utils";
import { z } from "zod";

export const updateOrderSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { message: "First name is required" })
    .max(100, { message: "First name will contain max 100 character" }), // min 1 and max 100 character
  lastName: z.string().trim().optional(), // min 1 and max 100 character

  // userEmail: z.string().trim().email({ message: "Invalid email." }).optional(),
  userEmail: z
    .string()
    .trim()
    .refine(validateEmail, {
      message: "Please enter a valid email address",
    })
    .optional(),

  phone: z.string().trim().refine(validatePhone, {
    message:
      "Valid phone number (e.g., +88017XXXXXXX or 017XXXXXXX) is required",
  }),

  // * The delivery address is not editable (the server rejects it).
  orderStatus: z.string().trim().optional(),
  paymentStatus: z.string().trim().optional(),
});

export type UpdateOrderFormType = z.infer<typeof updateOrderSchema>;
