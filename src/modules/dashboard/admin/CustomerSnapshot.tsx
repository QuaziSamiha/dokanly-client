"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  BRAND,
  fmtNumber,
  fmtPct,
  fmtTaka,
} from "@/modules/dashboard/constants/dashboard.constants";
import { IDashboardOverview } from "@/modules/dashboard/types/dashboard.types";
import { Users } from "lucide-react";
import React from "react";
import DashboardCard from "./DashboardCard";

//* Progress ring: brand fill on a lighter step of the same ramp.
function Ring({ pct, size = 112 }: { pct: number; size?: number }) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={BRAND[50]} strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={BRAND[500]}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${(Math.min(100, pct) / 100) * c} ${c}`}
        className="transition-all duration-700"
      />
    </svg>
  );
}

export default function CustomerSnapshot({ data }: { data?: IDashboardOverview }) {
  const c = data?.customers;

  return (
    <DashboardCard
      title="Customers & lifetime"
      subtitle="Loyalty and all-time totals"
      icon={<Users className="h-4 w-4" />}
      className="h-full"
    >
      {!c || !data ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <Ring pct={c.repeatRate} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-neutralPrimary-800">{fmtPct(c.repeatRate, 0)}</span>
                <span className="text-[10px] text-neutralPrimary-400">repeat</span>
              </div>
            </div>
            <div className="text-sm text-neutralPrimary-600 flex flex-col gap-1">
              <p>
                <strong className="text-neutralPrimary-800">{fmtNumber(c.repeatBuyers)}</strong> of{" "}
                <strong className="text-neutralPrimary-800">{fmtNumber(c.buyers)}</strong> buyers came back for a
                second order.
              </p>
              <p className="text-xs text-neutralPrimary-400">Buyers are counted by phone, so guest checkouts are included.</p>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-3">
            {[
              { label: "Registered customers", value: fmtNumber(c.totalCustomers) },
              { label: "New this period", value: fmtNumber(data.kpis.newCustomers.value) },
              { label: "Lifetime net sales", value: fmtTaka(data.lifetime.lifetimeSales, { compact: true }) },
              { label: "Lifetime orders", value: fmtNumber(data.lifetime.totalOrders) },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-neutralPrimary-50 ring-1 ring-black/[0.03] p-3">
                <dt className="text-[11px] text-neutralPrimary-500">{s.label}</dt>
                <dd className="text-lg font-bold text-neutralPrimary-800 mt-0.5">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </DashboardCard>
  );
}
