"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  fmtNumber,
  STATUS_META,
  STATUS_ORDER,
} from "@/modules/dashboard/constants/dashboard.constants";
import { IDashboardOverview } from "@/modules/dashboard/types/dashboard.types";
import { PieChart } from "lucide-react";
import React, { useState } from "react";
import DonutChart from "./charts/DonutChart";
import DashboardCard, { EmptyState } from "./DashboardCard";

export default function StatusMix({ data }: { data?: IDashboardOverview }) {
  const [active, setActive] = useState<string | null>(null);

  const counts = new Map(data?.statusBreakdown.map((s) => [s.status, s.count]));
  const slices = STATUS_ORDER.map((s) => ({
    key: s,
    label: STATUS_META[s].label,
    value: counts.get(s) ?? 0,
    color: STATUS_META[s].color,
  }));
  const total = slices.reduce((a, s) => a + s.value, 0);
  const activeSlice = slices.find((s) => s.key === active);

  return (
    <DashboardCard
      title="Order status mix"
      subtitle="Orders placed in this period, by current status"
      icon={<PieChart className="h-4 w-4" />}
      className="h-full"
    >
      {!data ? (
        <Skeleton className="h-[340px] w-full rounded-xl" />
      ) : total === 0 ? (
        <div className="h-[300px]">
          <EmptyState>No orders placed in this period.</EmptyState>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row xl:flex-col 2xl:flex-row items-center gap-5">
          <DonutChart
            slices={slices}
            active={active}
            onActiveChange={setActive}
            centerValue={fmtNumber(activeSlice ? activeSlice.value : total)}
            centerLabel={
              activeSlice
                ? `${activeSlice.label} · ${Math.round((activeSlice.value / total) * 100)}%`
                : "orders"
            }
          />
          <ul className="w-full flex flex-col gap-1">
            {slices.map((s) => {
              const pct = total ? (s.value / total) * 100 : 0;
              return (
                <li
                  key={s.key}
                  onMouseEnter={() => setActive(s.key)}
                  onMouseLeave={() => setActive(null)}
                  className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors ${
                    active === s.key ? "bg-neutralPrimary-100" : ""
                  } ${s.value === 0 ? "opacity-50" : ""}`}
                >
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="text-neutralPrimary-600 flex-1 truncate">{s.label}</span>
                  <span className="font-semibold text-neutralPrimary-800 tabular-nums">
                    {fmtNumber(s.value)}
                  </span>
                  <span className="w-11 text-right text-xs text-neutralPrimary-400 tabular-nums">
                    {pct.toFixed(0)}%
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </DashboardCard>
  );
}
