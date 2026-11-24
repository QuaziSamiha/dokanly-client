"use client";

import { PERIODS, timeAgo } from "@/modules/dashboard/constants/dashboard.constants";
import { DashboardPeriod } from "@/modules/dashboard/types/dashboard.types";
import { useCurrentUser } from "@/modules/user/hooks/useCurrentUser";
import { RefreshCw } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Segmented } from "./DashboardCard";

interface Props {
  period: DashboardPeriod;
  onPeriodChange: (p: DashboardPeriod) => void;
  isFetching: boolean;
  updatedAt: number;
  onRefresh: () => void;
}

function greeting(hour: number) {
  if (hour < 5) return "Working late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardHeader({
  period,
  onPeriodChange,
  isFetching,
  updatedAt,
  onRefresh,
}: Props) {
  const { currentUserData } = useCurrentUser();
  //* Client-only clock (the server render must not disagree with the browser),
  //* ticking every 30s so "updated x ago" stays honest.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const firstName = currentUserData?.firstName;
  const periodMeta = PERIODS.find((p) => p.value === period);

  return (
    <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-greenPrimary-700 via-greenPrimary-600 to-greenPrimary-400 text-white p-5 sm:p-6">
      {/* soft decorative glow */}
      <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-greenPrimary-100/25 blur-3xl" />
      <div className="pointer-events-none absolute right-40 -bottom-24 h-48 w-48 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div>
          <p className="text-sm text-white/70">
            {now?.toLocaleDateString("en-US", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }) ?? " "}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">
            {now ? greeting(now.getHours()) : "Welcome back"}
            {firstName ? `, ${firstName}` : ""} 👋
          </h1>
          <p className="text-sm text-white/80 mt-1">
            Here&apos;s how Natura Care is doing ·{" "}
            <span className="font-medium text-white">{periodMeta?.long}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-white/80">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-greenPrimary-100 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-greenPrimary-100" />
            </span>
            Live · updated {now && updatedAt ? timeAgo(updatedAt) : "—"}
            <button
              onClick={onRefresh}
              aria-label="Refresh dashboard"
              className="ml-1 h-8 w-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            </button>
          </div>
          <div className="[&_[role=tablist]]:bg-white/15 [&_[role=tab]]:text-white/85 [&_[role=tab][aria-selected=true]]:text-greenPrimary-700 [&_[role=tab]:hover]:text-white [&_[role=tab][aria-selected=true]:hover]:text-greenPrimary-700">
            <Segmented
              size="md"
              value={period}
              onChange={onPeriodChange}
              options={PERIODS.map((p) => ({ value: p.value, label: p.label }))}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
