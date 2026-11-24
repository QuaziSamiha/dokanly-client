import { ColumnDef } from "@tanstack/react-table";
import { stripHtml } from "@/lib/utils/html.utils";
import { IHomeContent } from "@/modules/home/types/home-content.types";
import {
  ActionsCell,
  PositionCell,
  StatusCell,
  Thumbnail,
  UpdatedCell,
} from "../home-content.cells";

export const ProductArticleColumns = (
  handleEdit: (data: IHomeContent) => void,
  handleDelete: (data: IHomeContent) => void,
): ColumnDef<IHomeContent>[] => [
  {
    accessorKey: "title",
    header: "Article",
    enableSorting: false,
    cell: ({ row }) => {
      const article = row.original;
      // * The description is rich text (HTML from the editor); show it as plain text here.
      const excerpt = stripHtml(article.description);
      return (
        <div className="flex min-w-[300px] max-w-[420px] items-center gap-3">
          <Thumbnail src={article.image} alt={article.title || "Product article"} />
          <div className="flex min-w-0 flex-col">
            <span
              className="truncate text-sm font-medium text-neutralPrimary-800"
              title={article.title}
            >
              {article.title || "Untitled article"}
            </span>
            {excerpt && (
              <span
                className="line-clamp-2 text-xs leading-relaxed text-neutralPrimary-500"
                title={excerpt}
              >
                {excerpt}
              </span>
            )}
          </div>
        </div>
      );
    },
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
