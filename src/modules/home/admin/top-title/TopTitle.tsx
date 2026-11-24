"use client";

import { useGetAll } from "@/hooks/api/useGet";
import { IPaginationMeta } from "@/types";
import { IHomeContent } from "@/modules/home/types/home-content.types";
import React, { useState } from "react";
import { TopTitleColumns } from "./top-title.columns";
import { useHandleModalState } from "@/hooks/table/useHandleModalState";
import CustomTable from "@/components/data-display/table/CustomTable";
import CustomModal2 from "@/components/primitives/modal/CustomModal2";
import {
  HOME_MODAL_DIALOG_CLASS,
  HOME_MODAL_DIALOG_WIDTH,
} from "@/modules/home/constants/home-modal.constants";
import EditTopTitle from "./EditTopTitle";

export default function TopTitle() {
  const { modalData, isOpen, handleOpen, handleClose } =
    useHandleModalState<IHomeContent>();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const queryParams = {
    page: currentPage,
    limit: pageSize,
    search: searchTerm || undefined,
    sortOrder: sortOrder || undefined,
  };

  const {
    data: homeContentData,
    isLoading: isHomeContentLoading,
    refetch: refetchHomeContent,
  } = useGetAll<{ data: IHomeContent[]; meta: IPaginationMeta }>(
    `/home-content/all-home-content/PROMOTION_BAR`,
    [
      "getAllTopTitle",
      String(currentPage),
      String(pageSize),
      searchTerm,
      sortOrder,
    ],
    queryParams,
  );
  // * ============ TABLE COLUMNS ==============
  const columns = TopTitleColumns((row) => handleOpen("edit", row));

  return (
    <section className="flex flex-col gap-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xl font-semibold text-neutralPrimary-700 sm:text-2xl">
          Top Title
        </p>
      </section>

      <CustomTable<IHomeContent>
        data={homeContentData?.data ?? []}
        columns={columns}
        isLoading={isHomeContentLoading}
        pageCount={homeContentData?.meta?.totalPages || 1}
        totalItems={homeContentData?.meta?.totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        onSearchChange={setSearchTerm}
        onSortChange={(field, order) => {
          // console.log("Sort:", field, order);
          setSortOrder(order);
        }}
        showSearchbar={false}
      />

      <CustomModal2
        dialogHeight={HOME_MODAL_DIALOG_CLASS}
        dialogWidth={HOME_MODAL_DIALOG_WIDTH}
        open={isOpen("edit")}
        onOpenChange={handleClose}
      >
        <EditTopTitle
          data={modalData}
          setOpen={handleClose}
          onClose={handleClose}
          refetch={refetchHomeContent}
          isLoading={isHomeContentLoading}
        />
      </CustomModal2>
    </section>
  );
}
