"use client";

import { useQuery } from "@tanstack/react-query";
import { CAREER_API } from "@/constants/api";
import { useGet } from "@/hooks/api/useGet";
import { axiosInstance } from "@/lib/axios/axiosInstance";
import { IGenericErrorResponse, ResponseSuccessType } from "@/types";
import { ICareer } from "../types/career.types";

/** Active openings whose deadline has not passed — the storefront career list. */
export function usePublicCareers() {
  const { data, isLoading, isError, refetch } = useGet<ICareer[]>(
    CAREER_API.paths.ACTIVE_CURRENT,
    CAREER_API.keys.ACTIVE_CURRENT,
  );

  return {
    jobs: data ?? [],
    isJobsLoading: isLoading,
    isJobsError: isError,
    refetchJobs: refetch,
  };
}

/**
 * One open job by slug. A 404 (closed, inactive or unknown job) is an expected
 * outcome that the page renders itself, so it is not retried or toasted.
 */
export function usePublicCareerDetails(slug?: string) {
  const { data, isLoading, error, refetch } = useQuery<
    ICareer,
    IGenericErrorResponse
  >({
    queryKey: CAREER_API.keys.DETAILS(slug ?? ""),
    queryFn: async () => {
      const response = (await axiosInstance.get(
        CAREER_API.paths.BY_SLUG(slug ?? ""),
      )) as unknown as ResponseSuccessType;
      return response.data as ICareer;
    },
    enabled: Boolean(slug),
    retry: (failureCount, err) => err?.statusCode !== 404 && failureCount < 2,
  });

  return {
    career: data,
    isCareerLoading: isLoading,
    isNotFound: error?.statusCode === 404,
    isCareerError: Boolean(error) && error?.statusCode !== 404,
    refetchCareer: refetch,
  };
}

/**
 * Whether the storefront has at least one open position.
 *
 * Backs the conditional Career link in the navbar: the menu item only appears
 * once there is something to land on. Shares `usePublicCareers`' query key, so
 * the navbar's fetch warms the cache the career page then reads from.
 * Stays `false` while loading, so the link never flashes in and back out.
 */
export function useHasOpenCareers() {
  const { jobs, isJobsLoading } = usePublicCareers();

  return { hasOpenCareers: !isJobsLoading && jobs.length > 0 };
}
