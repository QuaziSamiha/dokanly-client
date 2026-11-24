"use client";

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
import { PlatformRedirectColumns } from "./platform-redirect.columns";
import EditPlatformRedirect from "./EditPlatformRedirect";

export default function HeroSlider() {
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
    data: platformRedirectData,
    isLoading: isPlatformRedirectLoading,
    refetch: refetchPlatformRedirect,
  } = useGetAll<{ data: IHomeContent[]; meta: IMeta }>(
    `/home-content/all-home-content/PLATFORM_REDIRECT`,
    [
      "getAllSocialMediaContent",
      String(currentPage),
      String(pageSize),
      searchTerm,
      sortOrder,
    ],
    queryParams,
  );

  // * ============ TABLE COLUMNS ==============
  const columns = PlatformRedirectColumns((row) => handleOpen("edit", row));

  return (
    <section className="flex flex-col gap-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xl font-semibold text-neutralPrimary-700 sm:text-2xl">
          Platform Redirect
        </p>
      </section>

      <CustomTable<IHomeContent>
        data={platformRedirectData?.data ?? []}
        columns={columns}
        isLoading={isPlatformRedirectLoading}
        pageCount={platformRedirectData?.meta?.totalPages || 1}
        totalItems={platformRedirectData?.meta?.totalItems}
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
        <EditPlatformRedirect
          data={modalData}
          setOpen={handleClose}
          onClose={handleClose}
          refetch={refetchPlatformRedirect}
          isLoading={isPlatformRedirectLoading}
        />
      </CustomModal2>
    </section>
  );
}
