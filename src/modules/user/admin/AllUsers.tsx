"use client";

import { useGetAll } from "@/hooks/api/useGet";
import { IPaginationMeta } from "@/types";
import { IUser } from "@/modules/user/types/user.types";
import React, { useState } from "react";
import { getUserColumns } from "./user.columns";
import CustomTable from "@/components/data-display/table/CustomTable";
import CustomModal2 from "@/components/primitives/modal/CustomModal2";
import ViewUser from "./ViewUser";
import EditUser from "./EditUser";
import { useHandleModalState } from "@/hooks/table/useHandleModalState";

const VIEW_MODAL_WIDTH =
  "w-[calc(100vw-1.5rem)] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] max-w-5xl";
const FORM_MODAL_WIDTH = "w-[calc(100vw-1.5rem)] max-w-xl p-0";
// Keeps the modal clear of the fixed 5rem admin navbar: with CustomModal2's
// mt-8 offset this leaves a 1.5rem gap below the navbar and 2.5rem at the bottom.
const FORM_MODAL_HEIGHT = "max-h-[calc(100dvh-9rem)] scrollbar-brand";

export default function AllUsers() {
  //   const [openModal, setOpenModal] = useState<boolean>(false);
  const { modalData, isOpen, handleOpen, handleClose } =
    useHandleModalState<IUser>();

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
    data: userData,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = useGetAll<{ data: IUser[]; meta: IPaginationMeta }>(
    `/users`,
    [
      "getAllUsers",
      String(currentPage),
      String(pageSize),
      searchTerm,
      sortOrder,
    ],
    queryParams
  );

  const columns = getUserColumns(
    (row) => handleOpen("view", row),
    (row) => handleOpen("edit", row)
  );
  return (
    <section className="flex flex-col gap-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xl font-semibold text-neutralPrimary-700 sm:text-2xl">Users</p>
        {/* <AddButton label="Add Category" setOpen={setOpenModal} /> */}

        {/* <CustomModal2
            open={openModal}
            onOpenChange={setOpenModal}
            dialogWidth="w-[60vw]"
          >
            <AddCategory setOpen={setOpenModal} refetch={refetchCategory} />
          </CustomModal2> */}
      </section>

      <CustomTable<IUser>
        data={Array.isArray(userData?.data) ? userData.data : []}
        columns={columns}
        isLoading={isUserLoading}
        pageCount={userData?.meta?.totalPages || 1}
        totalItems={userData?.meta?.totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        onSearchChange={setSearchTerm}
        onSortChange={(field, order) => {
          setSortOrder(order);
        }}
        searchPlaceholder="Search by name, email..." //? === ALSO CAN BE SEARCH BY PHONE =======
      />

      <CustomModal2
        open={isOpen("view")}
        onOpenChange={handleClose}
        dialogWidth={VIEW_MODAL_WIDTH}
        dialogHeight="max-h-[85vh] sm:max-h-[80vh] xl:max-h-[70vh] scrollbar-brand"
      >
        <ViewUser data={modalData} onClose={handleClose} />
      </CustomModal2>

      <CustomModal2
        open={isOpen("edit")}
        onOpenChange={handleClose}
        dialogWidth={FORM_MODAL_WIDTH}
        dialogHeight={FORM_MODAL_HEIGHT}
        hasOwnTitle
      >
        <EditUser
          data={modalData}
          setOpen={handleClose}
          onClose={handleClose}
          refetch={refetchUser}
          isLoading={isUserLoading}
        />
      </CustomModal2>
    </section>
  );
}
