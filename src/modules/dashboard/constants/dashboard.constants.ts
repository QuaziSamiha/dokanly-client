import {
  DashboardPeriod,
  OrderStatusKey,
  PaymentMethodKey,
} from "@/modules/dashboard/types/dashboard.types";

export const PERIODS: { value: DashboardPeriod; label: string; long: string }[] = [
  { value: "day", label: "Today", long: "Today vs yesterday" },
  { value: "week", label: "7D", long: "Last 7 days vs previous 7" },
  { value: "month", label: "30D", long: "Last 30 days vs previous 30" },
  { value: "quarter", label: "90D", long: "Last 90 days vs previous 90" },
  { value: "year", label: "12M", long: "Last 12 months vs previous 12" },
];

export const PREV_LABEL: Record<DashboardPeriod, string> = {
  day: "yesterday",
  week: "prev 7 days",
  month: "prev 30 days",
  quarter: "prev 90 days",
  year: "prev 12 months",
};

//* Brand green ramp (globals.css greenPrimary) for charts drawn in SVG.
export const BRAND = {
  50: "#f4f8e6",
  200: "#b1d441",
  300: "#96b435",
  500: "#677c22",
  600: "#516219",
  700: "#3c4a10",
};

//* Order status colors. The order below is the pipeline/donut order and was
//* validated for colour-blind separation of neighbours; keep it.
export const STATUS_META: Record<
  OrderStatusKey,
  { label: string; color: string; badge: string }
> = {
  PENDING: {
    label: "Pending",
    color: "#f59e0b",
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "#2a78d6",
    badge: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  PROCESSING: {
    label: "Processing",
    color: "#0f9f8f",
    badge: "bg-teal-50 text-teal-700 ring-teal-200",
  },
  SHIPPED: {
    label: "Shipped",
    color: "#c026d3",
    badge: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200",
  },
  DELIVERED: {
    label: "Delivered",
    color: "#16a34a",
    badge: "bg-green-50 text-green-700 ring-green-200",
  },
  REFUNDED: {
    label: "Refunded",
    color: "#94a3b8",
    badge: "bg-slate-100 text-slate-700 ring-slate-200",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "#dc2626",
    badge: "bg-red-50 text-red-700 ring-red-200",
  },
};

export const STATUS_ORDER = Object.keys(STATUS_META) as OrderStatusKey[];

export const PAYMENT_META: Record<PaymentMethodKey, { label: string; color: string }> = {
  CASH_ON_DELIVERY: { label: "Cash on delivery", color: "#677c22" },
  SSLCOMMERZ: { label: "Online (SSLCommerz)", color: "#2a78d6" },
};

//* Categorical slots, fixed order (validated). "Other" is always neutral.
export const CATEGORY_COLORS = [
  "#2a78d6",
  "#eb6834",
  "#1baf7a",
  "#eda100",
  "#e87ba4",
  "#6250d6",
];
export const OTHER_COLOR = "#a8a29e";

// * =========== FORMATTERS ===========
const compactFmt = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export const fmtNumber = (n: number | null | undefined) =>
  n === null || n === undefined ? "—" : n.toLocaleString("en-US");

export const fmtCompact = (n: number) => compactFmt.format(n);

export const fmtTaka = (n: number | null | undefined, opts?: { compact?: boolean }) => {
  if (n === null || n === undefined) return "—";
  if (opts?.compact && Math.abs(n) >= 10_000) return `৳${compactFmt.format(n)}`;
  return `৳${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
};

export const fmtPct = (n: number | null | undefined, digits = 1) =>
  n === null || n === undefined ? "—" : `${n.toFixed(digits).replace(/\.0$/, "")}%`;

export const fmtHours = (h: number | null | undefined) => {
  if (h === null || h === undefined) return "—";
  if (h < 48) return `${Math.round(h)}h`;
  return `${(h / 24).toFixed(1).replace(/\.0$/, "")}d`;
};

export function timeAgo(iso: string | number) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d < 30 ? `${d}d ago` : new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short" });
}
