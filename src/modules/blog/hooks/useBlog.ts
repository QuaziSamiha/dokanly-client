"use client";

import { BLOG_API } from "@/constants/api";
import { useDelete } from "@/hooks/api/useDelete";
import { useFormPatch } from "@/hooks/api/useFormPatch";
import { useFormPost } from "@/hooks/api/useFormPost";
import { useGet, useGetAll } from "@/hooks/api/useGet";
import { usePatch } from "@/hooks/api/usePatch";
import { IPaginationMeta } from "@/types";
import { IBlog, IBlogListItem, IBlogStats } from "../types/blog.types";

export interface IBlogListParams {
  page: number;
  limit: number;
  search?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
  typeId?: number;
}

/**
 * Paginated blog list for the admin table. Unlike the public listing this
 * returns every status, so drafts and archived posts stay reachable.
 */
export function useBlogList({
  page,
  limit,
  search,
  sortOrder,
  status,
  typeId,
}: IBlogListParams) {
  const queryParams = {
    page,
    limit,
    search: search || undefined,
    sortOrder: sortOrder || undefined,
    status: status || undefined,
    typeId: typeId || undefined,
  };

  const { data, isLoading, refetch } = useGetAll<{
    data: IBlogListItem[];
    meta: IPaginationMeta;
  }>(
    BLOG_API.paths.ALL,
    [
      ...BLOG_API.keys.ALL,
      String(page),
      String(limit),
      search ?? "",
      sortOrder ?? "",
      status ?? "",
      String(typeId ?? ""),
    ],
    queryParams,
  );

  return {
    blogs: data?.data ?? [],
    meta: data?.meta,
    isBlogLoading: isLoading,
    refetchBlog: refetch,
  };
}

/** Counters for the admin blog dashboard header. */
export function useBlogStats() {
  const { data, isLoading } = useGet<IBlogStats>(
    BLOG_API.paths.STATS,
    BLOG_API.keys.STATS,
  );

  return { stats: data, isStatsLoading: isLoading };
}

/**
 * Full post by id — the list payload omits `content`, so the edit and view
 * screens have to fetch the row again.
 */
export function useBlogDetails(id?: number) {
  const { data, isLoading } = useGet<IBlog>(
    BLOG_API.paths.BY_ID(id ?? ""),
    [...BLOG_API.keys.ALL, "details", String(id ?? "")],
    undefined,
    Boolean(id),
  );

  return { blog: data, isBlogDetailsLoading: isLoading };
}

/** Create goes through `useFormPost` because the cover image is multipart. */
export function useCreateBlog(onSuccess?: () => void) {
  const { mutate, isPending } = useFormPost(
    BLOG_API.paths.CREATE,
    (data: unknown) => {
      const response = data as { statusCode: number };
      if (response.statusCode >= 200 && response.statusCode < 300) {
        onSuccess?.();
      }
    },
  );

  const createBlog = (payload: FormData) =>
    mutate(payload as unknown as Record<string, unknown>);

  return { createBlog, isCreating: isPending };
}

export function useUpdateBlog(onSuccess?: () => void) {
  const { mutate, isPending } = useFormPatch((data) => {
    if (data.statusCode >= 200 && data.statusCode < 300) {
      onSuccess?.();
    }
  });

  const updateBlog = (id: number, payload: FormData) =>
    mutate({ endpoint: BLOG_API.paths.UPDATE_BY_ID(id), data: payload });

  return { updateBlog, isUpdating: isPending };
}

/** Soft delete — moves the post to ARCHIVED and off the storefront. */
export function useArchiveBlog(onSuccess?: () => void) {
  const { mutate, isPending } = usePatch((data) => {
    if (data.statusCode >= 200 && data.statusCode < 300) {
      onSuccess?.();
    }
  });

  const archiveBlog = (id: number) =>
    mutate({ endpoint: BLOG_API.paths.ARCHIVE_BY_ID(id), data: {} });

  return { archiveBlog, isArchiving: isPending };
}

/** Hard delete — also removes every comment filed against the post. */
export function useDeleteBlog() {
  const { mutateAsync, isPending } = useDelete(BLOG_API.rootKeys.ALL);

  const deleteBlog = (id: number) => mutateAsync(BLOG_API.paths.DELETE_BY_ID(id));

  return { deleteBlog, isDeletingBlog: isPending };
}
