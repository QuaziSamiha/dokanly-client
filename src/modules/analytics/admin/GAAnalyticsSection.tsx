"use client";

import { useGAAnalytics } from "@/modules/analytics/hooks/useGAAnalytics";
import GACityTable from "./GACityTable";
import GAStatCards from "./GAStatCards";
import GATrafficSourcesChart from "./GATrafficSourcesChart";
import GAUsersChart from "./GAUsersChart";

export default function GAAnalyticsSection() {
  const { summary, dailyData, trafficSources, cities, isLoading, isError } =
    useGAAnalytics();

  if (isError) {
    return (
      <section className="rounded-lg shadow-dashboardCard bg-white p-4 lg:p-6 text-center">
        <p className="text-sm text-neutralPrimary-500">
          Google Analytics data unavailable. Check your service account credentials.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutralPrimary-800">
            Google Analytics
          </h2>
          <p className="text-xs text-neutralPrimary-500">
            Last 28 days · Data updates every hour
          </p>
        </div>
      </div>

      <GAStatCards summary={summary} isLoading={isLoading} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <GAUsersChart data={dailyData} isLoading={isLoading} />
        </div>
        <GATrafficSourcesChart data={trafficSources} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <GACityTable data={cities} isLoading={isLoading} />
      </div>
    </section>
  );
}
