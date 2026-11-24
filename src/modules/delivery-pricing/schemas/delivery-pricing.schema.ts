import { z } from "zod";

// Limits mirror the server's UpdateDeliveryPricingDto, so they show inline
// instead of coming back as an API error toast.
export const DELIVERY_CHARGE_MIN = 10;
export const DELIVERY_CHARGE_MAX = 1000;

export const deliveryPricingSchema = z.object({
  deliveryMethod: z.string().optional(),
  status: z.string().trim().optional(),
  deliveryCharge: z
    .number({ message: "Delivery charge is required" })
    .min(DELIVERY_CHARGE_MIN, `Delivery charge must be at least ${DELIVERY_CHARGE_MIN} BDT`)
    .max(DELIVERY_CHARGE_MAX, `Delivery charge can't exceed ${DELIVERY_CHARGE_MAX} BDT`),
  estimatedDays: z
    .number({ message: "Estimated days is required" })
    .int("Estimated days must be a whole number")
    .min(1, "Estimated days must be at least 1"),
});

export type DeliveryChargeFormType = z.infer<typeof deliveryPricingSchema>;
