import { ColumnDef } from "@tanstack/react-table";
import { IHomeContent } from "@/modules/home/types/home-content.types";
import {
  ActionsCell,
  LinkCell,
  PositionCell,
  StatusCell,
  Thumbnail,
  UpdatedCell,
} from "../home-content.cells";

const fileNameOf = (url?: string | null) =>
  url ? decodeURIComponent(url.split("/").pop() ?? "") : "";

export const HeroSliderColumns = (
  handleEdit: (data: IHomeContent) => void,
  handleDelete: (data: IHomeContent) => void,
): ColumnDef<IHomeContent>[] => [
  {
    accessorKey: "image",
    header: "Slide",
    enableSorting: false,
    cell: ({ row }) => {
      const slide = row.original;
      const fileName = fileNameOf(slide.image);
      return (
        <div className="flex min-w-[240px] items-center gap-3">
          <Thumbnail src={slide.image} alt="Hero slide" wide />
          <div className="flex min-w-0 flex-col">
            <span className="text-sm font-medium text-neutralPrimary-800">
              {slide.sortOrder ? `Slide ${slide.sortOrder}` : "Slide"}
            </span>
            {fileName && (
              <span
                className="max-w-[200px] truncate text-xs text-neutralPrimary-500"
                title={fileName}
              >
                {fileName}
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "redirectUrl",
    header: "Opens",
    enableSorting: false,
    cell: ({ row }) => <LinkCell url={row.original.redirectUrl} />,
  },
  {
    accessorKey: "sortOrder",
    header: "Position",
    enableSorting: false,
    cell: ({ row }) => <PositionCell sortOrder={row.original.sortOrder} />,
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
    cell: ({ row }) => (
      <ActionsCell
        item={row.original}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    ),
  },
];
