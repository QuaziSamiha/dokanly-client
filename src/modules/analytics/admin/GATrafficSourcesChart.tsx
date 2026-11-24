"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { IGATrafficSource } from "@/modules/analytics/types/analytics.types";

interface Props {
  data: IGATrafficSource[];
  isLoading: boolean;
}

const SOURCE_COLORS: Record<string, string> = {
  google: "bg-blue-500",
  facebook: "bg-blue-700",
  fb: "bg-blue-700",
  ig: "bg-pink-500",
  instagram: "bg-pink-500",
  youtube: "bg-red-500",
  "(direct)": "bg-greenPrimary-500",
  direct: "bg-greenPrimary-500",
};

function getBarColor(source: string) {
  return SOURCE_COLORS[source.toLowerCase()] ?? "bg-purple-400";
}

export default function GATrafficSourcesChart({ data, isLoading }: Props) {
  const total = data.reduce((sum, d) => sum + d.sessions, 0);
  const max = Math.max(1, ...data.map((d) => d.sessions));

  return (
    <section className="rounded-lg shadow-dashboardCard bg-white p-4 lg:p-6 flex flex-col gap-4">
      <header>
        <p className="text-lg font-semibold text-neutralPrimary-800">
          Traffic Sources
        </p>
        <p className="text-xs text-neutralPrimary-500">
          Sessions by source — last 28 days
        </p>
      </header>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-full" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-sm text-neutralPrimary-500">
          No data available
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {data.map((item) => {
            const pct = Math.max(2, (item.sessions / max) * 100);
            const share =
              total > 0 ? ((item.sessions / total) * 100).toFixed(1) : "0";
            return (
              <div key={item.source} className="flex items-center gap-3">
                <span className="w-20 text-xs text-neutralPrimary-600 truncate capitalize shrink-0">
                  {item.source === "(direct)" ? "Direct" : item.source}
                </span>
                <div className="flex-1 h-5 bg-neutralPrimary-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getBarColor(item.source)}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-neutralPrimary-500 w-10 text-right shrink-0">
                  {share}%
                </span>
                <span className="text-xs font-medium text-neutralPrimary-700 w-10 text-right shrink-0">
                  {item.sessions.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
