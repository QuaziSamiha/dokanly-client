"use client";

import GACityTable from "@/modules/analytics/admin/GACityTable";
import GAStatCards from "@/modules/analytics/admin/GAStatCards";
import GATrafficSourcesChart from "@/modules/analytics/admin/GATrafficSourcesChart";
import GAUsersChart from "@/modules/analytics/admin/GAUsersChart";
import { useGAAnalytics } from "@/modules/analytics/hooks/useGAAnalytics";
import { SiGoogleanalytics } from "react-icons/si";

export default function AnalyticsPage({ propertyId }: { propertyId?: string }) {
  const { summary, dailyData, trafficSources, cities, isLoading, isError } =
    useGAAnalytics();

  return (
    <section className="flex flex-col gap-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg bg-greenPrimary-50 text-greenPrimary-600 flex items-center justify-center">
            <SiGoogleanalytics size={20} />
          </span>
          <div>
            <h1 className="text-xl font-bold text-neutralPrimary-800">
              Google Analytics
            </h1>
            <p className="text-xs text-neutralPrimary-500">
              Last 28 days · updates every hour
            </p>
          </div>
        </div>
        <span className="text-xs bg-greenPrimary-50 text-greenPrimary-700 border border-greenPrimary-200 px-3 py-1.5 rounded-full font-medium">
          GA4 · Property {propertyId}
        </span>
      </div>

      {isError ? (
        <div className="rounded-lg shadow-dashboardCard bg-white p-8 text-center flex flex-col items-center gap-3">
          <SiGoogleanalytics size={32} className="text-neutralPrimary-300" />
          <p className="text-sm font-medium text-neutralPrimary-700">
            Google Analytics data unavailable
          </p>
          <p className="text-xs text-neutralPrimary-500">
            Check that GA_PROPERTY_ID, GOOGLE_CLIENT_EMAIL, and
            GOOGLE_PRIVATE_KEY are set correctly, and that the service account
            has Viewer access to the GA4 property.
          </p>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <GAStatCards summary={summary} isLoading={isLoading} />

          {/* Users & Sessions Chart — full width */}
          <GAUsersChart data={dailyData} isLoading={isLoading} />

          {/* Traffic Sources + Cities side by side */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <GATrafficSourcesChart
              data={trafficSources}
              isLoading={isLoading}
            />
            <GACityTable data={cities} isLoading={isLoading} />
          </div>
        </>
      )}
    </section>
  );
}
