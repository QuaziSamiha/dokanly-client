"use client";

import React from "react";
import { BellRing, CalendarClock, ShoppingBag, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { IOrderStats } from "@/modules/order/types/order.types";
import { formatBDT, formatBDTCompact } from "@/modules/order/utils/order.utils";

function StatTile({
  icon,
  label,
  value,
  hint,
  tone,
  onClick,
  actionLabel,
  title,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint: React.ReactNode;
  tone: string;
  onClick?: () => void;
  actionLabel?: string;
  title?: string;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      title={title}
      className={`group relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-neutralPrimary-200 bg-white p-4 text-left shadow-neutral02 transition-all duration-300 ${
        onClick
          ? "cursor-pointer hover:-translate-y-0.5 hover:border-greenPrimary-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-greenPrimary-500/20 motion-reduce:hover:translate-y-0"
          : "cursor-default"
      }`}
    >
      <span
        className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-60 transition-transform duration-500 group-hover:scale-150 ${tone}`}
      />
      <div className="relative flex items-center gap-2">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone}`}
        >
          {icon}
        </span>
        <span className="truncate text-xs font-semibold uppercase tracking-wide text-neutralPrimary-500">
          {label}
        </span>
      </div>
      <p className="relative mt-3 truncate text-2xl font-bold tabular-nums text-neutralPrimary-800">
        {value}
      </p>
      <p className="relative mt-0.5 truncate text-xs text-neutralPrimary-500">
        {hint}
      </p>
      {actionLabel && (
        <span className="relative mt-2 text-xs font-semibold text-greenPrimary-600 opacity-80 transition-opacity group-hover:opacity-100">
          {actionLabel} →
        </span>
      )}
    </Tag>
  );
}

export default function OrderStatsCards({
  stats,
  isLoading,
  onShowPending,
  onShowUnpaid,
  onShowToday,
}: {
  stats?: IOrderStats;
  isLoading?: boolean;
  onShowPending: () => void;
  onShowUnpaid: () => void;
  onShowToday: () => void;
}) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-neutralPrimary-200 bg-white p-4"
          >
            <Skeleton className="h-8 w-24" />
            <Skeleton className="mt-3 h-7 w-20" />
            <Skeleton className="mt-2 h-4 w-28" />
          </div>
        ))}
      </div>
    );
  }

  const pending = stats.statusCounts.PENDING ?? 0;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile
        icon={<CalendarClock size={16} />}
        label="Today"
        value={stats.todayOrders.toLocaleString()}
        hint={`${formatBDT(stats.todayRevenue)} in sales today`}
        tone="bg-blueSecondary-50 text-blueSecondary-600"
        onClick={stats.todayOrders ? onShowToday : undefined}
        actionLabel={stats.todayOrders ? "View today's orders" : undefined}
      />
      <StatTile
        icon={<BellRing size={16} />}
        label="To confirm"
        value={pending.toLocaleString()}
        hint={pending ? "Pending orders waiting for you" : "All caught up"}
        tone={
          pending
            ? "bg-amber-50 text-amber-700"
            : "bg-emerald-50 text-emerald-700"
        }
        onClick={pending ? onShowPending : undefined}
        actionLabel={pending ? "Review pending" : undefined}
      />
      <StatTile
        icon={<Wallet size={16} />}
        label="Revenue"
        value={formatBDTCompact(stats.revenue)}
        title={formatBDT(stats.revenue)}
        hint={`Avg. order ${formatBDT(stats.averageOrderValue)}`}
        tone="bg-greenPrimary-950 text-greenPrimary-700"
      />
      <StatTile
        icon={<ShoppingBag size={16} />}
        label="Unpaid"
        value={stats.unpaidOrders.toLocaleString()}
        hint={`of ${stats.totalOrders.toLocaleString()} orders · ${stats.guestOrders.toLocaleString()} by guests`}
        tone="bg-orangeSecondary-100 text-orangeSecondary-500"
        onClick={stats.unpaidOrders ? onShowUnpaid : undefined}
        actionLabel={stats.unpaidOrders ? "Show unpaid" : undefined}
      />
    </div>
  );
}
