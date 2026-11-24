"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  fmtNumber,
  STATUS_META,
} from "@/modules/dashboard/constants/dashboard.constants";
import {
  IDashboardOverview,
  OrderStatusKey,
} from "@/modules/dashboard/types/dashboard.types";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Cog,
  Truck,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import DashboardCard from "./DashboardCard";

const STAGES: { key: OrderStatusKey; Icon: React.ElementType; hint: string }[] = [
  { key: "PENDING", Icon: Clock, hint: "Needs confirmation" },
  { key: "CONFIRMED", Icon: ClipboardCheck, hint: "Ready to pack" },
  { key: "PROCESSING", Icon: Cog, hint: "Being packed" },
  { key: "SHIPPED", Icon: Truck, hint: "With courier" },
  { key: "DELIVERED", Icon: CheckCircle2, hint: "Completed" },
];

export default function OrderPipeline({ data }: { data?: IDashboardOverview }) {
  const p = data?.pipeline;
  const inFlight = p ? p.PENDING + p.CONFIRMED + p.PROCESSING + p.SHIPPED : 0;
  const all = p
    ? STAGES.reduce((a, s) => a + p[s.key], 0) + p.CANCELLED + p.REFUNDED
    : 0;

  return (
    <DashboardCard
      title="Fulfilment pipeline"
      subtitle={
        p ? (
          <>
            Live, all orders · <span className="font-medium text-neutralPrimary-700">{fmtNumber(inFlight)}</span> in progress
          </>
        ) : (
          "Live, all orders"
        )
      }
      icon={<Workflow className="h-4 w-4" />}
      action={
        <Link
          href="/order-list"
          className="text-xs font-medium text-greenPrimary-600 hover:text-greenPrimary-700 inline-flex items-center gap-0.5"
        >
          Manage orders <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      {!p ? (
        <Skeleton className="h-36 w-full rounded-xl" />
      ) : (
        <div className="flex flex-col gap-4">
          {p.stalePending > 0 && (
            <Link
              href="/order-list"
              className="flex items-center gap-3 rounded-xl bg-amber-50 ring-1 ring-amber-200 px-4 py-2.5 text-sm text-amber-800 hover:bg-amber-100 transition-colors"
            >
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
              <span>
                <strong>{fmtNumber(p.stalePending)}</strong> pending{" "}
                {p.stalePending === 1 ? "order has" : "orders have"} waited more than 24 hours for confirmation.
              </span>
              <ChevronRight className="h-4 w-4 ml-auto shrink-0" />
            </Link>
          )}

          <ol className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {STAGES.map(({ key, Icon, hint }, i) => {
              const meta = STATUS_META[key];
              const count = p[key];
              const share = all ? (count / all) * 100 : 0;
              return (
                <li
                  key={key}
                  className={`relative rounded-xl bg-neutralPrimary-50 ring-1 ring-black/[0.03] p-3.5 overflow-hidden ${
                    i === STAGES.length - 1 ? "col-span-2 sm:col-span-1" : ""
                  }`}
                >
                  <span className="absolute inset-x-0 top-0 h-1" style={{ background: meta.color }} />
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-white"
                      style={{ background: meta.color }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-[11px] text-neutralPrimary-400 tabular-nums">
                      {share.toFixed(0)}%
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-bold text-neutralPrimary-800">{fmtNumber(count)}</p>
                  <p className="text-sm font-medium text-neutralPrimary-700">{meta.label}</p>
                  <p className="text-[11px] text-neutralPrimary-400">{hint}</p>
                  {i < STAGES.length - 1 && (
                    <ChevronRight className="hidden lg:block absolute -right-0.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutralPrimary-300" />
                  )}
                </li>
              );
            })}
          </ol>

          {/* whole-book proportion bar, 2px surface gaps between segments */}
          {all > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex h-2.5 w-full gap-[2px] overflow-hidden rounded-full">
                {[...STAGES.map((s) => s.key), "REFUNDED" as const, "CANCELLED" as const].map((k) =>
                  p[k] > 0 ? (
                    <div
                      key={k}
                      title={`${STATUS_META[k].label}: ${p[k]}`}
                      className="h-full first:rounded-l-full last:rounded-r-full"
                      style={{ width: `${(p[k] / all) * 100}%`, background: STATUS_META[k].color }}
                    />
                  ) : null,
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutralPrimary-500">
                <span>
                  Total <strong className="text-neutralPrimary-700">{fmtNumber(all)}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: STATUS_META.CANCELLED.color }} />
                  Cancelled <strong className="text-neutralPrimary-700">{fmtNumber(p.CANCELLED)}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: STATUS_META.REFUNDED.color }} />
                  Refunded <strong className="text-neutralPrimary-700">{fmtNumber(p.REFUNDED)}</strong>
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardCard>
  );
}
