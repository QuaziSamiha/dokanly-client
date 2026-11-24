"use client";
import AddButton from "@/components/primitives/button/AddButton";
import { useDelete } from "@/hooks/api/useDelete";
import { useGetAll } from "@/hooks/api/useGet";
import { IPaginationMeta } from "@/types";
import { IFreeDelivery } from "@/modules/free-delivery/types/free-delivery.types";
import React, { useState } from "react";
import {
  FreeDeliveryColumns,
  StatusPill,
  formatAmount,
} from "./free-delivery.columns";
import { useHandleModalState } from "@/hooks/table/useHandleModalState";
import CustomTable from "@/components/data-display/table/CustomTable";
import CustomModal2 from "@/components/primitives/modal/CustomModal2";
import AddFreeDelivery from "./AddFreeDelivery";
import EditFreeDelivery from "./EditFreeDelivery";
import ConfirmModal from "@/components/primitives/modal/ConfirmModal";

// Same form modal sizing as the Category page: near full-width on phones,
// capped at 576px from tablets up, and kept clear of the fixed admin navbar.
const FORM_MODAL_WIDTH = "w-[calc(100vw-1.5rem)] max-w-xl p-0";
const FORM_MODAL_HEIGHT = "max-h-[calc(100dvh-9rem)] scrollbar-brand";

export default function FreeDeliverySettings() {
  const [openModal, setOpenModal] = useState<boolean>(false);

  const { modalData, isOpen, handleOpen, handleClose } =
    useHandleModalState<IFreeDelivery>();

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
    data: FreeDeliveryData,
    isLoading: isFreeDeliveryLoading,
    refetch: refetchFreeDelivery,
  } = useGetAll<{ data: IFreeDelivery[]; meta: IPaginationMeta }>(
    `/free-delivery-settings/all-free-deliveries`,
    [
      "getAllFreeDelivery",
      String(currentPage),
      String(pageSize),
      searchTerm,
      sortOrder,
    ],
    queryParams,
  );

  const { mutate: deleteFreeDelivery, isPending: isDeletePending } =
    useDelete("getAllFreeDelivery");

  // The row waiting for delete confirmation; null keeps the modal closed.
  const [deleteTarget, setDeleteTarget] = useState<IFreeDelivery | null>(null);

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteFreeDelivery(
      `/free-delivery-settings/delete-free-delivery/${deleteTarget.id}`,
      { onSuccess: () => setDeleteTarget(null) },
    );
  };

  // * ============ TABLE COLUMNS ==============
  const columns = FreeDeliveryColumns(
    (row) => handleOpen("edit", row), // Edit
    (row) => setDeleteTarget(row), // Delete
  );
  return (
    <section className="flex flex-col gap-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xl font-semibold text-neutralPrimary-700 sm:text-2xl">
          Free Delivery Settings
        </p>
        <AddButton label="Add Free Delivery" setOpen={setOpenModal} />

        <CustomModal2
          open={openModal}
          onOpenChange={setOpenModal}
          dialogWidth={FORM_MODAL_WIDTH}
          dialogHeight={FORM_MODAL_HEIGHT}
          hasOwnTitle
        >
          <AddFreeDelivery
            setOpen={setOpenModal}
            refetch={refetchFreeDelivery}
          />
        </CustomModal2>
      </section>

      <CustomTable<IFreeDelivery>
        data={FreeDeliveryData?.data ?? []}
        columns={columns}
        isLoading={isFreeDeliveryLoading}
        pageCount={FreeDeliveryData?.meta?.totalPages || 1}
        totalItems={FreeDeliveryData?.meta?.totalItems}
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
        open={isOpen("edit")}
        onOpenChange={handleClose}
        dialogWidth="w-[calc(100vw-1.5rem)] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] max-w-5xl"
        dialogHeight="max-h-[85vh] sm:max-h-[80vh] xl:max-h-[70vh] scrollbar-brand"
      >
        <EditFreeDelivery
          data={modalData}
          setOpen={handleClose}
          onClose={handleClose}
          refetch={refetchFreeDelivery}
          isLoading={isFreeDeliveryLoading}
        />
      </CustomModal2>

      <ConfirmModal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isPending={isDeletePending}
        variant="danger"
        title="Delete free delivery setting?"
        description="This permanently removes the setting. Orders that already used it keep their delivery charge. This can't be undone."
        confirmLabel="Delete"
      >
        {deleteTarget && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-neutralPrimary-100 bg-neutralPrimary-50 px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutralPrimary-800">
                  Orders from {formatAmount(deleteTarget.minOrderAmount)}
                </p>
                {deleteTarget.description && (
                  <p className="truncate text-xs text-neutralPrimary-400">
                    {deleteTarget.description}
                  </p>
                )}
              </div>
              <StatusPill status={deleteTarget.status} />
            </div>
            {deleteTarget.status === "ACTIVE" && (
              <p className="rounded-lg bg-warningPrimary-100 px-3 py-2 text-xs text-warningPrimary-600">
                <span className="font-semibold">This is the active offer.</span>{" "}
                Checkout will stop offering free delivery until another setting
                is activated.
              </p>
            )}
          </div>
        )}
      </ConfirmModal>
    </section>
  );
}
