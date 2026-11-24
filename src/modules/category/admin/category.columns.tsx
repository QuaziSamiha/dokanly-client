// components/category/categoryColumns.ts
import { ColumnDef } from "@tanstack/react-table";
import { ICategory } from "@/modules/category/types/category.types";
import CustomTooltip from "@/components/primitives/CustomTooltip";

export const statusBadgeClass = (status: string) =>
  status === "ACTIVE"
    ? "text-emerald-700 bg-emerald-50 ring-emerald-600/20"
    : status === "INACTIVE"
      ? "text-rose-700 bg-rose-50 ring-rose-600/20"
      : "text-amber-700 bg-amber-50 ring-amber-600/20";

const statusDotClass = (status: string) =>
  status === "ACTIVE"
    ? "bg-emerald-500"
    : status === "INACTIVE"
      ? "bg-rose-500"
      : "bg-amber-500";

// An ACTIVE category under a non-active parent is still hidden from the shop.
export const isHiddenByParent = (category: ICategory) =>
  category.status === "ACTIVE" &&
  !!category.parent?.status &&
  category.parent.status !== "ACTIVE";

export const getCategoryColumns = (
  handleView: (data: ICategory) => void,
  handleEdit: (data: ICategory) => void,
): ColumnDef<ICategory>[] => [
  {
    accessorKey: "name",
    header: "Category Name",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span>{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: "parent",
    header: "Parent",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.parent?.name ?? (
        <span className="inline-flex items-center font-medium text-xs w-fit rounded-full px-2.5 py-1 ring-1 ring-inset text-sky-700 bg-sky-50 ring-sky-600/20">
          Root
        </span>
      ),
  },
  {
    accessorKey: "productCount",
    header: "Number of Products",
    enableSorting: true,
  },
  {
    accessorKey: "childrenCount",
    header: "Subcategories",
    enableSorting: false,
  },
  // {
  //   accessorKey: "sortOrder",
  //   header: "Sort Order",
  //   enableSorting: false,
  // },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <div
          className={`inline-flex items-center gap-1.5 capitalize font-medium text-xs w-fit rounded-full px-2.5 py-1 ring-1 ring-inset ${statusBadgeClass(
            row.original.status,
          )}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${statusDotClass(
              row.original.status,
            )}`}
          />
          {row.original.status.toLowerCase()}
        </div>
      </div>
    ),
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
      </div>
    ),
  },
];
