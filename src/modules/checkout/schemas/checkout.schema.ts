import { validateEmail } from "@/lib/utils/validation.utils";
import { validatePhone } from "@/lib/utils/validation.utils";
import { z } from "zod";

const checkoutSchemaBase = z.object({
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
  // * ====== Address selection (ADDRESS ID) =========
  addressId: z.number().optional(),

  // * ======= New address fields (DETAILS ADDRESS) =======
  street: z.string().trim().optional(), // ? STREET AND HOUSE NO
  city: z.string().trim().optional(),
  region: z.string().trim().optional(), // state
  zipCode: z.string().trim().optional(),
  country: z.string().trim().optional(),

  deliveryMethod: z
    .string()
    .trim()
    .min(1, { message: "Delivery method is required" }),
  paymentMethod: z
    .string()
    .trim()
    .min(1, { message: "Payment method is required" }),

  promotionId: z.number().optional(),
});

/**
 * The server's minimum lengths for a new address (POST /order/create-order),
 * checked here so the shopper sees them next to the field instead of as an
 * error after confirming. Empty fields get the "required" message instead.
 */
const ADDRESS_MIN_LENGTHS = [
  { path: "street", min: 5, label: "Street name & house no." },
  { path: "city", min: 4, label: "District" },
  { path: "zipCode", min: 3, label: "Zip code" },
] as const;

const checkAddressLengths = (
  data: z.infer<typeof checkoutSchemaBase>,
  ctx: z.RefinementCtx
) => {
  for (const { path, min, label } of ADDRESS_MIN_LENGTHS) {
    const value = data[path]?.trim() ?? "";
    if (value && value.length < min) {
      ctx.addIssue({
        code: "custom",
        message: `${label} must be at least ${min} characters`,
        path: [path],
      });
    }
  }
};

export const getCheckoutSchema = (
  isLoggedIn: boolean,
  addNewAddress: boolean
) => {
  return checkoutSchemaBase.superRefine((data, ctx) => {
    const hasAddressId = !!data.addressId;
    // * ======== FOR GUEST USERS ========
    if (!isLoggedIn) {
      if (!data.street?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Street name & house no. is required",
          path: ["street"],
        });
      }

      if (!data.region?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Region/Division is required",
          path: ["region"],
        });
      }

      if (!data.city?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "District is required",
          path: ["city"],
        });
      }

      if (!data.zipCode?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Zip code is required",
          path: ["zipCode"],
        });
      }

      if (hasAddressId) {
        ctx.addIssue({
          code: "custom",
          message: "Guest users cannot use saved addresses",
          path: ["addressId"],
        });
      }
      checkAddressLengths(data, ctx);
      return;
    }

    // * ======== FOR LOGGED IN USERS ========
    if (isLoggedIn) {
      // If user is providing new address (has any new address field)
      if (addNewAddress) {
        // Validate all new address fields
        if (!data.street?.trim()) {
          ctx.addIssue({
            code: "custom",
            message: "Street name & house no. is required",
            path: ["street"],
          });
        }
        if (!data.region?.trim()) {
          ctx.addIssue({
            code: "custom",
            message: "Region/Division is required",
            path: ["region"],
          });
        }

        if (!data.city?.trim()) {
          ctx.addIssue({
            code: "custom",
            message: "District is required",
            path: ["city"],
          });
        }

        if (!data.zipCode?.trim()) {
          ctx.addIssue({
            code: "custom",
            message: "Zip code is required",
            path: ["zipCode"],
          });
        }
        checkAddressLengths(data, ctx);
      }
    }
  });
};

export type CheckoutFormData = z.infer<typeof checkoutSchemaBase>;
