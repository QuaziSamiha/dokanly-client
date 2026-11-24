import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Ban, Check, CornerDownRight, Pin, PinOff, X } from "lucide-react";
import CustomTooltip from "@/components/primitives/CustomTooltip";
import { CommentStatus, IBlogComment } from "../types/blog.types";
import {
  COMMENT_STATUS_STYLES,
  formatBlogDate,
  timeAgo,
} from "../utils/blog-display.utils";

const ACTION_BUTTON =
  "inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold cursor-pointer transition-colors";

/** Columns of the per-post comment moderation table. */
export const getCommentColumns = (
  handleModerate: (data: IBlogComment, status: CommentStatus) => void,
  handleDelete: (data: IBlogComment) => void,
  handlePin: (data: IBlogComment) => void,
): ColumnDef<IBlogComment>[] => [
  {
    accessorKey: "authorName",
    header: "Author",
    enableSorting: false,
    cell: ({ row }) => {
      const comment = row.original;
      return (
        <div className="flex min-w-[180px] items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-greenPrimary-950 text-xs font-semibold uppercase text-greenPrimary-600">
            {comment.authorName?.charAt(0) || "?"}
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="flex items-center gap-1.5">
              <span
                className="max-w-[160px] truncate text-sm font-medium text-neutralPrimary-800"
                title={comment.authorName}
              >
                {comment.authorName}
              </span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  comment.isMember
                    ? "bg-blueSecondary-50 text-blueSecondary-600"
                    : "bg-neutralPrimary-100 text-neutralPrimary-500"
                }`}
              >
                {comment.isMember ? "Member" : "Guest"}
              </span>
            </span>
            {/* Email is admin-only on the API, so it is safe to surface here. */}
            {comment.email && (
              <span
                className="max-w-[200px] truncate text-xs text-neutralPrimary-400"
                title={comment.email}
              >
                {comment.email}
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "content",
    header: "Comment",
    enableSorting: false,
    cell: ({ row }) => {
      const comment = row.original;
      return (
        <div className="flex min-w-[220px] max-w-md flex-col gap-1">
          {(comment.parentId || comment.isPinned) && (
            <span className="flex flex-wrap items-center gap-1.5">
              {comment.parentId && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutralPrimary-400">
                  <CornerDownRight size={12} />
                  Reply
                </span>
              )}
              {comment.isPinned && (
                <span className="inline-flex items-center gap-1 rounded-full bg-greenPrimary-950 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-greenPrimary-600">
                  <Pin size={10} />
                  Pinned
                </span>
              )}
            </span>
          )}
          <p
            className="line-clamp-3 whitespace-pre-line text-sm text-neutralPrimary-700"
            title={comment.content}
          >
            {comment.content}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5 whitespace-nowrap">
        <span className="text-sm text-neutralPrimary-700">
          {formatBlogDate(row.original.createdAt)}
        </span>
        <span className="text-xs text-neutralPrimary-400">
          {timeAgo(row.original.createdAt)}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: false,
    cell: ({ row }) => {
      const style = COMMENT_STATUS_STYLES[row.original.status];
      return (
        <span
          title={style.hint}
          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style.pill}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
          {style.label}
        </span>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "Action",
    enableSorting: false,
    cell: ({ row }) => {
      const comment = row.original;
      return (
        <div className="flex min-w-[150px] flex-wrap items-center gap-1.5">
          {/* Approving is what publishes a comment and bumps the blog's counter,
              so it is only offered while the comment is not already approved. */}
          {comment.status !== "APPROVED" && (
            <button
              type="button"
              onClick={() => handleModerate(comment, "APPROVED")}
              className={`${ACTION_BUTTON} bg-success-100 text-success-600 hover:bg-success-600 hover:text-white`}
            >
              <Check size={12} />
              Approve
            </button>
          )}

          {comment.status !== "REJECTED" && (
            <button
              type="button"
              onClick={() => handleModerate(comment, "REJECTED")}
              className={`${ACTION_BUTTON} bg-destructive-100 text-destructive-600 hover:bg-destructive-600 hover:text-white`}
            >
              <X size={12} />
              Reject
            </button>
          )}

          {comment.status !== "SPAM" && (
            <button
              type="button"
              onClick={() => handleModerate(comment, "SPAM")}
              className={`${ACTION_BUTTON} bg-neutralPrimary-100 text-neutralPrimary-600 hover:bg-neutralPrimary-600 hover:text-white`}
            >
              <Ban size={12} />
              Spam
            </button>
          )}

          {/* Only an approved top-level comment can lead the public thread. */}
          {comment.status === "APPROVED" && !comment.parentId && (
            <button
              type="button"
              onClick={() => handlePin(comment)}
              className={`${ACTION_BUTTON} bg-greenPrimary-950 text-greenPrimary-600 hover:bg-greenPrimary-500 hover:text-white`}
            >
              {comment.isPinned ? <PinOff size={12} /> : <Pin size={12} />}
              {comment.isPinned ? "Unpin" : "Pin"}
            </button>
          )}

          <button type="button" onClick={() => handleDelete(comment)}>
            <CustomTooltip action="delete" content="Delete" />
          </button>
        </div>
      );
    },
  },
];
