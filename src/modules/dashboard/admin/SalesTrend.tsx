"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  BRAND,
  fmtCompact,
  fmtNumber,
  fmtTaka,
  PREV_LABEL,
} from "@/modules/dashboard/constants/dashboard.constants";
import { IDashboardOverview } from "@/modules/dashboard/types/dashboard.types";
import { LineChart } from "lucide-react";
import React, { useState } from "react";
import TrendChart from "./charts/TrendChart";
import DashboardCard, { EmptyState, Segmented } from "./DashboardCard";
import Delta from "./Delta";

type Metric = "revenue" | "orders";

export default function SalesTrend({ data }: { data?: IDashboardOverview }) {
  const [metric, setMetric] = useState<Metric>("revenue");

  const isRevenue = metric === "revenue";
  const kpi = data ? (isRevenue ? data.kpis.netSales : data.kpis.orders) : null;
  const points =
    data?.series.map((p) => ({
      label: p.label,
      value: isRevenue ? p.revenue : p.orders,
      prev: isRevenue ? p.prevRevenue : p.prevOrders,
    })) ?? [];
  const hasData = points.some((p) => p.value > 0 || p.prev > 0);
  const best = points.reduce<(typeof points)[number] | null>(
    (b, p) => (p.value > (b?.value ?? 0) ? p : b),
    null,
  );
  const fmt = (n: number) => (isRevenue ? fmtTaka(n) : fmtNumber(n));

  return (
    <DashboardCard
      title="Sales trend"
      subtitle="Current period against the previous one, same time scale"
      icon={<LineChart className="h-4 w-4" />}
      action={
        <Segmented
          value={metric}
          onChange={setMetric}
          options={[
            { value: "revenue", label: "Revenue" },
            { value: "orders", label: "Orders" },
          ]}
        />
      }
    >
      {!data ? (
        <Skeleton className="h-[340px] w-full rounded-xl" />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-3xl font-bold text-neutralPrimary-800">
                {fmt(kpi?.value ?? 0)}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <Delta change={kpi?.change ?? null} vs={PREV_LABEL[data.period]} />
                {best && best.value > 0 && (
                  <span className="text-xs text-neutralPrimary-400">
                    Best: <span className="text-neutralPrimary-600 font-medium">{best.label}</span> ({fmt(best.value)})
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-neutralPrimary-500">
              <span className="flex items-center gap-1.5">
                <span className="h-[3px] w-4 rounded-full" style={{ background: BRAND[500] }} />
                This period
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-[3px] w-4 rounded-full bg-[#b6bcc6]" />
                Previous
              </span>
            </div>
          </div>

          {hasData ? (
            <TrendChart
              points={points}
              color={BRAND[500]}
              format={fmt}
              formatTick={(n) => (isRevenue ? `৳${fmtCompact(n)}` : fmtCompact(n))}
              currentLabel="This period"
              prevLabel="Previous"
            />
          ) : (
            <div className="h-[280px]">
              <EmptyState>No sales in this period or the one before it yet.</EmptyState>
            </div>
          )}
        </div>
      )}
    </DashboardCard>
  );
}
