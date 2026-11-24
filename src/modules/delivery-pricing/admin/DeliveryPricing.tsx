"use client";

import { useGetAll } from "@/hooks/api/useGet";
import { useHandleModalState } from "@/hooks/table/useHandleModalState";
import React, { useState } from "react";
import { deliveryPricingColumns } from "./delivery-pricing.columns";
import { IDeliveryPricing } from "@/modules/delivery-pricing/types/delivery-pricing.types";
import { IPaginationMeta } from "@/types";
import CustomTable from "@/components/data-display/table/CustomTable";
import CustomModal2 from "@/components/primitives/modal/CustomModal2";
import EditDeliveryPricing from "./EditDeliveryPricing";

export default function DeliveryPricing() {
  const { modalData, isOpen, handleOpen, handleClose } =
    useHandleModalState<IDeliveryPricing>();

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
    data: deliveryPricingData,
    isLoading: isDeliveryPricingLoading,
    refetch: refetchDeliveryPricing,
  } = useGetAll<{ data: IDeliveryPricing[]; meta: IPaginationMeta }>(
    `/delivery-pricing`,
    [
      "getDeliveryPricing",
      String(currentPage),
      String(pageSize),
      searchTerm,
      sortOrder,
    ],
    queryParams
  );

  const columns = deliveryPricingColumns(
    (row) => handleOpen("view", row),
    (row) => handleOpen("edit", row)
  );

  const deliveryPricing = Array.isArray(deliveryPricingData?.data)
    ? deliveryPricingData.data
    : [];
  return (
    <section className="flex flex-col gap-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xl font-semibold text-neutralPrimary-700 sm:text-2xl">
          Delivery Pricing
        </p>
        {/* <AddButton label="Add Delivery Pricing" setOpen={setOpenModal} />

        <CustomModal2
          open={openModal}
          onOpenChange={setOpenModal}
          dialogWidth="w-[60vw]"
          // dialogHeight="h-[80vh]"
        >
          <AddDeliveryPricing
            setOpen={setOpenModal}
            refetch={refetchDeliveryPricing}
          />
        </CustomModal2> */}
      </section>

      <CustomTable<IDeliveryPricing>
        data={deliveryPricing}
        columns={columns}
        isLoading={isDeliveryPricingLoading}
        pageCount={deliveryPricingData?.meta?.totalPages || 1}
        totalItems={deliveryPricingData?.meta?.totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        onSearchChange={setSearchTerm}
        onSortChange={(field, order) => {
          // console.log("Sort:", field, order);
          setSortOrder(order);
        }}
      />

      <CustomModal2
        open={isOpen("edit")}
        onOpenChange={handleClose}
        dialogWidth="w-[calc(100vw-1.5rem)] sm:w-[85vw] md:w-[70vw] lg:w-[55vw] xl:w-[45vw] max-w-3xl"
        dialogHeight="max-h-[min(85vh,calc(100dvh-7rem))] sm:max-h-[min(80vh,calc(100dvh-7rem))] scrollbar-brand"
      >
        <EditDeliveryPricing
          data={modalData}
          setOpen={handleClose}
          onClose={handleClose}
          refetch={refetchDeliveryPricing}
          isLoading={isDeliveryPricingLoading}
        />
      </CustomModal2>
    </section>
  );
}
