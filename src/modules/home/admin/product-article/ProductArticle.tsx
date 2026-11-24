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
import { ProductArticleColumns } from "./product-article.columns";
import AddProductArticle from "./AddProductArticle";
import EditProductArticle from "./EditProductArticle";

export default function ProductArticle() {
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
    `/home-content/all-home-content/PRODUCT_ARTICLE`,
    [
      "getAllProductArticle",
      String(currentPage),
      String(pageSize),
      searchTerm,
      sortOrder,
    ],
    queryParams,
  );

  const { mutateAsync: deleteProductArticle } = useDelete(
    "getAllProductArticle",
  );
  const { confirmDelete } = useConfirm();

  const handleDeleteClick = (data: IHomeContent) =>
    confirmDelete({
      itemName: "product article",
      description: `${data.title ? `"${data.title}"` : "This article"} will be removed from the home page. This action cannot be undone.`,
      onConfirm: () => deleteProductArticle(`/home-content/delete/${data.id}`),
    });

  // * ============ TABLE COLUMNS ==============
  const columns = ProductArticleColumns(
    (row) => handleOpen("edit", row), // Edit
    (row) => handleDeleteClick(row), // Delete
  );

  return (
    <section className="flex flex-col gap-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xl font-semibold text-neutralPrimary-700 sm:text-2xl">
          Product Article
        </p>
        <AddButton label="Add Product Article" setOpen={setOpenModal} />

        <CustomModal2
          dialogHeight={HOME_MODAL_DIALOG_CLASS}
          dialogWidth={HOME_MODAL_DIALOG_WIDTH}
          open={openModal}
          onOpenChange={setOpenModal}
        >
          <AddProductArticle
            setOpen={setOpenModal}
            refetch={refetchHomeContent}
          />
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
        <EditProductArticle
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
