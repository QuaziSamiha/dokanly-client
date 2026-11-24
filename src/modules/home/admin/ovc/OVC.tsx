"use client";

import AddButton from "@/components/primitives/button/AddButton";
import React, { useState } from "react";
import { IHomeContent } from "@/modules/home/types/home-content.types";
import { useHandleModalState } from "@/hooks/table/useHandleModalState";
import CustomTable from "@/components/data-display/table/CustomTable";
import { useGetAll } from "@/hooks/api/useGet";
import { IMeta } from "@/types";
import CustomModal2 from "@/components/primitives/modal/CustomModal2";
import {
  HOME_MODAL_DIALOG_CLASS,
  HOME_MODAL_DIALOG_WIDTH,
} from "@/modules/home/constants/home-modal.constants";
import { useDelete } from "@/hooks/api/useDelete";
import { useConfirm } from "@/hooks/useConfirm";
import { OvcColumns } from "./ovc.columns";
import AddOvc from "./AddOvc";
import EditOvc from "./EditOvc";

export default function HeroSlider() {
  const [openModal, setOpenModal] = useState<boolean>(false);

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
    data: ovcData,
    isLoading: isOVCLoading,
    refetch: refetchOVC,
  } = useGetAll<{ data: IHomeContent[]; meta: IMeta }>(
    `/home-content/all-home-content/OVC`,
    [
      "getAllOvcContent",
      String(currentPage),
      String(pageSize),
      searchTerm,
      sortOrder,
    ],
    queryParams,
  );

  const { mutateAsync: deleteOvcContent } = useDelete("getAllOvcContent");
  const { confirmDelete } = useConfirm();

  const handleDeleteClick = (data: IHomeContent) =>
    confirmDelete({
      itemName: "OVC item",
      description: `${data.title ? `"${data.title}"` : "This item"} will be removed from the home page. This action cannot be undone.`,
      onConfirm: () => deleteOvcContent(`/home-content/delete/${data.id}`),
    });

  // * ============ TABLE COLUMNS ==============
  const columns = OvcColumns(
    (row) => handleOpen("edit", row), // Edit
    (row) => handleDeleteClick(row), // Delete
  );

  return (
    <section className="flex flex-col gap-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xl font-semibold text-neutralPrimary-700 sm:text-2xl">OVC</p>
        <AddButton label="Add OVC" setOpen={setOpenModal} />

        <CustomModal2
          dialogHeight={HOME_MODAL_DIALOG_CLASS}
          dialogWidth={HOME_MODAL_DIALOG_WIDTH}
          open={openModal}
          onOpenChange={setOpenModal}
        >
          <AddOvc setOpen={setOpenModal} refetch={refetchOVC} />
        </CustomModal2>
      </section>

      <CustomTable<IHomeContent>
        data={ovcData?.data ?? []}
        columns={columns}
        isLoading={isOVCLoading}
        pageCount={ovcData?.meta?.totalPages || 1}
        totalItems={ovcData?.meta?.totalItems}
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
        <EditOvc
          data={modalData}
          setOpen={handleClose}
          onClose={handleClose}
          refetch={refetchOVC}
          isLoading={isOVCLoading}
        />
      </CustomModal2>
    </section>
  );
}
