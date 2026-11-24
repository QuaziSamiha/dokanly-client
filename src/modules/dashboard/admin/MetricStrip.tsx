"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  fmtHours,
  fmtNumber,
  fmtPct,
  fmtTaka,
} from "@/modules/dashboard/constants/dashboard.constants";
import { IDashboardOverview, IKpi } from "@/modules/dashboard/types/dashboard.types";
import {
  BadgePercent,
  CircleDollarSign,
  Clock4,
  HandCoins,
  Package,
  Repeat,
  TrendingUp,
  XCircle,
} from "lucide-react";
import React from "react";
import Delta from "./Delta";

interface Props {
  data?: IDashboardOverview;
}

interface Metric {
  label: string;
  value: string;
  note: React.ReactNode;
  Icon: React.ElementType;
  chip: string;
  kpi?: IKpi;
  goodWhenUp?: boolean;
  unit?: "%" | "pp";
}

export default function MetricStrip({ data }: Props) {
  if (!data) {
    return (
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </section>
    );
  }

  const { kpis, customers } = data;
  const net = kpis.netSales.value ?? 0;
  const collectedShare = net ? ((kpis.collected.value ?? 0) / net) * 100 : null;

  const metrics: Metric[] = [
    {
      label: "Collected",
      value: fmtTaka(kpis.collected.value),
      note: collectedShare === null ? "Payment received" : `${fmtPct(collectedShare, 0)} of net sales paid`,
      Icon: CircleDollarSign,
      chip: "bg-emerald-50 text-emerald-600",
      kpi: kpis.collected,
    },
    {
      label: "Awaiting payment",
      value: fmtTaka(kpis.outstanding.value),
      note: "Mostly cash on delivery",
      Icon: HandCoins,
      chip: "bg-amber-50 text-amber-600",
      kpi: kpis.outstanding,
      goodWhenUp: false,
    },
    {
      label: "Est. gross margin",
      value: kpis.grossMargin.value === null ? "—" : fmtPct(kpis.grossMargin.value),
      note:
        kpis.grossProfit.value === null
          ? "Add cost prices to products"
          : `${fmtTaka(kpis.grossProfit.value)} profit · ${kpis.marginCoverage}% costed`,
      Icon: TrendingUp,
      chip: "bg-lime-50 text-lime-700",
      kpi: kpis.grossMargin,
      unit: "pp",
    },
    {
      label: "Items sold",
      value: fmtNumber(kpis.itemsSold.value),
      note: kpis.orders.value
        ? `${((kpis.itemsSold.value ?? 0) / kpis.orders.value).toFixed(1)} per order`
        : "Units across all orders",
      Icon: Package,
      chip: "bg-blue-50 text-blue-600",
      kpi: kpis.itemsSold,
    },
    {
      label: "Cancellation rate",
      value: fmtPct(kpis.cancellationRate.value),
      note: "Cancelled + refunded",
      Icon: XCircle,
      chip: "bg-red-50 text-red-600",
      kpi: kpis.cancellationRate,
      goodWhenUp: false,
      unit: "pp",
    },
    {
      label: "Avg. delivery time",
      value: fmtHours(kpis.avgDeliveryHours.value),
      note: "Order placed → delivered",
      Icon: Clock4,
      chip: "bg-sky-50 text-sky-600",
      kpi: kpis.avgDeliveryHours,
      goodWhenUp: false,
    },
    {
      label: "Repeat customers",
      value: fmtPct(customers.repeatRate),
      note: `${fmtNumber(customers.repeatBuyers)} of ${fmtNumber(customers.buyers)} buyers · all time`,
      Icon: Repeat,
      chip: "bg-violet-50 text-violet-600",
    },
    {
      label: "Discounts given",
      value: fmtTaka(kpis.discounts.value),
      note: net ? `${fmtPct(((kpis.discounts.value ?? 0) / (net + (kpis.discounts.value ?? 0))) * 100)} of gross` : "Promotions & coupons",
      Icon: BadgePercent,
      chip: "bg-pink-50 text-pink-600",
      kpi: kpis.discounts,
      goodWhenUp: false,
    },
  ];

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {metrics.map((m) => (
        <article
          key={m.label}
          className="rounded-2xl bg-white ring-1 ring-black/[0.04] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-3.5 sm:p-4 flex flex-col gap-2 min-w-0 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center ${m.chip}`}>
              <m.Icon className="h-4 w-4" />
            </span>
            <p className="text-xs sm:text-sm text-neutralPrimary-500 font-medium truncate">
              {m.label}
            </p>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
            <p className="text-xl sm:text-2xl font-bold text-neutralPrimary-800 truncate">
              {m.value}
            </p>
            {m.kpi && (
              <Delta change={m.kpi.change} goodWhenUp={m.goodWhenUp} unit={m.unit} />
            )}
          </div>
          <p className="text-[11px] text-neutralPrimary-400 truncate" title={typeof m.note === "string" ? m.note : undefined}>
            {m.note}
          </p>
        </article>
      ))}
    </section>
  );
}
