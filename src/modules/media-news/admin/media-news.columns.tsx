import { ColumnDef } from "@tanstack/react-table";
import CustomTooltip from "@/components/primitives/CustomTooltip";
import { formatEnumString } from "@/lib/utils/string.utils";
import { truncateText } from "@/lib/utils/text.utils";
import { formatDateToMMDDYYYY } from "@/lib/utils/date.utils";
import { IMediaNews } from "../types/media-news.types";

export const getMediaNewsColumns = (
  handleView: (data: IMediaNews) => void,
  handleEdit: (data: IMediaNews) => void,
  handleDelete: (data: IMediaNews) => void,
): ColumnDef<IMediaNews>[] => [
  {
    accessorKey: "title",
    header: "Title",
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className={`capitalize text-sm text-neutral-700`}>
          {truncateText(row.original.title, 50)}
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div
          className={`capitalize font-semibold text-sm w-fit rounded-md px-3 py-1.5 ${
            row.original.category === "MEDIA"
              ? "text-blueSecondary-600 bg-blueSecondary-100"
              : row.original.category === "NEWS"
                ? "text-warningPrimary-600 bg-warningPrimary-100"
                : row.original.category === "COMMERCIAL"
                  ? "text-gray-600 bg-gray-100"
                  : "text-success-600 bg-success-100"
          }`}
        >
          {formatEnumString(row.original.category)}
        </div>
      );
    },
  },
  {
    accessorKey: "publishedAt",
    header: "Published At",
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-sm text-neutral-700">
          {formatDateToMMDDYYYY(row.original.publishedAt)}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div
          className={`capitalize font-semibold text-sm w-fit rounded-md px-3 py-1.5 ${
            row.original.status === "PUBLISHED"
              ? "text-success-600 bg-success-100"
              : row.original.status === "INACTIVE"
                ? "text-destructive-600 bg-destructive-100"
                : row.original.status === "ARCHIVED"
                  ? "text-gray-600 bg-gray-100"
                  : "text-blueSecondary-600 bg-blueSecondary-100"
          }`}
        >
          {formatEnumString(row.original.status)}
        </div>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "Action",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <button onClick={() => handleView(row.original)}>
          <CustomTooltip action="view" content="View" />
        </button>
        <button onClick={() => handleEdit(row.original)}>
          <CustomTooltip action="edit" content="Edit" />
        </button>
        <button onClick={() => handleDelete(row.original)}>
          <CustomTooltip action="delete" content="Delete" />
        </button>
      </div>
    ),
  },
];
