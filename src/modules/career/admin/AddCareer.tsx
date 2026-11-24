"use client";

import React from "react";
import { Control, useForm, UseFormTrigger } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CategoryFormDialog from "@/modules/category/admin/CategoryFormDialog";
import { IModal } from "@/types";
import { useCreateCareer } from "../hooks/useCareer";
import {
  CreateCareerSchema,
  CreateCareerType,
  UpdateCareerType,
} from "../schemas/career.schema";
import CareerFormFields from "./CareerFormFields";

export default function AddCareer({ setOpen, refetch }: IModal) {
  const { control, trigger, handleSubmit } = useForm<CreateCareerType>({
    resolver: zodResolver(CreateCareerSchema),
    defaultValues: {
      position: "",
      deadline: "",
      jobType: "",
      jobLocationType: "",
      location: "",
      salary: "",
      overview: "",
      requirements: "",
      responsibilities: "",
      facilities: "",
    },
  });

  const { createCareer, isCreating } = useCreateCareer(() => {
    setOpen?.(false);
    refetch?.();
  });

  const onSubmit = (data: CreateCareerType) => {
    createCareer({
      position: data.position,
      deadline: data.deadline,
      jobType: data.jobType,
      jobLocationType: data.jobLocationType || undefined,
      jobLocation: data.location,
      salary: data.salary || undefined,
      jobOverview: data.overview || undefined,
      jobResponsibilities: data.responsibilities,
      jobRequirements: data.requirements,
      jobFacilities: data.facilities || undefined,
    });
  };

  return (
    <CategoryFormDialog
      title="Add job opening"
      description="The job goes live on the careers page as soon as it is saved and stays there until the deadline."
      submitLabel="Publish job"
      pendingLabel="Publishing…"
      isPending={isCreating}
      onSubmit={handleSubmit(onSubmit)}
      onClose={() => setOpen?.(false)}
    >
      <CareerFormFields
        control={control as unknown as Control<UpdateCareerType>}
        trigger={trigger as unknown as UseFormTrigger<UpdateCareerType>}
      />
    </CategoryFormDialog>
  );
}
