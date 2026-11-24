import {
  IPromotion,
  PromotionStatus,
} from "@/modules/promotion/types/promotion.types";

/** Pill and dot colours per status, shared by the table and the view modal. */
export const PROMOTION_STATUS_STYLES: Record<
  PromotionStatus,
  { pill: string; dot: string; label: string }
> = {
  ACTIVE: {
    pill: "bg-success-100 text-success-600 ring-success-600/20",
    dot: "bg-success-600",
    label: "Active",
  },
  INACTIVE: {
    pill: "bg-destructive-100 text-destructive-600 ring-destructive-600/20",
    dot: "bg-destructive-600",
    label: "Inactive",
  },
  EXPIRED: {
    pill: "bg-neutralPrimary-100 text-neutralPrimary-600 ring-neutralPrimary-400/30",
    dot: "bg-neutralPrimary-400",
    label: "Expired",
  },
  ARCHIVED: {
    pill: "bg-warningPrimary-100 text-warningPrimary-600 ring-warningPrimary-600/20",
    dot: "bg-warningPrimary-600",
    label: "Archived",
  },
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** Local midnight of the given day; promotions run by whole days. */
export const startOfDay = (value: string | Date) => {
  const d = new Date(value);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

/** Whole days from a to b (negative when b is earlier). */
export const daysBetween = (a: string | Date, b: string | Date) =>
  Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY_MS);

/**
 * The calendar day of a stored date as UTC midnight, the format
 * DateInputField reads and writes, so the picker shows the same day as the
 * table whichever way the date was saved.
 */
export const toPickerDate = (value?: string | Date) => {
  if (!value) return undefined;
  const d = new Date(value);
  if (isNaN(d.getTime())) return undefined;
  return new Date(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()),
  ).toISOString();
};

export const formatDate = (value?: string | Date) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

export const formatDateTime = (value?: string | Date) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

export const formatTk = (value?: number | null) =>
  value == null ? "—" : `Tk ${Number(value).toLocaleString("en-US")}`;

export const isPercentage = (p: Pick<IPromotion, "discountType">) =>
  p.discountType === "PERCENTAGE";

/** "10%" or "Tk 150". */
export const formatDiscount = (
  p: Pick<IPromotion, "discountType" | "discountValue">,
) =>
  isPercentage(p)
    ? `${Number(p.discountValue)}%`
    : formatTk(p.discountValue);

/** The offer in one line, as a customer would read it. */
export const describeOffer = (
  p: Pick<
    IPromotion,
    | "discountType"
    | "discountValue"
    | "maxDiscountAmount"
    | "minPurchase"
    | "maxPurchase"
  >,
) => {
  let text = `${formatDiscount(p)} off`;
  if (isPercentage(p) && p.maxDiscountAmount) {
    text += ` (up to ${formatTk(p.maxDiscountAmount)})`;
  }
  if (p.minPurchase && p.maxPurchase) {
    text += ` on orders of ${formatTk(p.minPurchase)} – ${formatTk(p.maxPurchase)}`;
  } else if (p.minPurchase) {
    text += ` on orders over ${formatTk(p.minPurchase)}`;
  } else if (p.maxPurchase) {
    text += ` on orders up to ${formatTk(p.maxPurchase)}`;
  }
  return text;
};

export const isUsedUp = (p: Pick<IPromotion, "usageLimit" | "usedCount">) =>
  !!p.usageLimit && p.usedCount >= p.usageLimit;

/** Share of the usage limit already used, 0–100; null when unlimited. */
export const usagePercent = (
  p: Pick<IPromotion, "usageLimit" | "usedCount">,
) =>
  p.usageLimit
    ? Math.min(100, Math.round((p.usedCount / p.usageLimit) * 100))
    : null;

export const usageBarClass = (percent: number) =>
  percent >= 100
    ? "bg-destructive-500"
    : percent >= 80
      ? "bg-warningPrimary-500"
      : "bg-greenPrimary-500";

/**
 * What an ACTIVE promotion is doing right now. The status alone says it is
 * switched on; this says whether customers can actually use it today.
 */
export type PromotionPhase = "UPCOMING" | "RUNNING" | "USED_UP" | null;

export const promotionPhase = (p: IPromotion): PromotionPhase => {
  if (p.status !== "ACTIVE") return null;
  if (startOfDay(p.startDate) > startOfDay(new Date())) return "UPCOMING";
  if (isUsedUp(p)) return "USED_UP";
  return "RUNNING";
};

/** "12 days left", "Starts in 3 days", "Ended 6 days ago"… */
export const scheduleHint = (p: IPromotion) => {
  const today = new Date();
  const toStart = daysBetween(today, p.startDate);
  const toEnd = daysBetween(today, p.endDate);
  const plural = (n: number) => `${n} day${n === 1 ? "" : "s"}`;

  if (toStart > 0) return `Starts in ${plural(toStart)}`;
  if (toEnd < 0) return `Ended ${plural(-toEnd)} ago`;
  if (toEnd === 0) return "Last day today";
  return `${plural(toEnd)} left`;
};

/** Length of the promotion in days, both ends included. */
export const durationDays = (
  start?: string | Date | null,
  end?: string | Date | null,
) => (start && end ? daysBetween(start, end) + 1 : null);
