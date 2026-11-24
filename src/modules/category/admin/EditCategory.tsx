"use client";

import {
  EditCategoryFormData,
  editCategorySchema,
} from "@/modules/category/schemas/category.schema";
import { IModal } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useRef } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { ICategory } from "@/modules/category/types/category.types";
import { usePatch } from "@/hooks/api/usePatch";
import { categoryErrorField } from "@/modules/category/utils/category.utils";
import CategoryFormDialog from "./CategoryFormDialog";
import CategoryFormFields from "./CategoryFormFields";

export default function EditCategory({
  data,
  setOpen,
  refetch,
  isLoading,
}: IModal) {
  const rowData = data as ICategory;
  const nameRef = useRef<HTMLInputElement>(null);

  const {
    control,
    trigger,
    handleSubmit,
    setError,
    formState: { isDirty, dirtyFields },
  } = useForm<EditCategoryFormData>({
    resolver: zodResolver(editCategorySchema),
    defaultValues: {
      categoryName: rowData?.name ?? "",
      status: rowData?.status,
      description: rowData?.description ?? "",
    },
  });

  const { mutate: updateCategory, isPending } = usePatch<ICategory>((data) => {
    if (data.statusCode >= 200 && data.statusCode < 300) {
      setOpen?.(false);
      refetch?.();
      return;
    }
    // Show conflicts (name taken, status blocked by a subcategory) under the
    // field they belong to as well as in the toast
    const field = categoryErrorField(data.message);
    if (field) {
      setError(field, { message: data.message });
      if (field === "categoryName") nameRef.current?.focus();
    }
  });

  // The parent is fixed at creation; the server rejects parentId on PATCH.
  // Only changed fields are sent.
  const onSubmit: SubmitHandler<EditCategoryFormData> = (data) => {
    const categoryPayload: Record<string, unknown> = {};

    // Renaming also changes the slug, which the server rebuilds from the name.
    if (dirtyFields.categoryName) categoryPayload.name = data.categoryName;
    if (dirtyFields.status) categoryPayload.status = data.status;
    // An empty description is sent as "", which the server stores as null.
    if (dirtyFields.description)
      categoryPayload.description = data.description ?? "";

    if (Object.keys(categoryPayload).length === 0) {
      setOpen?.(false);
      return;
    }

    updateCategory({
      endpoint: `categories/${rowData.id}`,
      data: categoryPayload,
    });
  };

  return (
    <CategoryFormDialog
      title="Edit category"
      description={
        <>
          Update the name, status or description of{" "}
          <span className="font-medium text-neutralPrimary-700">
            {rowData?.name}
          </span>
          .
        </>
      }
      submitLabel="Save changes"
      pendingLabel="Saving…"
      isPending={isPending}
      submitDisabled={!isDirty}
      onSubmit={handleSubmit(onSubmit)}
      onClose={() => setOpen?.(false)}
    >
      <CategoryFormFields
        control={control}
        trigger={trigger}
        nameRef={nameRef}
        parent={{
          editable: false,
          name: rowData?.parent?.name ?? "None (top level)",
        }}
        showStatus
        currentSlug={rowData?.slug}
        childrenCount={rowData?.childrenCount ?? 0}
        productCount={rowData?.productCount ?? 0}
        inactiveParent={
          rowData?.parent?.status && rowData.parent.status !== "ACTIVE"
            ? rowData.parent.name
            : undefined
        }
        isLoading={isLoading}
      />
    </CategoryFormDialog>
  );
}
