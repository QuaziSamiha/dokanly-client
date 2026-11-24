"use client";

import React, { useState } from "react";
import { TriangleAlert } from "lucide-react";
import AddButton from "@/components/primitives/button/AddButton";
import CustomModal2 from "@/components/primitives/modal/CustomModal2";
import CustomTable from "@/components/data-display/table/CustomTable";
import { useHandleModalState } from "@/hooks/table/useHandleModalState";
import { useConfirm } from "@/hooks/useConfirm";
import { useBlogTypeList, useDeleteBlogType } from "../hooks/useBlogType";
import { IBlogType } from "../types/blog.types";
import AddBlogType from "./AddBlogType";
import EditBlogType from "./EditBlogType";
import { getBlogTypeColumns } from "./blog-type.columns";

// Same sizing as the category forms: near full-width on phones, capped at a
// comfortable width for a short form. `p-0` lets the sticky header sit flush.
const FORM_MODAL_WIDTH = "w-[calc(100vw-1.5rem)] max-w-xl p-0";
// Keeps the modal clear of the fixed 5rem admin navbar.
const FORM_MODAL_HEIGHT = "max-h-[calc(100dvh-9rem)] scrollbar-brand";

/** Manages the filter tabs shown on the public blog listing. */
export default function BlogTypes() {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const { modalData, isOpen, handleOpen, handleClose } =
    useHandleModalState<IBlogType>();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { blogTypes, meta, isBlogTypeLoading, refetchBlogType } =
    useBlogTypeList({
      page: currentPage,
      limit: pageSize,
      search: searchTerm,
      sortOrder,
    });

  const { deleteBlogType } = useDeleteBlogType();
  const { confirmDelete } = useConfirm();

  const handleDeleteClick = (data: IBlogType) => {
    const blogCount = data.blogCount ?? 0;

    // The API deletes a type's posts along with it, so spell out what goes
    // before the admin confirms.
    confirmDelete({
      title: `Delete "${data.name}"?`,
      description: "This action cannot be undone.",
      confirmLabel: blogCount ? "Delete type & posts" : "Delete",
      children: blogCount ? (
        <div className="flex items-start gap-2.5 rounded-lg border border-warningPrimary-200 bg-warningPrimary-100 p-3 text-left text-sm text-warningPrimary-700">
          <TriangleAlert size={18} className="mt-0.5 shrink-0" />
          <p>
            <span className="font-semibold">
              {blogCount} {blogCount === 1 ? "post" : "posts"}
            </span>{" "}
            under this type will also be permanently deleted, along with
            their comments and cover images.
          </p>
        </div>
      ) : undefined,
      onConfirm: () => deleteBlogType(data.id),
    });
  };

  const columns = getBlogTypeColumns(
    (row) => handleOpen("edit", row),
    (row) => handleDeleteClick(row),
  );

  return (
    <section className="flex flex-col gap-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xl font-semibold text-neutralPrimary-700 sm:text-2xl">
          Blog Types
        </p>
        <AddButton label="Add Blog Type" setOpen={setOpenModal} />

        <CustomModal2
          open={openModal}
          onOpenChange={setOpenModal}
          dialogWidth={FORM_MODAL_WIDTH}
          dialogHeight={FORM_MODAL_HEIGHT}
          hasOwnTitle
        >
          <AddBlogType setOpen={setOpenModal} refetch={refetchBlogType} />
        </CustomModal2>
      </section>

      <CustomTable<IBlogType>
        data={blogTypes}
        columns={columns}
        isLoading={isBlogTypeLoading}
        pageCount={meta?.totalPages || 1}
        totalItems={meta?.totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        onSearchChange={setSearchTerm}
        onSortChange={(_field, order) => setSortOrder(order)}
        searchPlaceholder="Search blog types..."
      />

      <CustomModal2
        open={isOpen("edit")}
        onOpenChange={handleClose}
        dialogWidth={FORM_MODAL_WIDTH}
        dialogHeight={FORM_MODAL_HEIGHT}
        hasOwnTitle
      >
        <EditBlogType
          data={modalData}
          setOpen={handleClose}
          onClose={handleClose}
          refetch={refetchBlogType}
        />
      </CustomModal2>
    </section>
  );
}
