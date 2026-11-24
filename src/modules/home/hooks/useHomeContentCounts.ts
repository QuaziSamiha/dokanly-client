"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios/axiosInstance";
import { IPaginationMeta } from "@/types";
import { HOME_CONTENT_SECTIONS } from "@/modules/home/constants/home-admin.constants";
import { IHomeContent } from "@/modules/home/types/home-content.types";

export interface IHomeContentCount {
  total: number;
  active: number;
}

type CountMap = Partial<Record<IHomeContent["type"], IHomeContentCount>>;

const HOME_CONTENT_COUNTS_KEY = ["homeContentCounts"];

//* limit=1 KEEPS EACH CALL TINY — ONLY meta.totalItems IS READ.
const countOf = async (type: string, status?: "ACTIVE") => {
  const response = (await axiosInstance.get(
    `/home-content/all-home-content/${type}`,
    { params: { page: 1, limit: 1, status } },
  )) as unknown as { meta?: IPaginationMeta };
  return response?.meta?.totalItems ?? 0;
};

/**
 * Total and ACTIVE item counts for every home content section, for the tab
 * badges. A failed count only hides that badge; it never blocks the page.
 */
export function useHomeContentCounts() {
  const queryClient = useQueryClient();

  const query = useQuery<CountMap>({
    queryKey: HOME_CONTENT_COUNTS_KEY,
    queryFn: async () => {
      const entries = await Promise.all(
        HOME_CONTENT_SECTIONS.map(async ({ type }) => {
          try {
            const [total, active] = await Promise.all([
              countOf(type),
              countOf(type, "ACTIVE"),
            ]);
            return [type, { total, active }] as const;
          } catch {
            return [type, undefined] as const;
          }
        }),
      );
      return Object.fromEntries(entries) as CountMap;
    },
    staleTime: 30_000,
  });

  //* THE TAB PANELS REFRESH THEMSELVES WITH LOCAL refetch() CALLS, NOT A SHARED
  //* QUERY KEY, SO LISTEN FOR ANY SUCCESSFUL MUTATION (ADD, EDIT, DELETE) AND
  //* RE-COUNT. THE HOOK ONLY LIVES ON THE HOME CONTENT PAGE.
  useEffect(() => {
    const unsubscribe = queryClient.getMutationCache().subscribe((event) => {
      if (event.type === "updated" && event.action.type === "success") {
        queryClient.invalidateQueries({ queryKey: HOME_CONTENT_COUNTS_KEY });
      }
    });
    return unsubscribe;
  }, [queryClient]);

  return { counts: query.data ?? {}, isCountsLoading: query.isLoading };
}
