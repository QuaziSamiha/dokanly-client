import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { FileText, Lock, Star, Tag } from "lucide-react";
import CustomTooltip from "@/components/primitives/CustomTooltip";
import { IBlogType } from "../types/blog.types";
import { BLOG_TYPE_STATUS_STYLES } from "../utils/blog-display.utils";

export const getBlogTypeColumns = (
  handleEdit: (data: IBlogType) => void,
  handleDelete: (data: IBlogType) => void,
): ColumnDef<IBlogType>[] => [
  {
    accessorKey: "name",
    header: "Type",
    enableSorting: false,
    cell: ({ row }) => {
      const type = row.original;
      return (
        <div className="flex min-w-[240px] items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
              type.isDefault
                ? "border-greenPrimary-300 bg-greenPrimary-950 text-greenPrimary-600"
                : "border-neutralPrimary-200 bg-neutralPrimary-50 text-neutralPrimary-400"
            }`}
          >
            <Tag size={18} />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="flex flex-wrap items-center gap-1.5">
              <span
                className="max-w-[260px] truncate text-sm font-medium text-neutralPrimary-800"
                title={type.name}
              >
                {type.name}
              </span>
              {type.isDefault && (
                <span
                  title="New posts fall under this type unless another is picked"
                  className="inline-flex items-center gap-1 rounded-full bg-greenPrimary-950 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-greenPrimary-600"
                >
                  <Star size={10} className="fill-current" />
                  Default
                </span>
              )}
              {type.isSystem && (
                <span
                  title="Seeded by the system; its name cannot be changed"
                  className="inline-flex items-center gap-1 rounded-full bg-neutralPrimary-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutralPrimary-500"
                >
                  <Lock size={10} />
                  System
                </span>
              )}
            </span>
            {type.description ? (
              <span
                className="max-w-[320px] truncate text-xs text-neutralPrimary-400"
                title={type.description}
              >
                {type.description}
              </span>
            ) : (
              <span className="text-xs italic text-neutralPrimary-300">
                No description
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "slug",
    header: "Slug",
    enableSorting: false,
    cell: ({ row }) => (
      <span
        className="inline-flex max-w-[200px] truncate rounded-md bg-neutralPrimary-50 px-2 py-0.5 font-mono text-xs text-neutralPrimary-500"
        title={row.original.slug}
      >
        /{row.original.slug}
      </span>
    ),
  },
  {
    accessorKey: "blogCount",
    header: "Posts",
    enableSorting: false,
    cell: ({ row }) => {
      const count = row.original.blogCount ?? 0;
      return (
        <span
          className={`inline-flex items-center gap-1.5 whitespace-nowrap text-sm tabular-nums ${
            count ? "text-neutralPrimary-700" : "text-neutralPrimary-400"
          }`}
        >
          <FileText size={14} className="text-neutralPrimary-400" />
          <span className="font-semibold">{count.toLocaleString()}</span>
          <span className="text-xs text-neutralPrimary-400">
            {count === 1 ? "post" : "posts"}
          </span>
        </span>
      );
    },
  },
  {
    accessorKey: "sortOrder",
    header: "Order",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.sortOrder != null ? (
        <span
          title="Position among the blog filter tabs"
          className="inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-md border border-neutralPrimary-200 bg-white px-1.5 text-xs font-semibold tabular-nums text-neutralPrimary-600"
        >
          {row.original.sortOrder}
        </span>
      ) : (
        <span className="text-sm text-neutralPrimary-400">—</span>
      ),
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: false,
    cell: ({ row }) => {
      const style = BLOG_TYPE_STATUS_STYLES[row.original.status];
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
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {/* Promoting a type to be the default lives in the edit modal, so the
            action column stays to the usual edit/delete pair. */}
        <button type="button" onClick={() => handleEdit(row.original)}>
          <CustomTooltip action="edit" content="Edit" />
        </button>

        {/* Deleting the default type is refused by the API, so it is disabled
            here too; the Default badge on the row says why. */}
        <button
          type="button"
          onClick={() => handleDelete(row.original)}
          disabled={row.original.isDefault}
          className="disabled:pointer-events-none disabled:opacity-40"
        >
          <CustomTooltip action="delete" content="Delete" />
        </button>
      </div>
    ),
  },
];
