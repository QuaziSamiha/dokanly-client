"use client";

import AddButton from "@/components/primitives/button/AddButton";
import React, { useState } from "react";
import { HeroSliderColumns } from "./hero-slider.columns";
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
import AddHeroSlider from "./AddHeroSlider";
import { useDelete } from "@/hooks/api/useDelete";
import { useConfirm } from "@/hooks/useConfirm";
import EditHeroSlider from "./EditHeroSlider";

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
    data: homeContentData,
    isLoading: isHomeContentLoading,
    refetch: refetchHomeContent,
  } = useGetAll<{ data: IHomeContent[]; meta: IMeta }>(
    `/home-content/all-home-content/HERO_SLIDER`,
    [
      "getAllHeroContent",
      String(currentPage),
      String(pageSize),
      searchTerm,
      sortOrder,
    ],
    queryParams,
  );

  const { mutateAsync: deleteHeroContent } = useDelete("getAllHeroContent");
  const { confirmDelete } = useConfirm();

  const handleDeleteClick = (data: IHomeContent) =>
    confirmDelete({
      itemName: "slide",
      description: `${data.title ? `"${data.title}"` : "This slide"} will be removed from the home page. This action cannot be undone.`,
      onConfirm: () => deleteHeroContent(`/home-content/delete/${data.id}`),
    });

  // * ============ TABLE COLUMNS ==============
  const columns = HeroSliderColumns(
    (row) => handleOpen("edit", row), // Edit
    (row) => handleDeleteClick(row), // Delete
  );

  return (
    <section className="flex flex-col gap-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xl font-semibold text-neutralPrimary-700 sm:text-2xl">
          Hero Slider
        </p>
        <AddButton label="Add Hero Slider" setOpen={setOpenModal} />

        <CustomModal2
          dialogHeight={HOME_MODAL_DIALOG_CLASS}
          dialogWidth={HOME_MODAL_DIALOG_WIDTH}
          open={openModal}
          onOpenChange={setOpenModal}
        >
          <AddHeroSlider setOpen={setOpenModal} refetch={refetchHomeContent} />
        </CustomModal2>
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
        <EditHeroSlider
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
