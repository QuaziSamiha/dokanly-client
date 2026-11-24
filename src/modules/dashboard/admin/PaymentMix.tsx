"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  fmtNumber,
  fmtPct,
  fmtTaka,
  PAYMENT_META,
} from "@/modules/dashboard/constants/dashboard.constants";
import { IDashboardOverview } from "@/modules/dashboard/types/dashboard.types";
import { CreditCard } from "lucide-react";
import React from "react";
import DashboardCard, { EmptyState } from "./DashboardCard";

export default function PaymentMix({ data }: { data?: IDashboardOverview }) {
  const rows = data?.paymentMethods ?? [];
  const totalOrders = rows.reduce((a, r) => a + r.orders, 0);
  const net = data?.kpis.netSales.value ?? 0;
  const collected = data?.kpis.collected.value ?? 0;
  const collectionRate = net ? (collected / net) * 100 : 0;

  return (
    <DashboardCard
      title="Payments"
      subtitle="Method mix and collection this period"
      icon={<CreditCard className="h-4 w-4" />}
      className="h-full"
    >
      {!data ? (
        <Skeleton className="h-60 w-full rounded-xl" />
      ) : totalOrders === 0 ? (
        <div className="h-52">
          <EmptyState>No paid or payable orders in this period.</EmptyState>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex h-4 w-full gap-[2px] overflow-hidden rounded-full">
            {rows.map((r) =>
              r.orders > 0 ? (
                <div
                  key={r.method}
                  title={`${PAYMENT_META[r.method].label}: ${r.orders} orders`}
                  className="h-full first:rounded-l-full last:rounded-r-full"
                  style={{
                    width: `${(r.orders / totalOrders) * 100}%`,
                    background: PAYMENT_META[r.method].color,
                  }}
                />
              ) : null,
            )}
          </div>

          <ul className="flex flex-col gap-3">
            {rows.map((r) => (
              <li key={r.method} className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: PAYMENT_META[r.method].color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutralPrimary-700 truncate">
                    {PAYMENT_META[r.method].label}
                  </p>
                  <p className="text-[11px] text-neutralPrimary-400">
                    {fmtNumber(r.orders)} orders · {fmtPct(totalOrders ? (r.orders / totalOrders) * 100 : 0, 0)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-neutralPrimary-800 tabular-nums">
                  {fmtTaka(r.revenue)}
                </p>
              </li>
            ))}
          </ul>

          {/* collection meter: brand fill on a lighter step of the same ramp */}
          <div className="rounded-xl bg-greenPrimary-950/60 p-3.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutralPrimary-600 font-medium">Collection rate</span>
              <span className="font-bold text-greenPrimary-700">{fmtPct(collectionRate, 0)}</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-greenPrimary-50/70 overflow-hidden">
              <div
                className="h-full rounded-full bg-greenPrimary-500 transition-all duration-700"
                style={{ width: `${Math.min(100, collectionRate)}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-neutralPrimary-500">
              {fmtTaka(collected)} received of {fmtTaka(net)} net sales
            </p>
          </div>
        </div>
      )}
    </DashboardCard>
  );
}
