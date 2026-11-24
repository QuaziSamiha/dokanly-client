import {
  DeliveryMethod,
  IInvoice,
  IOrder,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/modules/order/types/order.types";

// ============ BADGES ============

export const BADGE_BASE =
  "inline-flex items-center gap-1.5 whitespace-nowrap font-medium text-xs w-fit rounded-full px-2.5 py-1 ring-1 ring-inset";

type BadgeStyle = { label: string; badge: string; dot: string };

export const ORDER_STATUS_STYLES: Record<OrderStatus, BadgeStyle & { hint: string }> = {
  PENDING: {
    label: "Pending",
    badge: "text-amber-700 bg-amber-50 ring-amber-600/20",
    dot: "bg-amber-500",
    hint: "Waiting for you to confirm",
  },
  CONFIRMED: {
    label: "Confirmed",
    badge: "text-sky-700 bg-sky-50 ring-sky-600/20",
    dot: "bg-sky-500",
    hint: "Accepted; COD orders are sent to Steadfast",
  },
  PROCESSING: {
    label: "Processing",
    badge: "text-indigo-700 bg-indigo-50 ring-indigo-600/20",
    dot: "bg-indigo-500",
    hint: "Being packed",
  },
  SHIPPED: {
    label: "Shipped",
    badge: "text-violet-700 bg-violet-50 ring-violet-600/20",
    dot: "bg-violet-500",
    hint: "With the courier",
  },
  DELIVERED: {
    label: "Delivered",
    badge: "text-emerald-700 bg-emerald-50 ring-emerald-600/20",
    dot: "bg-emerald-500",
    hint: "Received by the customer",
  },
  CANCELLED: {
    label: "Cancelled",
    badge: "text-rose-700 bg-rose-50 ring-rose-600/20",
    dot: "bg-rose-500",
    hint: "Will not be delivered",
  },
  REFUNDED: {
    label: "Refunded",
    badge: "text-neutralPrimary-600 bg-neutralPrimary-50 ring-neutralPrimary-500/20",
    dot: "bg-neutralPrimary-400",
    hint: "Money returned",
  },
};

export const PAYMENT_STATUS_STYLES: Record<PaymentStatus, BadgeStyle> = {
  PENDING: {
    label: "Unpaid",
    badge: "text-amber-700 bg-amber-50 ring-amber-600/20",
    dot: "bg-amber-500",
  },
  PROCESSING: {
    label: "Processing",
    badge: "text-sky-700 bg-sky-50 ring-sky-600/20",
    dot: "bg-sky-500",
  },
  COMPLETED: {
    label: "Paid",
    badge: "text-emerald-700 bg-emerald-50 ring-emerald-600/20",
    dot: "bg-emerald-500",
  },
  FAILED: {
    label: "Failed",
    badge: "text-rose-700 bg-rose-50 ring-rose-600/20",
    dot: "bg-rose-500",
  },
  REFUNDED: {
    label: "Refunded",
    badge: "text-neutralPrimary-600 bg-neutralPrimary-50 ring-neutralPrimary-500/20",
    dot: "bg-neutralPrimary-400",
  },
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH_ON_DELIVERY: "Cash on delivery",
  SSLCOMMERZ: "Online (SSLCommerz)",
};

export const DELIVERY_METHOD_LABELS: Record<DeliveryMethod, string> = {
  INSIDE_DHAKA: "Inside Dhaka",
  OUTSIDE_DHAKA: "Outside Dhaka",
};

/** Steadfast statuses; anything else falls back to a neutral badge. */
const COURIER_STYLES: Record<string, string> = {
  delivered: "text-emerald-700 bg-emerald-50 ring-emerald-600/20",
  partial_delivered: "text-teal-700 bg-teal-50 ring-teal-600/20",
  delivered_approval_pending: "text-teal-700 bg-teal-50 ring-teal-600/20",
  in_review: "text-sky-700 bg-sky-50 ring-sky-600/20",
  pending: "text-amber-700 bg-amber-50 ring-amber-600/20",
  hold: "text-violet-700 bg-violet-50 ring-violet-600/20",
  cancelled: "text-rose-700 bg-rose-50 ring-rose-600/20",
  cancelled_approval_pending: "text-rose-700 bg-rose-50 ring-rose-600/20",
  unknown: "text-neutralPrimary-600 bg-neutralPrimary-50 ring-neutralPrimary-500/20",
};

export const courierBadgeClass = (status?: string | null) =>
  COURIER_STYLES[status ?? ""] ??
  "text-neutralPrimary-600 bg-neutralPrimary-50 ring-neutralPrimary-500/20";

export const formatCourierStatus = (status?: string | null) =>
  status
    ? status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Not sent";

/** The normal path of an order; CANCELLED and REFUNDED leave it. */
export const ORDER_FLOW: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

// ============ FORMATTING ============

// Amounts can arrive as Decimal strings, so coerce before formatting.
export const formatBDT = (value: number | string | null | undefined) =>
  `৳${Number(value ?? 0).toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;

/** ৳412.4K, ৳1.2M: for stat tiles where space is short. */
export const formatBDTCompact = (value: number | string | null | undefined) =>
  `৳${Number(value ?? 0).toLocaleString("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  })}`;

export const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "—";

/** "just now", "5 min ago", "3 h ago", "2 days ago", then the date. */
export function timeAgo(value?: string | null): string {
  if (!value) return "";
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const customerName = (order: Pick<IOrder, "firstName" | "lastName">) =>
  [order.firstName, order.lastName].filter(Boolean).join(" ");

export const initials = (order: Pick<IOrder, "firstName" | "lastName">) =>
  `${order.firstName?.[0] ?? ""}${order.lastName?.[0] ?? ""}`.toUpperCase() || "?";

export const itemCount = (order: { orderItems?: { quantity: number | string }[] }) =>
  order.orderItems?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) ?? 0;

export const fullAddress = (order: IOrder) =>
  [order.street, order.city, order.state, order.zipCode, order.country]
    .filter(Boolean)
    .join(", ");

/** Today in Bangladesh as YYYY-MM-DD, matching the server's date filters. */
export const dhakaToday = (offsetDays = 0) => {
  const date = new Date(Date.now() + offsetDays * 86_400_000);
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });
};

// ============ INVOICE ============

/** The order as the invoice reads it (the server already returns every field it needs). */
export const orderToInvoice = (order: IInvoice): IInvoice => order;

// ============ CSV EXPORT ============

const csvCell = (value: unknown) => {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** The orders on screen as a CSV file (opens cleanly in Excel thanks to the BOM). */
export function ordersToCsv(orders: IOrder[]): Blob {
  const header = [
    "Order",
    "Placed",
    "Customer",
    "Phone",
    "Email",
    "Customer type",
    "Address",
    "Delivery zone",
    "Items",
    "Subtotal",
    "Delivery",
    "Discount",
    "Grand total",
    "Coupon",
    "Payment method",
    "Payment",
    "Status",
    "Tracking ID",
    "Courier status",
  ];
  const rows = orders.map((order) => [
    order.orderId,
    formatDateTime(order.createdAt),
    customerName(order),
    order.phone,
    order.email,
    order.customerId ? "Registered" : "Guest",
    fullAddress(order),
    DELIVERY_METHOD_LABELS[order.deliveryMethod] ?? order.deliveryMethod,
    order.orderItems?.map((item) => `${item.productName} ×${item.quantity}`).join("; "),
    order.subtotal,
    order.deliveryCharge,
    order.discount,
    order.grandTotal,
    order.couponCode,
    PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod,
    PAYMENT_STATUS_STYLES[order.paymentStatus]?.label ?? order.paymentStatus,
    ORDER_STATUS_STYLES[order.status]?.label ?? order.status,
    order.trackingId,
    order.courierStatus,
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  return new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
}
