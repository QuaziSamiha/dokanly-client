"use client";

import React from "react";
import { IOrderStats, OrderStatus } from "@/modules/order/types/order.types";
import { ORDER_STATUS_STYLES } from "@/modules/order/utils/order.utils";

const TABS: { value?: OrderStatus; label: string }[] = [
  { value: undefined, label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
];

/** Status tabs with live counts; the counts always cover every order. */
export default function OrderStatusTabs({
  value,
  stats,
  onChange,
}: {
  value?: OrderStatus;
  stats?: IOrderStats;
  onChange: (status?: OrderStatus) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Filter orders by status"
      className="flex gap-1 overflow-x-auto border-b border-neutralPrimary-200 scrollbar-brand"
    >
      {TABS.map((tab) => {
        const active = tab.value === value;
        const count = tab.value
          ? stats?.statusCounts?.[tab.value]
          : stats?.totalOrders;
        const style = tab.value ? ORDER_STATUS_STYLES[tab.value] : undefined;
        return (
          <button
            key={tab.label}
            type="button"
            role="tab"
            aria-selected={active}
            title={style?.hint}
            onClick={() => onChange(tab.value)}
            className={`relative flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenPrimary-500/30 ${
              active
                ? "text-greenPrimary-700"
                : "text-neutralPrimary-500 hover:text-neutralPrimary-800"
            }`}
          >
            {style && (
              <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
            )}
            {tab.label}
            {count !== undefined && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                  active
                    ? "bg-greenPrimary-600 text-white"
                    : tab.value === "PENDING" && count > 0
                      ? "bg-amber-100 text-amber-700"
                      : "bg-neutralPrimary-100 text-neutralPrimary-500"
                }`}
              >
                {count.toLocaleString()}
              </span>
            )}
            <span
              className={`absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-greenPrimary-600 transition-transform duration-300 ${
                active ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
