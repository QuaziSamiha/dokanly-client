"use client";

import { useQueryClient } from "@tanstack/react-query";
import { BLOG_API, BLOG_TYPE_API } from "@/constants/api";
import { useDelete } from "@/hooks/api/useDelete";
import { useGet, useGetAll } from "@/hooks/api/useGet";
import { usePatch } from "@/hooks/api/usePatch";
import { usePost } from "@/hooks/api/usePost";
import { ResponseSuccessType, IPaginationMeta } from "@/types";
import { IBlogType } from "../types/blog.types";

export interface IBlogTypeListParams {
  page: number;
  limit: number;
  search?: string;
  sortOrder?: "asc" | "desc";
}

/** Paginated blog type list for the admin table. */
export function useBlogTypeList({
  page,
  limit,
  search,
  sortOrder,
}: IBlogTypeListParams) {
  const queryParams = {
    page,
    limit,
    search: search || undefined,
    sortOrder: sortOrder || undefined,
  };

  const { data, isLoading, refetch } = useGetAll<{
    data: IBlogType[];
    meta: IPaginationMeta;
  }>(
    BLOG_TYPE_API.paths.ALL,
    [
      ...BLOG_TYPE_API.keys.ALL,
      String(page),
      String(limit),
      search ?? "",
      sortOrder ?? "",
    ],
    queryParams,
  );

  return {
    blogTypes: data?.data ?? [],
    meta: data?.meta,
    isBlogTypeLoading: isLoading,
    refetchBlogType: refetch,
  };
}

/**
 * Active types in curated order. Used by the public listing tabs and by the
 * type selector on the admin blog forms.
 */
export function useActiveBlogTypes() {
  const { data, isLoading } = useGet<IBlogType[]>(
    BLOG_TYPE_API.paths.ACTIVE,
    BLOG_TYPE_API.keys.ACTIVE,
  );

  return { activeBlogTypes: data ?? [], isActiveBlogTypesLoading: isLoading };
}

export function useCreateBlogType(onSuccess?: () => void) {
  const { mutate, isPending } = usePost(
    BLOG_TYPE_API.paths.CREATE,
    (data: ResponseSuccessType) => {
      if (data.statusCode >= 200 && data.statusCode < 300) {
        onSuccess?.();
      }
    },
  );

  return { createBlogType: mutate, isCreatingType: isPending };
}

export function useUpdateBlogType(onSuccess?: () => void) {
  const { mutate, isPending } = usePatch((data) => {
    if (data.statusCode >= 200 && data.statusCode < 300) {
      onSuccess?.();
    }
  });

  const updateBlogType = (id: number, payload: Record<string, unknown>) =>
    mutate({ endpoint: BLOG_TYPE_API.paths.UPDATE_BY_ID(id), data: payload });

  return { updateBlogType, isUpdatingType: isPending };
}

/**
 * Promotes a type to be the default. The API demotes the previous default in
 * the same transaction, so there is always exactly one.
 */
export function useSetDefaultBlogType(onSuccess?: () => void) {
  const { mutate, isPending } = usePatch((data) => {
    if (data.statusCode >= 200 && data.statusCode < 300) {
      onSuccess?.();
    }
  });

  const setDefaultBlogType = (id: number) =>
    mutate({ endpoint: BLOG_TYPE_API.paths.SET_DEFAULT_BY_ID(id), data: {} });

  return { setDefaultBlogType, isSettingDefault: isPending };
}

/**
 * Deleting a type also deletes every post under it (with their comments), so
 * the post list, the stats and the active-type dropdown are refreshed too.
 */
export function useDeleteBlogType() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useDelete(BLOG_TYPE_API.rootKeys.ALL);

  const deleteBlogType = async (id: number) => {
    const result = await mutateAsync(BLOG_TYPE_API.paths.DELETE_BY_ID(id));
    queryClient.invalidateQueries({ queryKey: BLOG_API.keys.ALL });
    queryClient.invalidateQueries({ queryKey: BLOG_API.keys.STATS });
    queryClient.invalidateQueries({ queryKey: BLOG_TYPE_API.keys.ACTIVE });
    return result;
  };

  return { deleteBlogType, isDeletingType: isPending };
}
