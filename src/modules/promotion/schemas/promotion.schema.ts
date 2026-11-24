import { z } from "zod";

/**
 * Limits mirror the server's CreatePromotionDto, so a value the form accepts
 * is never rejected by the API for its shape.
 */
export const PROMOTION_LIMITS = {
  TITLE_MAX: 100,
  DESCRIPTION_MAX: 255,
  COUPON_CODE_MIN: 3,
  COUPON_CODE_MAX: 30,
  PERCENTAGE_MAX: 100,
} as const;

const L = PROMOTION_LIMITS;

/** An optional amount: empty inputs arrive as null. */
const optionalAmount = (label: string) =>
  z
    .number({ error: `${label} must be a number` })
    .positive(`${label} must be greater than 0`)
    .nullable()
    .optional();

const optionalText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be at most ${max} characters`)
    .optional();

const date = (label: string) =>
  z
    .string({ error: `${label} is required` })
    .min(1, `${label} is required`)
    .refine((val) => !isNaN(Date.parse(val)), `${label} is not a valid date`);

// ============ CREATE ============

export const promotionSchema = z
  .object({
    title: optionalText("Title", L.TITLE_MAX),
    description: optionalText("Description", L.DESCRIPTION_MAX),
    couponCode: z
      .string({ error: "Coupon code is required" })
      .trim()
      .min(1, "Coupon code is required")
      .min(
        L.COUPON_CODE_MIN,
        `Coupon code must be at least ${L.COUPON_CODE_MIN} characters`,
      )
      .max(
        L.COUPON_CODE_MAX,
        `Coupon code must be at most ${L.COUPON_CODE_MAX} characters`,
      )
      .regex(
        /^(?=.*[A-Za-z])[A-Za-z0-9_-]+$/,
        "Use letters, numbers, - and _ only, with at least one letter (no spaces)",
      ),
    discountType: z.enum(["PERCENTAGE", "FIXED"], {
      error: "Discount type is required",
    }),
    discountValue: z
      .number({ error: "Discount value is required" })
      .positive("Discount value must be greater than 0"),
    maxDiscountAmount: optionalAmount("Maximum discount"),
    minPurchase: optionalAmount("Minimum order"),
    maxPurchase: optionalAmount("Maximum order"),
    usageLimit: z
      .number({ error: "Usage limit must be a number" })
      .int("Usage limit must be a whole number")
      .min(1, "Usage limit must be at least 1")
      .nullable()
      .optional(),
    startDate: date("Start date"),
    endDate: date("End date"),
    isPublic: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (
      data.discountType === "PERCENTAGE" &&
      data.discountValue > L.PERCENTAGE_MAX
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["discountValue"],
        message: `A percentage discount can't be more than ${L.PERCENTAGE_MAX}%`,
      });
    }
    if (data.discountType === "FIXED" && data.maxDiscountAmount) {
      ctx.addIssue({
        code: "custom",
        path: ["maxDiscountAmount"],
        message: "A fixed discount can't have a maximum discount",
      });
    }
    if (
      data.minPurchase &&
      data.maxPurchase &&
      data.minPurchase > data.maxPurchase
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["maxPurchase"],
        message: "Maximum order can't be lower than the minimum order",
      });
    }
    if (
      data.startDate &&
      data.endDate &&
      new Date(data.startDate) > new Date(data.endDate)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date can't be before the start date",
      });
    }
  });

export type PromotionFormType = z.infer<typeof promotionSchema>;

// ============ EDIT ============

/**
 * Only these fields can change once a promotion exists (the server rejects
 * the rest); the start date only while the promotion hasn't started yet.
 * The checks need the promotion as it is now.
 */
export const editPromotionSchema = (current: {
  status: string;
  startDate: string | Date;
  canEditStart: boolean;
  usageLimit?: number | null;
  usedCount: number;
}) =>
  z
    .object({
      status: z.string().min(1, "Status is required"),
      startDate: current.canEditStart
        ? date("Start date")
        : z.string().optional(),
      endDate: date("End date"),
      usageLimit: z
        .number({ error: "Usage limit must be a number" })
        .int("Usage limit must be a whole number")
        .min(1, "Usage limit must be at least 1")
        .nullable()
        .optional(),
      isPublic: z.boolean(),
    })
    .superRefine((data, ctx) => {
      if (current.usageLimit && !data.usageLimit) {
        ctx.addIssue({
          code: "custom",
          path: ["usageLimit"],
          message: `A usage limit can't be removed; keep it at ${current.usageLimit} or raise it`,
        });
      }
      if (data.usageLimit) {
        if (current.usageLimit && data.usageLimit < current.usageLimit) {
          ctx.addIssue({
            code: "custom",
            path: ["usageLimit"],
            message: `Usage limit can only be raised (currently ${current.usageLimit})`,
          });
        } else if (data.usageLimit < current.usedCount) {
          ctx.addIssue({
            code: "custom",
            path: ["usageLimit"],
            message: `Already used ${current.usedCount} times; the limit can't be lower`,
          });
        }
      }

      const today = new Date();
      // Compare calendar days only. Picker values are UTC midnight.
      const day = (d: Date) =>
        Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
      const pickerDay = (value: string) => {
        const d = new Date(value);
        return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
      };
      const endDay = pickerDay(data.endDate);
      const startDay =
        current.canEditStart && data.startDate
          ? pickerDay(data.startDate)
          : day(new Date(current.startDate));

      if (current.canEditStart && data.startDate && startDay < day(today)) {
        ctx.addIssue({
          code: "custom",
          path: ["startDate"],
          message: "Start date can't be in the past",
        });
      }
      if (endDay < startDay) {
        ctx.addIssue({
          code: "custom",
          path: ["endDate"],
          message: "End date can't be before the start date",
        });
      }
      // An expired promotion is switched back on by moving its end date.
      if (
        current.status === "EXPIRED" &&
        data.status !== "EXPIRED" &&
        endDay < day(today)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["endDate"],
          message: "Pick an end date from today onward to re-activate it",
        });
      }
    });

export type EditPromotionFormType = z.infer<
  ReturnType<typeof editPromotionSchema>
>;
