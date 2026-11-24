import { cn } from "@/lib/utils";
import { BADGE_BASE, ORDER_STATUS_STYLES } from "@/modules/order/utils/order.utils";
import { CUSTOMER_STATUS_COPY } from "@/modules/order/utils/customer-order.utils";
import { OrderStatus } from "@/modules/order/types/order.types";
import { LucideIcon } from "lucide-react";
import React from "react";

// ============ SMALL BUILDING BLOCKS SHARED BY THE ACCOUNT PAGES ============

export function AccountPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1 min-w-0">
        <h1 className="text-2xl font-semibold text-neutralPrimary-800">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-neutralPrimary-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function AccountCard({
  children,
  className,
  as: Tag = "section",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
}) {
  return (
    <Tag
      className={cn(
        "bg-white border border-neutralPrimary-300/70 rounded-2xl shadow-[0_1px_3px_rgba(16,24,40,0.06)]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function AccountCardTitle({
  icon: Icon,
  title,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        {Icon && (
          <span className="w-8 h-8 rounded-lg bg-greenPrimary-950 text-greenPrimary-600 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4" />
          </span>
        )}
        <h2 className="text-base font-semibold text-neutralPrimary-800 truncate">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

/** A friendly empty state with one clear next step. */
export function EmptyPanel({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center gap-3 rounded-2xl border-2 border-dashed border-neutralPrimary-200 bg-neutralPrimary-50/60 px-6 py-14",
        className,
      )}
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-greenPrimary-500 shadow-sm ring-1 ring-neutralPrimary-100">
        <Icon className="h-7 w-7" />
      </span>
      <div className="flex flex-col gap-1 max-w-sm">
        <p className="text-lg font-semibold text-neutralPrimary-800">{title}</p>
        {description && (
          <p className="text-sm text-neutralPrimary-500">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-greenPrimary-500 px-5 h-11 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-greenPrimary-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-greenPrimary-500/25 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60";

export const outlineButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-neutralPrimary-300 bg-white px-4 h-10 text-sm font-semibold text-neutralPrimary-700 transition-colors duration-200 hover:border-greenPrimary-300 hover:bg-greenPrimary-950 hover:text-greenPrimary-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-greenPrimary-500/20 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60";

/** The order status in the customer's words, coloured like the admin badge. */
export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  const style = ORDER_STATUS_STYLES[status];
  return (
    <span className={cn(BADGE_BASE, style?.badge, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", style?.dot)} />
      {CUSTOMER_STATUS_COPY[status]?.label ?? status}
    </span>
  );
}
