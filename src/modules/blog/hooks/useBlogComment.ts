"use client";

import { useQueryClient } from "@tanstack/react-query";
import { BLOG_API, BLOG_COMMENT_API } from "@/constants/api";
import { useDelete } from "@/hooks/api/useDelete";
import { useGetAll } from "@/hooks/api/useGet";
import { usePatch } from "@/hooks/api/usePatch";
import { usePost } from "@/hooks/api/usePost";
import { ResponseSuccessType, IPaginationMeta } from "@/types";
import { IBlogComment, CommentStatus } from "../types/blog.types";

export interface ICommentListParams {
  page: number;
  limit: number;
  search?: string;
  status?: CommentStatus | "";
  blogId?: number;
}

/**
 * Admin moderation queue across every post. Filter by status to work the
 * PENDING backlog, which is where every public comment lands.
 */
export function useCommentList({
  page,
  limit,
  search,
  status,
  blogId,
}: ICommentListParams) {
  const queryParams = {
    page,
    limit,
    search: search || undefined,
    status: status || undefined,
    blogId: blogId || undefined,
  };

  const { data, isLoading, refetch } = useGetAll<{
    data: IBlogComment[];
    meta: IPaginationMeta;
  }>(
    BLOG_COMMENT_API.paths.ALL,
    [
      ...BLOG_COMMENT_API.keys.ALL,
      String(page),
      String(limit),
      search ?? "",
      status ?? "",
      String(blogId ?? ""),
    ],
    queryParams,
  );

  return {
    comments: data?.data ?? [],
    meta: data?.meta,
    isCommentLoading: isLoading,
    refetchComment: refetch,
  };
}

/**
 * The approved thread under one post. Top-level comments come back with their
 * approved replies nested, so the public view needs a single request.
 */
export function usePublicComments(slug?: string, page = 1, limit = 10) {
  const { data, isLoading, refetch } = useGetAll<{
    data: IBlogComment[];
    meta: IPaginationMeta;
  }>(
    BLOG_COMMENT_API.paths.BY_BLOG_SLUG(slug ?? ""),
    [
      ...BLOG_COMMENT_API.keys.BY_BLOG_SLUG(slug ?? ""),
      String(page),
      String(limit),
    ],
    { page, limit },
    undefined,
    Boolean(slug),
  );

  return {
    comments: data?.data ?? [],
    commentMeta: data?.meta,
    isCommentsLoading: isLoading,
    refetchComments: refetch,
  };
}

/**
 * Public "Leave a Reply" submit. Works for guests and logged-in users alike —
 * the API reads a member's identity off the token and ignores the guest fields.
 *
 * The created comment is PENDING, so it will NOT appear in the thread until an
 * admin approves it; the form tells the visitor as much.
 */
export function useCreateComment(slug: string, onSuccess?: () => void) {
  const { mutate, isPending } = usePost(
    BLOG_COMMENT_API.paths.CREATE(slug),
    (data: ResponseSuccessType) => {
      if (data.statusCode >= 200 && data.statusCode < 300) {
        onSuccess?.();
      }
    },
  );

  return { createComment: mutate, isSubmittingComment: isPending };
}

/**
 * Approve / reject / mark spam. Approving is what publishes the comment and
 * increments the post's comment counter.
 */
export function useModerateComment(onSuccess?: () => void) {
  const refreshBlogCounts = useRefreshBlogCounts();
  const { mutate, isPending } = usePatch((data) => {
    if (data.statusCode >= 200 && data.statusCode < 300) {
      refreshBlogCounts();
      onSuccess?.();
    }
  });

  const moderateComment = (
    id: number,
    payload: { status: CommentStatus; moderatorNotes?: string },
  ) =>
    mutate({
      endpoint: BLOG_COMMENT_API.paths.MODERATE_BY_ID(id),
      data: payload,
    });

  return { moderateComment, isModerating: isPending };
}

/** Pins an approved comment to the top of its thread. */
export function usePinComment(onSuccess?: () => void) {
  const { mutate, isPending } = usePatch((data) => {
    if (data.statusCode >= 200 && data.statusCode < 300) {
      onSuccess?.();
    }
  });

  const pinComment = (id: number, isPinned: boolean) =>
    mutate({
      endpoint: `${BLOG_COMMENT_API.paths.PIN_BY_ID(id)}?isPinned=${isPinned}`,
      data: {},
    });

  return { pinComment, isPinning: isPending };
}

/** Deleting a comment also removes its replies. */
export function useDeleteComment() {
  const refreshBlogCounts = useRefreshBlogCounts();
  const { mutateAsync, isPending } = useDelete(BLOG_COMMENT_API.rootKeys.ALL);

  const deleteComment = async (id: number) => {
    const result = await mutateAsync(BLOG_COMMENT_API.paths.DELETE_BY_ID(id));
    refreshBlogCounts();
    return result;
  };

  return { deleteComment, isDeletingComment: isPending };
}

/**
 * Moderating or deleting a comment changes the post's comment counts in the
 * blog table and the stat cards, so both are refetched.
 */
function useRefreshBlogCounts() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: BLOG_API.keys.ALL });
    queryClient.invalidateQueries({ queryKey: BLOG_API.keys.STATS });
  };
}
