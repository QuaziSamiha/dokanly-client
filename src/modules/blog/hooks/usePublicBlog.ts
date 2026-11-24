"use client";

import { BLOG_API } from "@/constants/api";
import { useGet, useGetAll } from "@/hooks/api/useGet";
import { IPaginationMeta } from "@/types";
import { IBlog, IBlogListItem } from "../types/blog.types";

export interface IPublicBlogParams {
  page: number;
  limit: number;
  typeSlug?: string;
  search?: string;
}

/**
 * Published posts for the storefront listing.
 *
 * `typeSlug` drives the filter tabs — omitting it is the "All" tab. The API
 * pins the status to PUBLISHED, so drafts can never leak through this route.
 */
export function usePublicBlogs({
  page,
  limit,
  typeSlug,
  search,
}: IPublicBlogParams) {
  const queryParams = {
    page,
    limit,
    typeSlug: typeSlug || undefined,
    search: search || undefined,
  };

  const { data, isLoading } = useGetAll<{
    data: IBlogListItem[];
    meta: IPaginationMeta;
  }>(
    BLOG_API.paths.PUBLISHED,
    [
      ...BLOG_API.keys.PUBLISHED,
      String(page),
      String(limit),
      typeSlug ?? "",
      search ?? "",
    ],
    queryParams,
  );

  return {
    blogs: data?.data ?? [],
    meta: data?.meta,
    isBlogsLoading: isLoading,
  };
}

/**
 * One published post by slug. Also bumps the post's view counter server-side,
 * so this should only be called from the detail screen.
 */
export function usePublicBlogDetails(slug?: string) {
  const { data, isLoading } = useGet<IBlog>(
    BLOG_API.paths.BY_SLUG(slug ?? ""),
    BLOG_API.keys.DETAILS(slug ?? ""),
    undefined,
    Boolean(slug),
  );

  return { blog: data, isBlogLoading: isLoading };
}

/** The "Related Posts" strip — same blog type, newest first. */
export function useRelatedBlogs(slug?: string) {
  const { data, isLoading } = useGet<IBlogListItem[]>(
    BLOG_API.paths.RELATED(slug ?? ""),
    BLOG_API.keys.RELATED(slug ?? ""),
    undefined,
    Boolean(slug),
  );

  return { relatedBlogs: data ?? [], isRelatedLoading: isLoading };
}
