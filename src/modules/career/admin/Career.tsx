"use client";

import React, { useState } from "react";
import AddButton from "@/components/primitives/button/AddButton";
import ConfirmModal from "@/components/primitives/modal/ConfirmModal";
import CustomModal2 from "@/components/primitives/modal/CustomModal2";
import CustomTable from "@/components/data-display/table/CustomTable";
import { useHandleModalState } from "@/hooks/table/useHandleModalState";
import { getCareerColumns } from "./career.columns";
import { useCareerList, useDeleteCareer } from "../hooks/useCareer";
import { IAdminCareer } from "../types/career.types";
import AddCareer from "./AddCareer";
import AllApplications from "./AllApplications";
import EditCareer from "./EditCareer";

// Forms: near full-width on phones, a comfortable reading width on large
// screens. `p-0` lets the form's sticky header and footer sit flush.
const FORM_MODAL_WIDTH =
  "w-[calc(100vw-1.5rem)] sm:w-[85vw] md:w-[75vw] lg:w-[65vw] max-w-3xl p-0";
// Keeps the modal clear of the fixed 5rem admin navbar: with CustomModal2's
// mt-8 offset this leaves a 1.5rem gap below the navbar and 2.5rem at the bottom.
const FORM_MODAL_HEIGHT = "max-h-[calc(100dvh-9rem)] scrollbar-brand";
const MODAL_WIDTH = "w-[calc(100vw-2rem)] max-w-4xl sm:max-w-4xl";

export default function Career() {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [applicationsJob, setApplicationsJob] = useState<IAdminCareer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IAdminCareer | null>(null);
  const { modalData, isOpen, handleOpen, handleClose } =
    useHandleModalState<IAdminCareer>();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { careers, meta, isCareerLoading, refetchCareer } = useCareerList({
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
    sortOrder,
  });

  const { deleteCareer, isDeletingCareer } = useDeleteCareer();

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteCareer(deleteTarget.id, () => setDeleteTarget(null));
  };

  // * ============ TABLE COLUMNS ==============
  const columns = getCareerColumns(
    (row) => handleOpen("edit", row),
    (row) => setDeleteTarget(row),
    (row) => setApplicationsJob(row),
  );

  const deleteCount = deleteTarget?.applicationCount ?? 0;

  return (
    <section className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xl font-semibold text-neutralPrimary-700 sm:text-2xl">Jobs</p>
          <p className="text-sm text-neutralPrimary-500">
            Live jobs appear on the careers page until their deadline.
          </p>
        </div>
        <AddButton label="Add Job Opening" setOpen={setOpenModal} />
      </section>

      <CustomTable<IAdminCareer>
        data={careers}
        columns={columns}
        isLoading={isCareerLoading}
        pageCount={meta?.totalPages || 1}
        totalItems={meta?.totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        onSearchChange={(value) => {
          setSearchTerm(value);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search by position or location"
        onSortChange={(_field, order) => setSortOrder(order)}
      />

      <CustomModal2
        open={openModal}
        onOpenChange={setOpenModal}
        dialogWidth={FORM_MODAL_WIDTH}
        dialogHeight={FORM_MODAL_HEIGHT}
        hasOwnTitle
      >
        <AddCareer setOpen={setOpenModal} refetch={refetchCareer} />
      </CustomModal2>

      <CustomModal2
        open={isOpen("edit")}
        onOpenChange={handleClose}
        dialogWidth={FORM_MODAL_WIDTH}
        dialogHeight={FORM_MODAL_HEIGHT}
        hasOwnTitle
      >
        <EditCareer
          // * Remount per job, so the form's defaults are that job's values.
          key={modalData?.id}
          data={modalData}
          setOpen={handleClose}
          onClose={handleClose}
          refetch={refetchCareer}
        />
      </CustomModal2>

      <CustomModal2
        open={Boolean(applicationsJob)}
        onOpenChange={(open) => !open && setApplicationsJob(null)}
        dialogWidth={MODAL_WIDTH}
      >
        {applicationsJob && (
          <AllApplications
            data={applicationsJob}
            setOpen={() => setApplicationsJob(null)}
            refetch={refetchCareer}
          />
        )}
      </CustomModal2>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        isPending={isDeletingCareer}
        title="Delete this job?"
        confirmLabel="Delete job"
        description={
          deleteCount > 0
            ? `This also deletes its ${deleteCount} ${deleteCount === 1 ? "application" : "applications"} and their resumes. This cannot be undone.`
            : "The job will be removed from the careers page. This cannot be undone."
        }
      >
        {deleteTarget && (
          <p className="rounded-lg bg-neutralPrimary-100 px-3 py-2 text-sm font-semibold text-neutralPrimary-800">
            {deleteTarget.position}
          </p>
        )}
      </ConfirmModal>
    </section>
  );
}
