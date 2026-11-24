"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { IGADailyPoint } from "@/modules/analytics/types/analytics.types";
import React, { useState } from "react";

interface Props {
  data: IGADailyPoint[];
  isLoading: boolean;
}

type Metric = "newUsers" | "sessions";

export default function GAUsersChart({ data, isLoading }: Props) {
  const [metric, setMetric] = useState<Metric>("newUsers");

  const values = data.map((d) => d[metric]);
  const max = Math.max(1, ...values);

  const last7 = data.slice(-7);
  const prev7 = data.slice(-14, -7);
  const lastSum = last7.reduce((a, d) => a + d[metric], 0);
  const prevSum = prev7.reduce((a, d) => a + d[metric], 0);
  const trend =
    prevSum === 0 ? null : (((lastSum - prevSum) / prevSum) * 100).toFixed(1);

  return (
    <section className="rounded-lg shadow-dashboardCard bg-white p-4 lg:p-6 flex flex-col gap-4">
      <header className="flex items-start justify-between gap-2">
        <div>
          <p className="text-lg font-semibold text-neutralPrimary-800">
            Users & Sessions
          </p>
          <p className="text-xs text-neutralPrimary-500 flex items-center gap-1">
            Last 28 days
            {trend !== null && (
              <span
                className={`font-medium ${
                  Number(trend) >= 0 ? "text-greenPrimary-600" : "text-red-500"
                }`}
              >
                {Number(trend) >= 0 ? "▲" : "▼"} {Math.abs(Number(trend))}% vs prev week
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-neutralPrimary-100 rounded-md p-1">
          {(["newUsers", "sessions"] as Metric[]).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`text-xs px-2.5 py-1 rounded transition-colors cursor-pointer ${
                metric === m
                  ? "bg-greenPrimary-500 text-white font-medium"
                  : "text-neutralPrimary-600 hover:text-neutralPrimary-800"
              }`}
            >
              {m === "newUsers" ? "Users" : "Sessions"}
            </button>
          ))}
        </div>
      </header>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-sm text-neutralPrimary-500">
          No data available
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="h-48 flex items-end gap-1 px-1">
            {data.map((point) => {
              const heightPct = Math.max(2, (point[metric] / max) * 100);
              return (
                <div
                  key={point.label}
                  className="flex-1 h-full flex items-end relative group min-w-[6px]"
                >
                  <div
                    className="w-full bg-greenPrimary-400 rounded-t transition-all hover:bg-greenPrimary-600"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-neutralPrimary-800 text-white text-[11px] rounded px-2 py-1 whitespace-nowrap z-10 pointer-events-none">
                    {point[metric].toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-1 px-1 mt-2">
            {data.map((point, i) => (
              <span
                key={point.label}
                className={`flex-1 text-[10px] text-neutralPrimary-400 truncate text-center min-w-[6px] ${
                  i % 4 !== 0 ? "opacity-0" : ""
                }`}
              >
                {point.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
