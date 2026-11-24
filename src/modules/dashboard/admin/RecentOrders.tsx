"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  fmtTaka,
  STATUS_META,
  timeAgo,
} from "@/modules/dashboard/constants/dashboard.constants";
import {
  IDashboardOverview,
  IRecentOrder,
} from "@/modules/dashboard/types/dashboard.types";
import { ChevronRight, ListOrdered } from "lucide-react";
import Link from "next/link";
import React from "react";
import DashboardCard, { EmptyState } from "./DashboardCard";
import ProductThumb from "./ProductThumb";

function StatusBadge({ status }: { status: IRecentOrder["status"] }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 whitespace-nowrap ${meta?.badge ?? ""}`}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta?.color }} />
      {meta?.label ?? status}
    </span>
  );
}

function PaymentTag({ o }: { o: IRecentOrder }) {
  const paid = o.paymentStatus === "COMPLETED";
  return (
    <span className="text-[11px] text-neutralPrimary-500 whitespace-nowrap">
      {o.paymentMethod === "CASH_ON_DELIVERY" ? "COD" : "Online"} ·{" "}
      <span className={paid ? "text-green-700 font-medium" : "text-amber-700 font-medium"}>
        {paid ? "Paid" : o.paymentStatus === "FAILED" ? "Failed" : "Unpaid"}
      </span>
    </span>
  );
}

const fullDate = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export default function RecentOrders({ data }: { data?: IDashboardOverview }) {
  const orders = data?.recentOrders ?? [];

  return (
    <DashboardCard
      title="Recent orders"
      subtitle="Latest activity across the store"
      icon={<ListOrdered className="h-4 w-4" />}
      action={
        <Link
          href="/order-list"
          className="text-xs font-medium text-greenPrimary-600 hover:text-greenPrimary-700 inline-flex items-center gap-0.5"
        >
          View all <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      {!data ? (
        <Skeleton className="h-72 w-full rounded-xl" />
      ) : orders.length === 0 ? (
        <div className="h-40">
          <EmptyState>No orders yet.</EmptyState>
        </div>
      ) : (
        <>
          {/* mobile: stacked cards */}
          <ul className="md:hidden flex flex-col divide-y divide-neutralPrimary-100">
            {orders.map((o) => (
              <li key={o.id} className="py-3 first:pt-0 last:pb-0 flex gap-3">
                <ProductThumb src={o.previewProductImage} alt={o.previewProductName ?? "Product"} size={44} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-neutralPrimary-800 truncate">
                      {o.customerName || "Guest"}
                    </p>
                    <p className="text-sm font-bold text-neutralPrimary-800 tabular-nums">{fmtTaka(o.grandTotal)}</p>
                  </div>
                  <p className="text-xs text-neutralPrimary-500 truncate">
                    {o.orderId ?? `#${o.id}`} · {o.previewProductName ?? "—"}
                    {o.totalItems > 1 ? ` +${o.totalItems - 1}` : ""}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <StatusBadge status={o.status} />
                    <PaymentTag o={o} />
                    <span className="text-[11px] text-neutralPrimary-400 ml-auto">{timeAgo(o.createdAt)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* md+: table */}
          <div className="hidden md:block overflow-x-auto -mx-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-neutralPrimary-400">
                  <th className="font-semibold px-3 pb-2">Order</th>
                  <th className="font-semibold px-3 pb-2">Products</th>
                  <th className="font-semibold px-3 pb-2">Customer</th>
                  <th className="font-semibold px-3 pb-2">Payment</th>
                  <th className="font-semibold px-3 pb-2">Status</th>
                  <th className="font-semibold px-3 pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutralPrimary-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-neutralPrimary-50/80 transition-colors">
                    <td className="px-3 py-3 align-middle">
                      <p className="font-semibold text-neutralPrimary-800 whitespace-nowrap">{o.orderId ?? `#${o.id}`}</p>
                      <p className="text-[11px] text-neutralPrimary-400 whitespace-nowrap" title={fullDate(o.createdAt)}>
                        {timeAgo(o.createdAt)}
                      </p>
                    </td>
                    <td className="px-3 py-3 align-middle">
                      <div className="flex items-center gap-2.5 max-w-xs">
                        <ProductThumb src={o.previewProductImage} alt={o.previewProductName ?? "Product"} size={36} />
                        <div className="min-w-0">
                          <p className="text-neutralPrimary-700 line-clamp-1" title={o.previewProductName ?? undefined}>
                            {o.previewProductName ?? "—"}
                          </p>
                          {o.totalItems > 1 && (
                            <p className="text-[11px] text-neutralPrimary-400">+{o.totalItems - 1} more</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 align-middle">
                      <p className="font-medium text-neutralPrimary-700 whitespace-nowrap">{o.customerName || "Guest"}</p>
                      <p className="text-[11px] text-neutralPrimary-400 whitespace-nowrap">
                        {o.phone} · {o.city}
                      </p>
                    </td>
                    <td className="px-3 py-3 align-middle">
                      <PaymentTag o={o} />
                    </td>
                    <td className="px-3 py-3 align-middle">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-3 py-3 align-middle text-right font-bold text-neutralPrimary-800 tabular-nums whitespace-nowrap">
                      {fmtTaka(o.grandTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </DashboardCard>
  );
}
