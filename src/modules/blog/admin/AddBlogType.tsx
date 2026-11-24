"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CheckboxField } from "@/components/form/CheckboxField";
import InputField from "@/components/form/InputField";
import SingleSelectSearch from "@/components/form/SingleSelectSearch";
import TextAreaField from "@/components/form/TextAreaField";
import CategoryFormDialog from "@/modules/category/admin/CategoryFormDialog";
import { IModal } from "@/types";
import { BLOG_TYPE_STATUS_OPTIONS } from "../constants/blog.constants";
import { useCreateBlogType } from "../hooks/useBlogType";
import {
  CreateBlogTypeSchema,
  CreateBlogTypeType,
} from "../schemas/blog.schema";

export default function AddBlogType({ setOpen, refetch }: IModal) {
  const {
    control,
    trigger,
    handleSubmit,
    reset,
    setValue,
    getValues,
  } = useForm({
    resolver: zodResolver(CreateBlogTypeSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "ACTIVE",
      sortOrder: null,
      isDefault: false,
    },
  });

  const { createBlogType, isCreatingType } = useCreateBlogType(() => {
    reset();
    setOpen?.(false);
    refetch?.();
  });

  const onSubmit = (data: CreateBlogTypeType) => {
    const payload: Record<string, unknown> = {
      name: data.name,
      status: data.status,
      isDefault: Boolean(data.isDefault),
    };

    if (data.description) payload.description = data.description;

    // Checked against `number` rather than truthiness: 0 is a valid tab order
    // and a truthy test would silently drop it. `null` means "not set".
    if (typeof data.sortOrder === "number") payload.sortOrder = data.sortOrder;

    createBlogType(payload);
  };

  return (
    <CategoryFormDialog
      title="New blog type"
      description="Types group posts and show up as the filter tabs on the blog page."
      submitLabel="Save type"
      pendingLabel="Saving…"
      isPending={isCreatingType}
      onSubmit={handleSubmit(onSubmit)}
      onClose={() => setOpen?.(false)}
    >
      <InputField
        labelName="Name"
        placeholderText="e.g. Hair Care"
        name="name"
        control={control}
        trigger={trigger}
        isRequired
      />

      <div className="flex flex-col gap-2">
        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
          <SingleSelectSearch
            labelName="Status"
            name="status"
            control={control}
            options={BLOG_TYPE_STATUS_OPTIONS}
            isRequired
          />
          <InputField
            labelName="Tab Order"
            placeholderText="e.g. 1"
            name="sortOrder"
            inputType="number"
            control={control}
            trigger={trigger}
          />
        </div>
        <p className="text-xs text-neutralPrimary-400">
          Lower numbers come first among the blog&apos;s filter tabs.
        </p>
      </div>

      <TextAreaField
        labelName="Description"
        placeholderText="Optional, e.g. Tips and routines for healthy hair"
        name="description"
        control={control}
        trigger={trigger}
        rowNo={3}
      />

      {/* Promoting a new default demotes the current one server-side, so
          there is always exactly one fallback type. */}
      <div className="rounded-xl border border-greenPrimary-100 bg-greenPrimary-950/40 p-3 sm:p-4">
        <CheckboxField
          name="isDefault"
          label="Make this the default type"
          description="New posts with no type selected are filed under the default."
          control={control}
          setValue={setValue}
          getValues={getValues}
        />
      </div>
    </CategoryFormDialog>
  );
}
