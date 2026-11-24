"use client";

import AddButton from "@/components/primitives/button/AddButton";
import CustomModal2 from "@/components/primitives/modal/CustomModal2";
import CustomTable from "@/components/data-display/table/CustomTable";
import { IPromotion } from "@/modules/promotion/types/promotion.types";
import React, { useState } from "react";
import AddPromotion from "./AddPromotion";
import { useHandleModalState } from "@/hooks/table/useHandleModalState";
import { useGetAll } from "@/hooks/api/useGet";
import { useDelete } from "@/hooks/api/useDelete";
import { useConfirm } from "@/hooks/useConfirm";
import { IPaginationMeta } from "@/types";
import { promotionColumns } from "./promotion.columns";
import ViewPromotion from "./ViewPromotion";
import EditPromotion from "./EditPromotion";

// The dialog has no max-width of its own, so these step from near full-width
// on phones down to a comfortable reading width on large screens.
const FORM_MODAL_WIDTH =
  "w-[calc(100vw-1.5rem)] sm:w-[85vw] md:w-[75vw] lg:w-[65vw] max-w-3xl";
const VIEW_MODAL_WIDTH =
  "w-[calc(100vw-1.5rem)] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] max-w-5xl";
// Keeps the modal clear of the fixed 5rem admin navbar: with CustomModal2's
// mt-8 offset this leaves a 1.5rem gap below the navbar and 2.5rem at the bottom.
const MODAL_HEIGHT = "max-h-[calc(100dvh-9rem)] scrollbar-brand";

export default function Promotions() {
  const [openModal, setOpenModal] = useState<boolean>(false);

  const { modalData, isOpen, handleOpen, handleClose } =
    useHandleModalState<IPromotion>();

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
    data: promotionData,
    isLoading: isPromotionLoading,
    refetch: refetchPromotion,
  } = useGetAll<{ data: IPromotion[]; meta: IPaginationMeta }>(
    `/promotions/all-promotions`,
    [
      "getAllPromotions",
      String(currentPage),
      String(pageSize),
      searchTerm,
      sortOrder,
    ],
    queryParams
  );

  const { mutateAsync: deletePromotion } = useDelete("getAllPromotions");
  const { confirmDelete } = useConfirm();

  const handleDeleteClick = (data: IPromotion) =>
    confirmDelete({
      title: `Archive coupon "${data.couponCode}"?`,
      description: "The code stops working right away, but it stays here for order history.",
      onConfirm: () =>
        deletePromotion(`/promotions/delete-promotion/${data.id}`),
    });

  const columns = promotionColumns(
    (row) => handleOpen("view", row),
    (row) => handleOpen("edit", row),
    (row) => handleDeleteClick(row)
  );
  return (
    <section className="flex flex-col gap-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xl font-semibold text-neutralPrimary-700 sm:text-2xl">
          Promotions
        </p>
        <AddButton label="Add Promotion" setOpen={setOpenModal} />

        <CustomModal2
          open={openModal}
          onOpenChange={setOpenModal}
          dialogWidth={FORM_MODAL_WIDTH}
          dialogHeight={MODAL_HEIGHT}
        >
          <AddPromotion setOpen={setOpenModal} refetch={refetchPromotion} />
        </CustomModal2>
      </section>

      <CustomTable<IPromotion>
        data={Array.isArray(promotionData?.data) ? promotionData.data : []}
        columns={columns}
        isLoading={isPromotionLoading}
        pageCount={promotionData?.meta?.totalPages || 1}
        totalItems={promotionData?.meta?.totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        onSearchChange={setSearchTerm}
        onSortChange={(field, order) => {
          // console.log("Sort:", field, order);
          setSortOrder(order);
        }}
        searchPlaceholder="Search code, title, status or type..."
      />

      <CustomModal2
        open={isOpen("view")}
        onOpenChange={handleClose}
        dialogWidth={VIEW_MODAL_WIDTH}
        dialogHeight={MODAL_HEIGHT}
      >
        <ViewPromotion data={modalData} onClose={handleClose} />
      </CustomModal2>
      <CustomModal2
        open={isOpen("edit")}
        onOpenChange={handleClose}
        dialogWidth={FORM_MODAL_WIDTH}
        dialogHeight={MODAL_HEIGHT}
      >
        <EditPromotion
          data={modalData}
          setOpen={handleClose}
          onClose={handleClose}
          refetch={refetchPromotion}
          isLoading={isPromotionLoading}
        />
      </CustomModal2>
    </section>
  );
}
