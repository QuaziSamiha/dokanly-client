"use client";

import { CAREER_API } from "@/constants/api";
import { useDelete } from "@/hooks/api/useDelete";
import { useGetAll } from "@/hooks/api/useGet";
import { usePatch } from "@/hooks/api/usePatch";
import { usePost } from "@/hooks/api/usePost";
import { ResponseSuccessType, IPaginationMeta } from "@/types";
import { IAdminCareer } from "../types/career.types";

export interface ICareerListParams {
  page: number;
  limit: number;
  search?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Paginated job list for the admin table.
 */
export function useCareerList({
  page,
  limit,
  search,
  sortOrder,
}: ICareerListParams) {
  const queryParams = {
    page,
    limit,
    search: search || undefined,
    sortOrder: sortOrder || undefined,
  };

  const { data, isLoading, refetch } = useGetAll<{
    data: IAdminCareer[];
    meta: IPaginationMeta;
  }>(
    CAREER_API.paths.ALL,
    [
      ...CAREER_API.keys.ALL,
      String(page),
      String(limit),
      search ?? "",
      sortOrder ?? "",
    ],
    queryParams,
  );

  return {
    careers: data?.data ?? [],
    meta: data?.meta,
    isCareerLoading: isLoading,
    refetchCareer: refetch,
  };
}

export function useCreateCareer(onSuccess?: () => void) {
  const { mutate, isPending } = usePost(
    CAREER_API.paths.CREATE,
    (data: ResponseSuccessType) => {
      if (data.statusCode >= 200 && data.statusCode < 300) {
        onSuccess?.();
      }
    },
  );

  return { createCareer: mutate, isCreating: isPending };
}

export function useUpdateCareer(onSuccess?: () => void) {
  const { mutate, isPending } = usePatch(
    (data) => {
      if (data.statusCode >= 200 && data.statusCode < 300) {
        onSuccess?.();
      }
    },
    (error) => {
      console.error("Update failed:", error);
    },
  );

  const updateCareer = (id: number, payload: Record<string, unknown>) =>
    mutate({ endpoint: CAREER_API.paths.UPDATE_BY_ID(id), data: payload });

  return { updateCareer, isUpdating: isPending };
}

/** Deleting a job also removes every application filed against it. */
export function useDeleteCareer() {
  const { mutate, isPending } = useDelete(CAREER_API.rootKeys.ALL);

  const deleteCareer = (id: number, onSuccess?: () => void) =>
    mutate(CAREER_API.paths.DELETE_BY_ID(id), { onSuccess });

  return { deleteCareer, isDeletingCareer: isPending };
}
