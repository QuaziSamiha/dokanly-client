"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  fmtNumber,
  fmtTaka,
  PREV_LABEL,
} from "@/modules/dashboard/constants/dashboard.constants";
import { IDashboardOverview } from "@/modules/dashboard/types/dashboard.types";
import { Banknote, Receipt, ShoppingBag, UserPlus } from "lucide-react";
import React from "react";
import Sparkline from "./charts/Sparkline";
import Delta from "./Delta";

interface Props {
  data?: IDashboardOverview;
}

const CARD_STYLES = [
  "from-greenPrimary-700 to-greenPrimary-400",
  "from-blue-700 to-sky-500",
  "from-orange-600 to-amber-500",
  "from-violet-700 to-fuchsia-500",
];

export default function KpiHero({ data }: Props) {
  if (!data) {
    return (
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {CARD_STYLES.map((s) => (
          <Skeleton key={s} className="h-40 rounded-2xl" />
        ))}
      </section>
    );
  }

  const { kpis, series, period, customers } = data;
  const vs = PREV_LABEL[period];
  const aovSeries = series.map((p) => (p.orders ? p.revenue / p.orders : 0));

  const cards = [
    {
      label: "Net sales",
      hint: "Orders not cancelled or refunded",
      value: fmtTaka(kpis.netSales.value),
      kpi: kpis.netSales,
      Icon: Banknote,
      spark: series.map((p) => p.revenue),
    },
    {
      label: "Orders",
      hint: `${fmtNumber(kpis.itemsSold.value)} items sold`,
      value: fmtNumber(kpis.orders.value),
      kpi: kpis.orders,
      Icon: ShoppingBag,
      spark: series.map((p) => p.orders),
    },
    {
      label: "Avg. order value",
      hint: "Net sales ÷ orders",
      value: fmtTaka(kpis.avgOrderValue.value),
      kpi: kpis.avgOrderValue,
      Icon: Receipt,
      spark: aovSeries,
    },
    {
      label: "New customers",
      hint: `${fmtNumber(customers.totalCustomers)} registered in total`,
      value: fmtNumber(kpis.newCustomers.value),
      kpi: kpis.newCustomers,
      Icon: UserPlus,
      spark: null,
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <article
          key={c.label}
          className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${CARD_STYLES[i]} text-white p-5 shadow-lg shadow-black/5 transition-transform duration-300 hover:-translate-y-0.5`}
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-125" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-white/85">{c.label}</p>
              <p className="text-3xl font-bold mt-1.5 truncate" title={c.value}>
                {c.value}
              </p>
            </div>
            <span className="h-10 w-10 shrink-0 rounded-xl bg-white/20 flex items-center justify-center">
              <c.Icon className="h-5 w-5" />
            </span>
          </div>
          <div className="relative mt-3">
            <Delta change={c.kpi.change} vs={vs} tone="onColor" />
          </div>
          <div className="relative mt-3 flex items-end justify-between gap-3">
            <p className="text-[11px] text-white/75 truncate">{c.hint}</p>
            {c.spark && (
              <Sparkline values={c.spark} color="#ffffff" className="h-9 w-24 shrink-0" />
            )}
          </div>
        </article>
      ))}
    </section>
  );
}
