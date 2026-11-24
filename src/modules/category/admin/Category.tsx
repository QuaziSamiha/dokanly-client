"use client";

import React, { useState } from "react";
import CustomTable from "@/components/data-display/table/CustomTable";
import CustomModal2 from "@/components/primitives/modal/CustomModal2";
import AddButton from "@/components/primitives/button/AddButton";
import AddCategory from "./AddCategory";
import { useGetAll } from "@/hooks/api/useGet";
import { ICategory } from "@/modules/category/types/category.types";
import ViewCategory from "./ViewCategory";
import { getCategoryColumns } from "./category.columns";
import { useTableModals } from "@/hooks/table/useTableModals";
import { IPaginationMeta } from "@/types";
import EditCategory from "./EditCategory";
import CategoryFilters, { ICategoryFilters } from "./CategoryFilters";

// The dialog has no max-width of its own. Forms: near full-width on phones,
// capped at a comfortable reading width (576px) from tablets up. The height
// leaves room for CustomModal2's 2rem top offset, so the footer stays on screen.
const FORM_MODAL_WIDTH = "w-[calc(100vw-1.5rem)] max-w-xl p-0";
// Keeps the modal clear of the fixed 5rem admin navbar: with CustomModal2's
// mt-8 offset this leaves a 1.5rem gap below the navbar and 2.5rem at the bottom.
const FORM_MODAL_HEIGHT = "max-h-[calc(100dvh-9rem)] scrollbar-brand";
const VIEW_MODAL_WIDTH =
  "w-[calc(100vw-1.5rem)] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] max-w-5xl";

export default function Category() {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const { viewData, editData, modals, setModal, handleView, handleEdit } =
    useTableModals<ICategory>();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<ICategoryFilters>({});

  const queryParams = {
    page: currentPage,
    limit: pageSize,
    search: searchTerm || undefined,
    sortOrder: sortOrder || undefined,
    status: filters.status,
    level: filters.level,
  };

  const {
    data: categoryData,
    isLoading: isCategoryLoading,
    refetch: refetchCategory,
  } = useGetAll<{ data: ICategory[]; meta: IPaginationMeta }>(
    `/categories/all`,
    [
      "getCategoryMeta",
      String(currentPage),
      String(pageSize),
      searchTerm,
      sortOrder,
      filters.status ?? "",
      filters.level ?? "",
    ],
    queryParams
  );

  const columns = getCategoryColumns(handleView, handleEdit);
  // console.log(categoryData?.meta);
  return (
    <section className="flex flex-col gap-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xl font-semibold text-neutralPrimary-700 sm:text-2xl">
          Category
        </p>
        <AddButton label="Add Category" setOpen={setOpenModal} />

        <CustomModal2
          open={openModal}
          onOpenChange={setOpenModal}
          dialogWidth={FORM_MODAL_WIDTH}
          dialogHeight={FORM_MODAL_HEIGHT}
          hasOwnTitle
        >
          <AddCategory setOpen={setOpenModal} refetch={refetchCategory} />
        </CustomModal2>
      </section>

      <CustomTable<ICategory>
        data={Array.isArray(categoryData?.data) ? categoryData.data : []}
        columns={columns}
        isLoading={isCategoryLoading}
        pageCount={categoryData?.meta?.totalPages || 1}
        totalItems={categoryData?.meta?.totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        onSearchChange={setSearchTerm}
        toolbar={
          <CategoryFilters
            filters={filters}
            onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
          />
        }
        pageResetKey={`${filters.status}|${filters.level}|${searchTerm}`}
        onSortChange={(field, order) => {
          // console.log("Sort:", field, order);
          setSortOrder(order);
        }}
      />

      <CustomModal2
        open={modals.view}
        onOpenChange={setModal.view}
        dialogWidth={VIEW_MODAL_WIDTH}
        dialogHeight="max-h-[85vh] sm:max-h-[80vh] xl:max-h-[70vh] scrollbar-brand"
      >
        <ViewCategory data={viewData} setOpen={setModal.view} />
      </CustomModal2>
      <CustomModal2
        open={modals.edit}
        onOpenChange={setModal.edit}
        dialogWidth={FORM_MODAL_WIDTH}
        dialogHeight={FORM_MODAL_HEIGHT}
        hasOwnTitle
      >
        <EditCategory
          data={editData}
          setOpen={setModal.edit}
          refetch={refetchCategory}
          isLoading={isCategoryLoading}
        />
      </CustomModal2>
    </section>
  );
}

{
  /* <CustomModal2 open={modals.delete} onOpenChange={setModal.delete}>
        <DeleteConfirm
          item={deleteData}
          onConfirm={() => console.log("delete confirmed")}
          onCancel={() => setModal.delete(false)}
        />
      </CustomModal2> */
}

// "use client";

// import React, { useState } from "react";
// import { ColumnDef } from "@tanstack/react-table";
// import CustomTable from "@/components/data-display/table/CustomTable";
// import CustomModal2 from "@/components/primitives/modal/CustomModal2";
// import AddButton from "@/components/primitives/button/AddButton";
// import CustomTooltip from "@/components/primitives/CustomTooltip";
// import AddCategory from "./AddCategory";
// import { useGetAll } from "@/hooks/api/useGet";
// // import { IPaginationMeta } from "@/types";
// import { ICategory } from "@/modules/category/types/category.types";
// import ViewCategory from "./ViewCategory";
// import { getCategoryColumns } from "./category.columns";

// // types/apiResponse.ts
// export interface IPaginatedResponse<T>  {
//   data: T[];
//   meta: {
//     totalItems: number;
//     itemCount: number;
//     itemsPerPage: number;
//     totalPages: number;
//     currentPage: number;
//   };
// };

// export default function Category() {
//   const [openModal, setOpenModal] = useState<boolean>(false);
//   const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
//   const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
//   const [viewData, setViewData] = useState<ICategory | undefined>();
//   const [editData, setEditData] = useState<ICategory | undefined>();
//   // Pagination and filtering states
//   // Dynamic pagination states
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [pageSize, setPageSize] = useState<number>(10);
//   const [searchTerm] = useState<string>("");
//   const [sortOrder] = useState<string>("asc");

//   // Query parameters for API call
//   const queryParams = {
//     page: currentPage,
//     limit: pageSize,
//     search: searchTerm || undefined,
//     sortOrder: sortOrder,
//   };

//   const handleView = (rowData: ICategory | undefined) => {
//     setViewModalOpen(true);
//     setViewData(rowData);
//   };

//   const handleEdit = (rowData: ICategory | undefined) => {
//     console.log("rowData", rowData);
//     setEditModalOpen(true);
//     setEditData(rowData);
//   };

//   const {
//     data: categoryData,
//     isLoading: isCategoryLoading,
//     refetch: refetchCategory,
//   } = useGetAll<ICategory[]>(
//     `/categories/all`,
//     [
//       "getCategoryMeta",
//       String(currentPage),
//       String(pageSize),
//       // searchTerm,
//       // sortOrder,
//     ],
//     queryParams
//   );

//   // const categoryColumns: ColumnDef<ICategory>[] = [
//   //   { accessorKey: "name", header: "Category Name" },
//   //   {
//   //     accessorKey: "productCount",
//   //     header: "Number of Products",
//   //     enableSorting: true, // numeric sort
//   //   },
//   //   {
//   //     accessorKey: "status",
//   //     header: "Status",
//   //     // sortingFn: "alphanumeric", // good for text
//   //     cell: ({ row }: { row: { original: ICategory } }) => {
//   //       // console.log(row.original.status);
//   //       return (
//   //         <div className="">
//   //           <div
//   //             className={`capitalize font-semibold text-sm w-fit rounded-md px-3 py-1.5 ${
//   //               String(row.original.status).toLowerCase() === "active"
//   //                 ? "text-success-600 bg-success-100"
//   //                 : "text-destructive-600 bg-destructive-100"
//   //             }`}
//   //           >
//   //             {String(row.original.status).toLowerCase()}
//   //           </div>
//   //         </div>
//   //       );
//   //     },
//   //   },
//   //   {
//   //     accessorKey: "actions",
//   //     header: "Action",
//   //     enableSorting: false,
//   //     cell: ({ row }: { row: { original: ICategory } }) => {
//   //       return (
//   //         <div className="flex items-center gap-2">
//   //           <button type="button" onClick={() => handleView(row.original)}>
//   //             <CustomTooltip action="view" content="View" />
//   //           </button>
//   //           <button type="button" onClick={() => handleEdit(row.original)}>
//   //             <CustomTooltip action="edit" content="Edit" />
//   //           </button>
//   //         </div>
//   //       );
//   //     },
//   //   },
//   // ];
// const columns = getCategoryColumns(handleView, handleEdit)
//   return (
//     <section className="flex flex-col gap-6">
//       <section className="flex flex-wrap items-center justify-between gap-3">
//         <p className="text-xl font-semibold text-neutralPrimary-700 sm:text-2xl">
//           Category
//         </p>
//         <AddButton label="Add Category" setOpen={setOpenModal} />

//         <CustomModal2
//           open={openModal}
//           onOpenChange={setOpenModal}
//           dialogWidth="w-[60vw]"
//         >
//           <AddCategory setOpen={setOpenModal} refetch={refetchCategory} />
//         </CustomModal2>
//       </section>

//       <CustomTable<ICategory>
//         data={Array.isArray(categoryData?.data) ? categoryData.data : []}
//         columns={columns}
//         isLoading={isCategoryLoading}
//         // pageCount={responseData?.meta?.totalItems} // TOTAL PAGES
//         onPageChange={setCurrentPage}
//         onPageSizeChange={setPageSize}
//       />

//       <CustomModal2 open={viewModalOpen} onOpenChange={setViewModalOpen}>
//         <div>{viewData?.name}</div>
//       </CustomModal2>
//       <CustomModal2 open={editModalOpen} onOpenChange={setEditModalOpen}>
//         <ViewCategory />
//       </CustomModal2>
//     </section>
//   );
// }
