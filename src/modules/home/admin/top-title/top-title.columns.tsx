import { ColumnDef } from "@tanstack/react-table";
import { Megaphone } from "lucide-react";
import { IHomeContent } from "@/modules/home/types/home-content.types";
import { ActionsCell, StatusCell, UpdatedCell } from "../home-content.cells";

export const TopTitleColumns = (
  handleEdit: (data: IHomeContent) => void,
): ColumnDef<IHomeContent>[] => [
  {
    accessorKey: "title",
    header: "Announcement",
    enableSorting: false,
    cell: ({ row }) => {
      const title = row.original.title ?? "";
      return (
        <div className="flex min-w-[280px] max-w-[560px] items-start gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-greenPrimary-500/10 text-greenPrimary-600">
            <Megaphone className="h-4 w-4" />
          </span>
          <div className="flex min-w-0 flex-col">
            {/* Shown in full: this is the exact text customers read. */}
            <span className="text-sm font-medium break-words text-neutralPrimary-800">
              {title || "No text"}
            </span>
            <span className="text-xs text-neutralPrimary-500 tabular-nums">
              {title.length} / 255 characters
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: false,
    cell: ({ row }) => <StatusCell status={row.original.status} />,
  },
  {
    accessorKey: "updatedAt",
    header: "Last Updated",
    enableSorting: false,
    cell: ({ row }) => <UpdatedCell item={row.original} />,
  },
  {
    accessorKey: "actions",
    header: "Action",
    enableSorting: false,
    cell: ({ row }) => <ActionsCell item={row.original} onEdit={handleEdit} />,
  },
];
