"use client";

import { useGet } from "@/hooks/api/useGet";
import {
  DashboardPeriod,
  IDashboardOverview,
} from "@/modules/dashboard/types/dashboard.types";
import { keepPreviousData } from "@tanstack/react-query";

const REFRESH_MS = 60_000;

export function useDashboard(period: DashboardPeriod = "month") {
  const { data, isLoading, isFetching, refetch, dataUpdatedAt } =
    useGet<IDashboardOverview>(
      `/dashboard/overview`,
      [`getDashboardOverview`, period],
      { period },
      true,
      {
        //* keep the old period on screen while the new one loads
        placeholderData: keepPreviousData,
        refetchInterval: REFRESH_MS,
        refetchOnWindowFocus: true,
      },
    );

  return {
    overview: data,
    isDashboardLoading: isLoading,
    isDashboardFetching: isFetching,
    refetchDashboard: refetch,
    dataUpdatedAt,
  };
}
