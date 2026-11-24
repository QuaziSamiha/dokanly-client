"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  BRAND,
  fmtNumber,
  fmtTaka,
} from "@/modules/dashboard/constants/dashboard.constants";
import { IDashboardOverview } from "@/modules/dashboard/types/dashboard.types";
import { MapPin } from "lucide-react";
import React from "react";
import DashboardCard, { EmptyState } from "./DashboardCard";

//* One measure across nominal categories, so every bar wears the same colour.
export default function TopCities({ data }: { data?: IDashboardOverview }) {
  const rows = data?.cities ?? [];
  const max = Math.max(1, ...rows.map((r) => r.orders));
  const totalOrders = data?.kpis.orders.value ?? 0;

  return (
    <DashboardCard
      title="Top delivery cities"
      subtitle="Where this period's orders are going"
      icon={<MapPin className="h-4 w-4" />}
      className="h-full"
    >
      {!data ? (
        <Skeleton className="h-60 w-full rounded-xl" />
      ) : rows.length === 0 ? (
        <div className="h-52">
          <EmptyState>No deliveries in this period.</EmptyState>
        </div>
      ) : (
        <ul className="flex flex-col gap-3.5">
          {rows.map((r, i) => (
            <li key={r.city} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="flex items-center gap-2 min-w-0">
                  <span className="text-[11px] font-semibold text-neutralPrimary-400 w-4 tabular-nums">{i + 1}</span>
                  <span className="font-medium text-neutralPrimary-700 truncate">{r.city}</span>
                </span>
                <span className="text-xs text-neutralPrimary-500 tabular-nums whitespace-nowrap">
                  <strong className="text-neutralPrimary-800">{fmtNumber(r.orders)}</strong> orders ·{" "}
                  {fmtTaka(r.revenue, { compact: true })}
                </span>
              </div>
              <div className="ml-6 h-2 rounded-full bg-neutralPrimary-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(r.orders / max) * 100}%`, background: BRAND[500] }}
                  title={totalOrders ? `${((r.orders / totalOrders) * 100).toFixed(1)}% of orders` : undefined}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
