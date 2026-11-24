"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { IGACityRow } from "@/modules/analytics/types/analytics.types";

interface Props {
  data: IGACityRow[];
  isLoading: boolean;
}

export default function GACityTable({ data, isLoading }: Props) {
  const max = Math.max(1, ...data.map((d) => d.users));

  return (
    <section className="rounded-lg shadow-dashboardCard bg-white p-4 lg:p-6 flex flex-col gap-4">
      <header>
        <p className="text-lg font-semibold text-neutralPrimary-800">
          Users by City
        </p>
        <p className="text-xs text-neutralPrimary-500">
          Top 10 cities — last 28 days
        </p>
      </header>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-full" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-sm text-neutralPrimary-500">
          No data available
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {data.map((row, i) => {
            const pct = Math.max(4, (row.users / max) * 100);
            return (
              <div key={row.city} className="flex items-center gap-3">
                <span className="text-xs text-neutralPrimary-400 w-4 shrink-0">
                  {i + 1}
                </span>
                <span className="text-xs text-neutralPrimary-700 w-24 truncate shrink-0">
                  {row.city}
                </span>
                <div className="flex-1 h-4 bg-neutralPrimary-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-greenPrimary-400 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-neutralPrimary-700 w-10 text-right shrink-0">
                  {row.users.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
