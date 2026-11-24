"use client";

import { useDashboard } from "@/modules/dashboard/hooks/useDashboard";
import { DashboardPeriod } from "@/modules/dashboard/types/dashboard.types";
import React, { useState } from "react";
import CategorySales from "./CategorySales";
import CustomerSnapshot from "./CustomerSnapshot";
import DashboardHeader from "./DashboardHeader";
import KpiHero from "./KpiHero";
import LowStock from "./LowStock";
import MetricStrip from "./MetricStrip";
import OrderHeatmap from "./OrderHeatmap";
import OrderPipeline from "./OrderPipeline";
import PaymentMix from "./PaymentMix";
import RecentOrders from "./RecentOrders";
import SalesTrend from "./SalesTrend";
import StatusMix from "./StatusMix";
import TopCities from "./TopCities";
import TopProducts from "./TopProducts";

export default function Dashboard() {
  const [period, setPeriod] = useState<DashboardPeriod>("month");
  const { overview, isDashboardFetching, refetchDashboard, dataUpdatedAt } =
    useDashboard(period);

  //* while a new period loads, the previous one stays visible but dimmed
  const switching = isDashboardFetching && overview && overview.period !== period;

  return (
    <div className="flex flex-col gap-4 sm:gap-6 min-w-0">
      <DashboardHeader
        period={period}
        onPeriodChange={setPeriod}
        isFetching={isDashboardFetching}
        updatedAt={dataUpdatedAt}
        onRefresh={() => refetchDashboard()}
      />

      <div
        className={`flex flex-col gap-4 sm:gap-6 transition-opacity duration-300 ${
          switching ? "opacity-60 pointer-events-none" : ""
        }`}
        aria-busy={!!switching}
      >
        <KpiHero data={overview} />
        <MetricStrip data={overview} />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
          <div className="xl:col-span-8 min-w-0">
            <SalesTrend data={overview} />
          </div>
          <div className="xl:col-span-4 min-w-0">
            <StatusMix data={overview} />
          </div>
        </div>

        <OrderPipeline data={overview} />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          <CategorySales data={overview} />
          <PaymentMix data={overview} />
          <div className="md:col-span-2 xl:col-span-1 min-w-0">
            <TopCities data={overview} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
          <div className="xl:col-span-7 min-w-0">
            <TopProducts data={overview} />
          </div>
          <div className="xl:col-span-5 min-w-0">
            <LowStock data={overview} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
          <div className="xl:col-span-8 min-w-0">
            <OrderHeatmap data={overview} />
          </div>
          <div className="xl:col-span-4 min-w-0">
            <CustomerSnapshot data={overview} />
          </div>
        </div>

        <RecentOrders data={overview} />
      </div>
    </div>
  );
}
