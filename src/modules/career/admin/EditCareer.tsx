"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeOff } from "lucide-react";
import CategoryFormDialog from "@/modules/category/admin/CategoryFormDialog";
import { IModal } from "@/types";
import { useUpdateCareer } from "../hooks/useCareer";
import {
  UpdateCareerSchema,
  UpdateCareerType,
} from "../schemas/career.schema";
import { IAdminCareer } from "../types/career.types";
import CareerFormFields from "./CareerFormFields";

/** Form field -> API field, for building a payload of the changed fields only. */
const API_FIELD: Record<keyof UpdateCareerType, string> = {
  position: "position",
  deadline: "deadline",
  jobType: "jobType",
  jobLocationType: "jobLocationType",
  location: "jobLocation",
  salary: "salary",
  overview: "jobOverview",
  responsibilities: "jobResponsibilities",
  requirements: "jobRequirements",
  facilities: "jobFacilities",
  status: "status",
};

export default function EditCareer({ setOpen, refetch, data }: IModal) {
  const job = data as IAdminCareer;

  const {
    control,
    trigger,
    handleSubmit,
    formState: { isDirty, dirtyFields },
  } = useForm<UpdateCareerType>({
    resolver: zodResolver(UpdateCareerSchema),
    defaultValues: {
      position: job?.position,
      deadline: job?.deadline,
      jobType: job?.jobType,
      jobLocationType: job?.jobLocationType ?? "",
      location: job?.jobLocation,
      salary: job?.salary ?? "",
      overview: job?.jobOverview ?? "",
      requirements: job?.jobRequirements,
      responsibilities: job?.jobResponsibilities,
      facilities: job?.jobFacilities ?? "",
      status: job?.status,
    },
  });

  const { updateCareer, isUpdating } = useUpdateCareer(() => {
    setOpen?.(false);
    refetch?.();
  });

  // * Save stays disabled until something changes, so only changed fields are sent.
  const onSubmit = (values: UpdateCareerType) => {
    const payload: Record<string, unknown> = {};
    (Object.keys(API_FIELD) as (keyof UpdateCareerType)[]).forEach((field) => {
      if (dirtyFields[field]) payload[API_FIELD[field]] = values[field] ?? "";
    });
    // * A cleared work mode is null, not "" (which is not a valid value).
    if (payload.jobLocationType === "") payload.jobLocationType = null;
    // * The server only edits an INACTIVE job when status is sent with the change.
    if (job?.status === "INACTIVE" && !payload.status) {
      payload.status = values.status;
    }

    updateCareer(job.id, payload);
  };

  return (
    <CategoryFormDialog
      title="Edit job"
      description={
        <>
          Update the details of{" "}
          <span className="font-medium text-neutralPrimary-700">{job?.position}</span>.
        </>
      }
      submitLabel="Save changes"
      pendingLabel="Saving…"
      isPending={isUpdating}
      submitDisabled={!isDirty}
      onSubmit={handleSubmit(onSubmit)}
      onClose={() => setOpen?.(false)}
    >
      {job?.status === "INACTIVE" && (
        <p className="flex items-start gap-2 rounded-lg border border-warningPrimary-200 bg-warningPrimary-50 px-3 py-2 text-xs text-warningPrimary-800">
          <EyeOff className="mt-px size-3.5 shrink-0" aria-hidden />
          <span>
            This job is inactive and hidden from the careers page. Set the status to Active to
            publish it again.
          </span>
        </p>
      )}
      <CareerFormFields control={control} trigger={trigger} showStatus />
    </CategoryFormDialog>
  );
}
