"use client";

import React, { useState } from "react";
import AddButton from "@/components/primitives/button/AddButton";
import CustomModal2 from "@/components/primitives/modal/CustomModal2";
import CustomTable from "@/components/data-display/table/CustomTable";
import { useHandleModalState } from "@/hooks/table/useHandleModalState";
import { getMediaNewsColumns } from "./media-news.columns";
import { useMediaNewsList, useSoftDeleteMediaNews } from "../hooks/useMediaNews";
import { IMediaNews } from "../types/media-news.types";
import AddMediaNews from "./AddMediaNews";
import EditMediaNews from "./EditMediaNews";
import ViewMediaNews from "./ViewMediaNews";

export default function AdminMediaNews() {
  const [openModal, setOpenModal] = useState<boolean>(false);

  const { modalData, isOpen, handleOpen, handleClose } =
    useHandleModalState<IMediaNews>();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { mediaNews, meta, isMediaNewsLoading, refetchMediaNews } =
    useMediaNewsList({
      page: currentPage,
      limit: pageSize,
      search: searchTerm,
      sortOrder,
    });

  const { softDeleteMediaNews } = useSoftDeleteMediaNews(refetchMediaNews);

  // * ============ HANDLE SOFT DELETE ==============
  const handleDeleteClick = (data: IMediaNews) => {
    softDeleteMediaNews(data.id);
  };

  // * ============ TABLE COLUMNS ==============
  const columns = getMediaNewsColumns(
    (row) => handleOpen("view", row), // View
    (row) => handleOpen("edit", row), // Edit
    (row) => handleDeleteClick(row), // Soft delete
  );

  return (
    <section className="flex flex-col gap-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xl font-semibold text-neutralPrimary-700 sm:text-2xl">
          Media & News
        </p>
        <AddButton label="Add Media & News" setOpen={setOpenModal} />

        <CustomModal2
          open={openModal}
          onOpenChange={setOpenModal}
          dialogWidth="w-[60vw]"
          dialogHeight="lg:h-[80vh] xl:h-[70vh]"
        >
          <AddMediaNews setOpen={setOpenModal} refetch={refetchMediaNews} />
        </CustomModal2>
      </section>

      <CustomTable<IMediaNews>
        data={mediaNews}
        columns={columns}
        isLoading={isMediaNewsLoading}
        pageCount={meta?.totalPages || 1}
        totalItems={meta?.totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        onSearchChange={setSearchTerm}
        onSortChange={(field, order) => {
          setSortOrder(order);
        }}
        searchPlaceholder="Search by ..."
      />

      <CustomModal2
        open={isOpen("view")}
        onOpenChange={handleClose}
        dialogHeight="lg:h-[80vh] xl:h-[70vh]"
      >
        <ViewMediaNews data={modalData} onClose={handleClose} />
      </CustomModal2>

      <CustomModal2
        open={isOpen("edit")}
        onOpenChange={handleClose}
        dialogHeight="lg:h-[80vh] xl:h-[70vh]"
      >
        <EditMediaNews
          data={modalData}
          setOpen={handleClose}
          onClose={handleClose}
          refetch={refetchMediaNews}
          isLoading={isMediaNewsLoading}
        />
      </CustomModal2>
    </section>
  );
}
