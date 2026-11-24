"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { fmtNumber } from "@/modules/dashboard/constants/dashboard.constants";
import { IDashboardOverview } from "@/modules/dashboard/types/dashboard.types";
import { AlertOctagon, AlertTriangle, Boxes, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";
import DashboardCard from "./DashboardCard";
import ProductThumb from "./ProductThumb";

export default function LowStock({ data }: { data?: IDashboardOverview }) {
  const inv = data?.inventory;
  const healthy = inv ? Math.max(0, inv.activeProducts - inv.outOfStock - inv.lowStock) : 0;

  return (
    <DashboardCard
      title="Inventory health"
      subtitle={inv ? `${fmtNumber(inv.activeProducts)} live of ${fmtNumber(inv.totalProducts)} products` : "Live products"}
      icon={<Boxes className="h-4 w-4" />}
      className="h-full"
      action={
        <Link
          href="/products"
          className="text-xs font-medium text-greenPrimary-600 hover:text-greenPrimary-700 inline-flex items-center gap-0.5"
        >
          Products <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      {!inv ? (
        <Skeleton className="h-72 w-full rounded-xl" />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-green-50 p-2.5 text-center">
              <p className="text-lg font-bold text-green-700">{fmtNumber(healthy)}</p>
              <p className="text-[11px] text-green-700/80">In stock</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-2.5 text-center">
              <p className="text-lg font-bold text-amber-700">{fmtNumber(inv.lowStock)}</p>
              <p className="text-[11px] text-amber-700/80">Low (≤{inv.lowStockThreshold})</p>
            </div>
            <div className="rounded-xl bg-red-50 p-2.5 text-center">
              <p className="text-lg font-bold text-red-700">{fmtNumber(inv.outOfStock)}</p>
              <p className="text-[11px] text-red-700/80">Out of stock</p>
            </div>
          </div>

          {inv.alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <p className="text-sm text-neutralPrimary-500">Every live product is well stocked.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {inv.alerts.map((p) => {
                const out = p.quantity <= 0;
                return (
                  <li key={p.id}>
                    <Link
                      href={`/products/edit/${encodeURIComponent(p.slug)}`}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-neutralPrimary-50 transition-colors"
                    >
                      <ProductThumb src={p.image} alt={p.name} size={36} />
                      <span className="flex-1 min-w-0 text-sm text-neutralPrimary-700 line-clamp-1" title={p.name}>
                        {p.name}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 whitespace-nowrap ${
                          out ? "bg-red-50 text-red-700 ring-red-200" : "bg-amber-50 text-amber-700 ring-amber-200"
                        }`}
                      >
                        {out ? <AlertOctagon className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                        {out ? "Out" : `${p.quantity} left`}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </DashboardCard>
  );
}
