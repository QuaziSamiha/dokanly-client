"use client";

import { MEDIA_NEWS_API } from "@/constants/api";
import { useFormPatch } from "@/hooks/api/useFormPatch";
import { useFormPost } from "@/hooks/api/useFormPost";
import { useGetAll } from "@/hooks/api/useGet";
import { IPaginationMeta } from "@/types";
import { IMediaNews } from "../types/media-news.types";

export interface IMediaNewsListParams {
  page: number;
  limit: number;
  search?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Paginated media & news list for the admin table. Unlike the public
 * `categorized` endpoint this returns every status, so inactive and archived
 * entries stay reachable.
 */
export function useMediaNewsList({
  page,
  limit,
  search,
  sortOrder,
}: IMediaNewsListParams) {
  const queryParams = {
    page,
    limit,
    search: search || undefined,
    sortOrder: sortOrder || undefined,
  };

  const { data, isLoading, refetch } = useGetAll<{
    data: IMediaNews[];
    meta: IPaginationMeta;
  }>(
    MEDIA_NEWS_API.paths.ALL,
    [
      ...MEDIA_NEWS_API.keys.ALL,
      String(page),
      String(limit),
      search ?? "",
      sortOrder ?? "",
    ],
    queryParams,
  );

  return {
    mediaNews: data?.data ?? [],
    meta: data?.meta,
    isMediaNewsLoading: isLoading,
    refetchMediaNews: refetch,
  };
}

/** Create goes through `useFormPost` because the image and video are multipart. */
export function useCreateMediaNews(onSuccess?: () => void) {
  const { mutate, isPending } = useFormPost(
    MEDIA_NEWS_API.paths.CREATE,
    (data: unknown) => {
      const response = data as { statusCode: number };
      if (response.statusCode >= 200 && response.statusCode < 300) {
        onSuccess?.();
      }
    },
  );

  const createMediaNews = (payload: FormData) =>
    mutate(payload as unknown as Record<string, unknown>);

  return { createMediaNews, isCreating: isPending };
}

export function useUpdateMediaNews(onSuccess?: () => void) {
  const { mutate, isPending } = useFormPatch<IMediaNews>(
    (data) => {
      if (data.statusCode >= 200 && data.statusCode < 300) {
        onSuccess?.();
      }
    },
    (error) => {
      console.error("Update failed:", error);
    },
  );

  const updateMediaNews = (id: number | string, payload: FormData) =>
    mutate({ endpoint: MEDIA_NEWS_API.paths.UPDATE_BY_ID(id), data: payload });

  return { updateMediaNews, isUpdating: isPending };
}

/** Soft delete — moves the entry to ARCHIVED and off the storefront. */
export function useSoftDeleteMediaNews(onSuccess?: () => void) {
  const { mutate, isPending } = useFormPatch<IMediaNews>(
    (data) => {
      if (data.statusCode >= 200 && data.statusCode < 300) {
        onSuccess?.();
      }
    },
    (error) => {
      console.error("Delete failed:", error);
    },
  );

  const softDeleteMediaNews = (id: number | string) =>
    mutate({
      endpoint: MEDIA_NEWS_API.paths.SOFT_DELETE_BY_ID(id),
      data: { id },
    });

  return { softDeleteMediaNews, isSoftDeleting: isPending };
}
