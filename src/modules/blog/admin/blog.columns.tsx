import React from "react";
import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import {
  Clock,
  ExternalLink,
  ImageOff,
  MessageSquare,
  Star,
} from "lucide-react";
import CustomTooltip from "@/components/primitives/CustomTooltip";
import { IBlogListItem } from "../types/blog.types";
import {
  BLOG_STATUS_STYLES,
  blogPublicPath,
  editedAfterPublish,
  formatBlogDate,
  timeAgo,
} from "../utils/blog-display.utils";

export const getBlogColumns = (
  handleView: (data: IBlogListItem) => void,
  handleEdit: (data: IBlogListItem) => void,
  handleDelete: (data: IBlogListItem) => void,
  handleComments: (data: IBlogListItem) => void,
): ColumnDef<IBlogListItem>[] => [
  {
    accessorKey: "title",
    header: "Post",
    enableSorting: false,
    cell: ({ row }) => {
      const blog = row.original;
      return (
        <div className="flex min-w-[280px] items-center gap-3">
          {/* Same 16:10 crop the storefront card uses. */}
          <div className="relative flex h-12 w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-md border border-neutralPrimary-200 bg-neutralPrimary-50">
            {blog.bannerUrl ? (
              <Image
                src={blog.bannerUrl}
                alt={blog.bannerAlt || blog.title}
                fill
                sizes="76px"
                className="object-cover"
              />
            ) : (
              <ImageOff size={18} className="text-neutralPrimary-300" />
            )}
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="flex items-center gap-1.5">
              {blog.featured && (
                <Star
                  size={14}
                  className="shrink-0 fill-warningPrimary-500 text-warningPrimary-500"
                  aria-label="Featured"
                />
              )}
              <span
                className="max-w-[300px] truncate text-sm font-medium text-neutralPrimary-800"
                title={blog.title}
              >
                {blog.title}
              </span>
            </span>
            <span
              className="max-w-[300px] truncate font-mono text-xs text-neutralPrimary-400"
              title={blogPublicPath(blog.slug)}
            >
              /{blog.slug}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.type ? (
        <span className="inline-flex whitespace-nowrap rounded-full bg-blueSecondary-50 px-2.5 py-1 text-xs font-medium text-blueSecondary-600">
          {row.original.type.name}
        </span>
      ) : (
        <span className="text-sm text-neutralPrimary-400">—</span>
      ),
  },
  {
    accessorKey: "authorName",
    header: "Author",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5 whitespace-nowrap">
        <span className="text-sm text-neutralPrimary-700">
          {row.original.authorName || "—"}
        </span>
        {row.original.readTime && (
          <span className="inline-flex items-center gap-1 text-xs text-neutralPrimary-400">
            <Clock size={12} />
            {row.original.readTime} min read
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "totalComments",
    header: "Comments",
    enableSorting: false,
    cell: ({ row }) => {
      const { totalComments, pendingComments } = row.original;
      return (
        // Opens the post's moderation modal.
        <button
          type="button"
          onClick={() => handleComments(row.original)}
          title="Manage comments"
          className="group flex cursor-pointer flex-col items-start gap-1 rounded-lg px-2 py-1.5 -mx-2 text-left transition-colors hover:bg-greenPrimary-950"
        >
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm tabular-nums text-neutralPrimary-700 group-hover:text-greenPrimary-600">
            <MessageSquare
              size={14}
              className="text-neutralPrimary-400 group-hover:text-greenPrimary-600"
            />
            <span className="font-semibold">{totalComments}</span>
            <span className="text-xs text-neutralPrimary-400 group-hover:text-greenPrimary-600">
              {totalComments === 1 ? "comment" : "comments"}
            </span>
          </span>
          {!!pendingComments && (
            <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-warningPrimary-100 px-2 py-0.5 text-[11px] font-semibold text-warningPrimary-600">
              <span className="h-1.5 w-1.5 rounded-full bg-warningPrimary-600" />
              {pendingComments} pending
            </span>
          )}
        </button>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: false,
    cell: ({ row }) => {
      const style = BLOG_STATUS_STYLES[row.original.status];
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
    accessorKey: "publishedAt",
    header: "Published",
    enableSorting: false,
    cell: ({ row }) => {
      const { publishedAt, updatedAt, createdAt } = row.original;
      if (!publishedAt) {
        return (
          <div className="flex flex-col gap-0.5 whitespace-nowrap">
            <span className="text-sm text-neutralPrimary-400">Not yet</span>
            <span className="text-xs text-neutralPrimary-400">
              Created {formatBlogDate(createdAt)}
            </span>
          </div>
        );
      }
      return (
        <div className="flex flex-col gap-0.5 whitespace-nowrap">
          <span className="text-sm text-neutralPrimary-700">
            {formatBlogDate(publishedAt)}
          </span>
          <span className="text-xs text-neutralPrimary-400">
            {editedAfterPublish(publishedAt, updatedAt)
              ? `Edited ${timeAgo(updatedAt).toLowerCase()}`
              : timeAgo(publishedAt)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "Action",
    enableSorting: false,
    cell: ({ row }) => {
      const isLive = row.original.status === "PUBLISHED";
      return (
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => handleView(row.original)}>
            <CustomTooltip action="view" content="View" />
          </button>
          <button type="button" onClick={() => handleEdit(row.original)}>
            <CustomTooltip action="edit" content="Edit" />
          </button>
          <button type="button" onClick={() => handleDelete(row.original)}>
            <CustomTooltip action="delete" content="Delete" />
          </button>
          {/* Only a live post has a public page to open. */}
          <a
            href={blogPublicPath(row.original.slug)}
            target="_blank"
            rel="noopener noreferrer"
            title={isLive ? "Open on the website" : "Not live yet"}
            aria-disabled={!isLive}
            className={`text-neutralPrimary-500 transition-colors hover:text-greenPrimary-600 ${
              isLive ? "" : "pointer-events-none opacity-30"
            }`}
          >
            <ExternalLink size={19} />
          </a>
        </div>
      );
    },
  },
];
