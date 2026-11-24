"use client";

import React, { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import CustomTable from "@/components/data-display/table/CustomTable";
import SegmentedFilter, {
  SegmentedOption,
} from "@/components/form/SegmentedFilter";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useConfirm } from "@/hooks/useConfirm";
import {
  useCommentList,
  useDeleteComment,
  useModerateComment,
  usePinComment,
} from "../hooks/useBlogComment";
import {
  CommentStatus,
  IBlogComment,
  IBlogListItem,
} from "../types/blog.types";
import { COMMENT_STATUS_STYLES } from "../utils/blog-display.utils";
import { getCommentColumns } from "./comment.columns";

const STATUS_FILTER_OPTIONS: SegmentedOption<CommentStatus>[] = [
  { value: undefined, label: "All" },
  ...(Object.keys(COMMENT_STATUS_STYLES) as CommentStatus[]).map((status) => ({
    value: status,
    label: COMMENT_STATUS_STYLES[status].label,
    dot: COMMENT_STATUS_STYLES[status].dot,
  })),
];

interface IBlogComments {
  blog: IBlogListItem;
  onClose: () => void;
}

/**
 * Moderation for one post's comments, opened from the Comments column of the
 * blog table. Render inside CustomModal2 with `hasOwnTitle`.
 *
 * Every public comment arrives as PENDING and stays off the post until it is
 * approved here, so a post with a backlog opens on that filter.
 */
export default function BlogComments({ blog, onClose }: IBlogComments) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<CommentStatus | undefined>(
    blog.pendingComments ? "PENDING" : undefined,
  );

  const { comments, meta, isCommentLoading, refetchComment } = useCommentList({
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
    status: statusFilter,
    blogId: blog.id,
  });

  const { moderateComment } = useModerateComment(() => refetchComment());
  const { deleteComment } = useDeleteComment();
  const { pinComment } = usePinComment(() => refetchComment());

  const handleModerate = (data: IBlogComment, status: CommentStatus) => {
    moderateComment(data.id, { status });
  };

  const { confirmDelete } = useConfirm();

  const handleDeleteClick = (data: IBlogComment) =>
    confirmDelete({
      itemName: "comment",
      description: "Any replies to it will be removed too.",
      onConfirm: () => deleteComment(data.id),
    });

  const handlePin = (data: IBlogComment) => {
    pinComment(data.id, !data.isPinned);
  };

  const columns = getCommentColumns(
    handleModerate,
    handleDeleteClick,
    handlePin,
  );

  return (
    <section className="flex min-w-0 flex-col">
      <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-neutralPrimary-200 bg-white px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-greenPrimary-950 text-greenPrimary-600 sm:flex">
            <MessageSquare size={18} />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <DialogTitle className="text-lg font-semibold leading-tight text-neutralPrimary-800 sm:text-xl">
              Comments
            </DialogTitle>
            <DialogDescription
              className="truncate text-sm text-neutralPrimary-500"
              title={blog.title}
            >
              {blog.title}
            </DialogDescription>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutralPrimary-500">
              <span>
                <span className="font-semibold text-neutralPrimary-700">
                  {blog.totalComments}
                </span>{" "}
                approved
              </span>
              {!!blog.pendingComments && (
                <span className="inline-flex items-center gap-1.5 text-warningPrimary-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-warningPrimary-600" />
                  <span className="font-semibold">{blog.pendingComments}</span>
                  awaiting approval
                </span>
              )}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="-mr-1.5 -mt-1 shrink-0 cursor-pointer rounded-lg p-2 text-neutralPrimary-500 transition-colors hover:bg-neutralPrimary-100 hover:text-neutralPrimary-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-greenPrimary-500/25"
        >
          <X className="size-5" aria-hidden />
        </button>
      </header>

      <div className="px-4 py-5 sm:px-6 sm:py-6">
        <CustomTable<IBlogComment>
          data={comments}
          columns={columns}
          isLoading={isCommentLoading}
          pageCount={meta?.totalPages || 1}
          totalItems={meta?.totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search comments..."
          pageResetKey={statusFilter ?? "ALL"}
          toolbar={
            <SegmentedFilter
              label="Status"
              options={STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={(next) => {
                setStatusFilter(next);
                // A narrower filter can have fewer pages than the current one.
                setCurrentPage(1);
              }}
            />
          }
        />
      </div>
    </section>
  );
}
