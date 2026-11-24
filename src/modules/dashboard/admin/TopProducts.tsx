"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  BRAND,
  fmtNumber,
  fmtTaka,
} from "@/modules/dashboard/constants/dashboard.constants";
import { IDashboardOverview } from "@/modules/dashboard/types/dashboard.types";
import { Trophy } from "lucide-react";
import React from "react";
import DashboardCard, { EmptyState } from "./DashboardCard";
import ProductThumb from "./ProductThumb";

const MEDALS = ["bg-amber-400 text-white", "bg-slate-300 text-slate-700", "bg-orange-300 text-orange-900"];

export default function TopProducts({ data }: { data?: IDashboardOverview }) {
  const products = data?.topProducts ?? [];
  const max = Math.max(1, ...products.map((p) => p.revenue));

  return (
    <DashboardCard
      title="Top selling products"
      subtitle="Ranked by revenue this period"
      icon={<Trophy className="h-4 w-4" />}
      className="h-full"
    >
      {!data ? (
        <Skeleton className="h-72 w-full rounded-xl" />
      ) : products.length === 0 ? (
        <div className="h-60">
          <EmptyState>No products sold in this period.</EmptyState>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-neutralPrimary-100">
          {products.map((p, i) => (
            <li key={p.productId ?? p.productName} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span
                className={`h-6 w-6 shrink-0 rounded-full text-[11px] font-bold flex items-center justify-center ${
                  MEDALS[i] ?? "bg-neutralPrimary-100 text-neutralPrimary-500"
                }`}
              >
                {i + 1}
              </span>
              <ProductThumb src={p.image} alt={p.productName} size={44} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutralPrimary-700 line-clamp-1" title={p.productName}>
                  {p.productName}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-neutralPrimary-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(p.revenue / max) * 100}%`, background: BRAND[500] }}
                    />
                  </div>
                  <span className="text-[11px] text-neutralPrimary-400 tabular-nums w-10 text-right">
                    {p.share.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-neutralPrimary-800 tabular-nums">{fmtTaka(p.revenue)}</p>
                <p className="text-[11px] text-neutralPrimary-400">{fmtNumber(p.units)} sold</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
