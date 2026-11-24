"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  CATEGORY_COLORS,
  fmtNumber,
  fmtTaka,
  OTHER_COLOR,
} from "@/modules/dashboard/constants/dashboard.constants";
import { IDashboardOverview } from "@/modules/dashboard/types/dashboard.types";
import { LayoutGrid } from "lucide-react";
import React, { useState } from "react";
import DashboardCard, { EmptyState } from "./DashboardCard";

export default function CategorySales({ data }: { data?: IDashboardOverview }) {
  const [active, setActive] = useState<string | null>(null);
  const rows = data?.categories ?? [];
  const total = rows.reduce((a, r) => a + r.revenue, 0);
  //* colour follows the row's slot in the server's fixed ranking; "Other" is neutral
  const colorOf = (name: string, i: number) =>
    name === "Other" ? OTHER_COLOR : CATEGORY_COLORS[i % CATEGORY_COLORS.length];

  return (
    <DashboardCard
      title="Sales by category"
      subtitle="Share of item revenue this period"
      icon={<LayoutGrid className="h-4 w-4" />}
      className="h-full"
    >
      {!data ? (
        <Skeleton className="h-60 w-full rounded-xl" />
      ) : total === 0 ? (
        <div className="h-52">
          <EmptyState>No category sales in this period.</EmptyState>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex h-4 w-full gap-[2px] overflow-hidden rounded-full">
            {rows.map((r, i) => (
              <div
                key={r.name}
                title={`${r.name}: ${fmtTaka(r.revenue)}`}
                onMouseEnter={() => setActive(r.name)}
                onMouseLeave={() => setActive(null)}
                className="h-full transition-opacity first:rounded-l-full last:rounded-r-full"
                style={{
                  width: `${(r.revenue / total) * 100}%`,
                  background: colorOf(r.name, i),
                  opacity: active && active !== r.name ? 0.35 : 1,
                }}
              />
            ))}
          </div>
          <ul className="flex flex-col gap-1">
            {rows.map((r, i) => {
              const pct = (r.revenue / total) * 100;
              return (
                <li
                  key={r.name}
                  onMouseEnter={() => setActive(r.name)}
                  onMouseLeave={() => setActive(null)}
                  className={`grid grid-cols-[auto_1fr_auto] items-center gap-x-2.5 rounded-lg px-2 py-2 transition-colors ${
                    active === r.name ? "bg-neutralPrimary-100" : ""
                  }`}
                >
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: colorOf(r.name, i) }} />
                  <div className="min-w-0">
                    <p className="text-sm text-neutralPrimary-700 font-medium truncate">{r.name}</p>
                    <p className="text-[11px] text-neutralPrimary-400">{fmtNumber(r.units)} units</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-neutralPrimary-800 tabular-nums">{fmtTaka(r.revenue)}</p>
                    <p className="text-[11px] text-neutralPrimary-400 tabular-nums">{pct.toFixed(1)}%</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </DashboardCard>
  );
}
