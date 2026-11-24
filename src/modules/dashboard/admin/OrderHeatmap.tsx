"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { IDashboardOverview } from "@/modules/dashboard/types/dashboard.types";
import { CalendarClock } from "lucide-react";
import React, { useState } from "react";
import DashboardCard, { EmptyState } from "./DashboardCard";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
//* Saturday-first, matching the Bangladesh working week
const ROW_ORDER = [6, 0, 1, 2, 3, 4, 5];
//* one-hue brand ramp, light -> dark; index 0 = no orders
const RAMP = ["#f3f4f6", "#e6efc8", "#c7da85", "#96b435", "#677c22", "#3c4a10"];

const hourLabel = (h: number) => `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? "am" : "pm"}`;

export default function OrderHeatmap({ data }: { data?: IDashboardOverview }) {
  const [hover, setHover] = useState<{ d: number; h: number } | null>(null);
  const hm = data?.heatmap;

  const step = (v: number) => {
    if (!hm || v <= 0 || hm.max <= 0) return 0;
    return Math.min(RAMP.length - 1, Math.ceil((v / hm.max) * (RAMP.length - 1)));
  };

  let peak: { d: number; h: number; v: number } | null = null;
  const dayTotals = hm?.cells.map((row) => row.reduce((a, b) => a + b, 0)) ?? [];
  hm?.cells.forEach((row, d) =>
    row.forEach((v, h) => {
      if (v > (peak?.v ?? 0)) peak = { d, h, v };
    }),
  );
  const busiestDay = dayTotals.length
    ? dayTotals.indexOf(Math.max(...dayTotals))
    : -1;
  const total = dayTotals.reduce((a, b) => a + b, 0);
  const p = peak as { d: number; h: number; v: number } | null;

  return (
    <DashboardCard
      title="When customers order"
      subtitle={`Orders by weekday and hour (Dhaka time) · last ${hm?.days ?? 90} days`}
      icon={<CalendarClock className="h-4 w-4" />}
      className="h-full"
    >
      {!hm ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : total === 0 ? (
        <div className="h-56">
          <EmptyState>Not enough orders yet to show a pattern.</EmptyState>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {p && (
              <span className="rounded-full bg-greenPrimary-950 text-greenPrimary-700 text-xs font-medium px-3 py-1">
                Peak hour: {DAYS[p.d]} {hourLabel(p.h)} ({p.v} orders)
              </span>
            )}
            {busiestDay >= 0 && (
              <span className="rounded-full bg-neutralPrimary-100 text-neutralPrimary-600 text-xs font-medium px-3 py-1">
                Busiest day: {DAYS[busiestDay]} ({Math.round((dayTotals[busiestDay] / total) * 100)}% of orders)
              </span>
            )}
          </div>

          <div className="relative overflow-x-auto">
            <div className="min-w-[560px]">
              <div className="grid grid-cols-[36px_repeat(24,minmax(0,1fr))] gap-[3px]">
                {ROW_ORDER.map((d) => (
                  <React.Fragment key={d}>
                    <span className="text-[11px] text-neutralPrimary-400 flex items-center">{DAYS[d]}</span>
                    {hm.cells[d].map((v, h) => (
                      <span
                        key={h}
                        onMouseEnter={() => setHover({ d, h })}
                        onMouseLeave={() => setHover(null)}
                        className={`aspect-square rounded-[4px] transition-transform ${
                          hover?.d === d && hover?.h === h ? "scale-125 ring-2 ring-white shadow-md relative z-10" : ""
                        }`}
                        style={{ background: RAMP[step(v)] }}
                        title={`${DAYS[d]} ${hourLabel(h)}–${hourLabel((h + 1) % 24)}: ${v} orders`}
                      />
                    ))}
                  </React.Fragment>
                ))}
                <span />
                {Array.from({ length: 24 }, (_, h) => (
                  <span key={h} className="text-[10px] text-neutralPrimary-400 text-center">
                    {h % 3 === 0 ? hourLabel(h) : ""}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 text-[11px] text-neutralPrimary-500">
            <span className="h-4">
              {hover
                ? `${DAYS[hover.d]} ${hourLabel(hover.h)}–${hourLabel((hover.h + 1) % 24)} · ${hm.cells[hover.d][hover.h]} orders`
                : `${total.toLocaleString("en-US")} orders analysed`}
            </span>
            <span className="flex items-center gap-1">
              Less
              {RAMP.map((c) => (
                <span key={c} className="h-3 w-3 rounded-[3px]" style={{ background: c }} />
              ))}
              More
            </span>
          </div>
        </div>
      )}
    </DashboardCard>
  );
}
