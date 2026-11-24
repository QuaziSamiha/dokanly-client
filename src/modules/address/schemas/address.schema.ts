import { z } from "zod";

/**
 * The address book form. The limits match the API (address-field.rules.ts on
 * the server), so a value the API would reject is caught here first.
 */
export const addressFormSchema = z.object({
  street: z
    .string({ message: "Street address is required" })
    .trim()
    .min(5, "Street address must be at least 5 characters")
    .max(255, "Street address must be at most 255 characters"),
  //* ==== THE DIVISION DECIDES THE DELIVERY CHARGE AT CHECKOUT, SO IT IS REQUIRED HERE ====
  state: z
    .string({ message: "Division is required" })
    .trim()
    .min(1, "Division is required"),
  city: z
    .string({ message: "District is required" })
    .trim()
    .min(4, "District is required")
    .max(100, "District must be at most 100 characters"),
  zipCode: z
    .string({ message: "Postal code is required" })
    .trim()
    .min(3, "Postal code must be at least 3 characters")
    .max(20, "Postal code must be at most 20 characters"),
  isDefault: z.boolean().optional(),
});

export type AddressFormData = z.infer<typeof addressFormSchema>;
