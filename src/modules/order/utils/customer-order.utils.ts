import { getBaseUrl } from "@/config/env.config";
import {
  CustomerOrderGroup,
  IOrderTimelineEntry,
  OrderStatus,
} from "@/modules/order/types/order.types";
import {
  Ban,
  CircleCheck,
  ClipboardCheck,
  LucideIcon,
  PackageCheck,
  PackageOpen,
  RotateCcw,
  Truck,
} from "lucide-react";

/**
 * Order statuses in the customer's words. The badge colours come from
 * ORDER_STATUS_STYLES (order.utils.ts) so admin and customer screens match;
 * only the wording differs, because the admin hints are written for staff.
 */
export const CUSTOMER_STATUS_COPY: Record<
  OrderStatus,
  { label: string; hint: string; icon: LucideIcon }
> = {
  PENDING: {
    label: "Order placed",
    hint: "We've received your order and will confirm it shortly.",
    icon: ClipboardCheck,
  },
  CONFIRMED: {
    label: "Confirmed",
    hint: "Your order is confirmed and will be packed soon.",
    icon: CircleCheck,
  },
  PROCESSING: {
    label: "Packing",
    hint: "We're packing your order.",
    icon: PackageOpen,
  },
  SHIPPED: {
    label: "On the way",
    hint: "Your order is with the courier and on its way to you.",
    icon: Truck,
  },
  DELIVERED: {
    label: "Delivered",
    hint: "Your order has been delivered. Enjoy!",
    icon: PackageCheck,
  },
  CANCELLED: {
    label: "Cancelled",
    hint: "This order was cancelled and will not be delivered.",
    icon: Ban,
  },
  REFUNDED: {
    label: "Refunded",
    hint: "This order was refunded.",
    icon: RotateCcw,
  },
};

/** The tabs of "My orders". `count` reads the matching field of the summary. */
export const CUSTOMER_ORDER_TABS: {
  label: string;
  value: CustomerOrderGroup | "ALL";
  countKey: "totalOrders" | "activeOrders" | "deliveredOrders" | "cancelledOrders";
}[] = [
  { label: "All orders", value: "ALL", countKey: "totalOrders" },
  { label: "In progress", value: "ACTIVE", countKey: "activeOrders" },
  { label: "Delivered", value: "DELIVERED", countKey: "deliveredOrders" },
  { label: "Cancelled", value: "CANCELLED", countKey: "cancelledOrders" },
];

/** The steps of the progress tracker on the order page. */
export const ORDER_PROGRESS_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "PENDING", label: "Placed" },
  { status: "CONFIRMED", label: "Confirmed" },
  { status: "PROCESSING", label: "Packed" },
  { status: "SHIPPED", label: "Shipped" },
  { status: "DELIVERED", label: "Delivered" },
];

/** Index of the furthest step reached; -1 for a cancelled/refunded order. */
export const progressIndex = (status: OrderStatus) =>
  ORDER_PROGRESS_STEPS.findIndex((step) => step.status === status);

/** When the order first reached each status, from its timeline. */
export const firstReachedAt = (timeline: IOrderTimelineEntry[]) => {
  const reached: Partial<Record<OrderStatus, string>> = {};
  for (const entry of timeline) {
    reached[entry.status] ??= entry.createdAt;
  }
  return reached;
};

/**
 * The timeline as the customer reads it: one entry per change of status.
 * Admin edits that kept the status (address fixes, notes) add history rows
 * with the same status; those are noise here.
 */
export const statusChanges = (timeline: IOrderTimelineEntry[]) =>
  timeline.filter(
    (entry, i) => i === 0 || entry.status !== timeline[i - 1].status,
  );

/** "Arrives by 16 Oct" from the order date and the estimated days. */
export const estimatedDelivery = (createdAt: string, estimatedDays: number) => {
  if (!estimatedDays) return undefined;
  const date = new Date(createdAt);
  date.setDate(date.getDate() + estimatedDays);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

export const formatOrderDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

/**
 * Order lines store the product image as the API saved it at checkout: a path
 * on the API server ("/uploads/products/a.webp"). Turn it into a full URL on
 * the API host so the browser can load it.
 */
export const orderImageUrl = (url?: string | null) => {
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  try {
    return `${new URL(getBaseUrl()).origin}${url.startsWith("/") ? "" : "/"}${url}`;
  } catch {
    return url;
  }
};
