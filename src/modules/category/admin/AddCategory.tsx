import { usePost } from "@/hooks/api/usePost";
import {
  CategoryFormData,
  categorySchema,
} from "@/modules/category/schemas/category.schema";
import { IModal, CategoryCreateResponse } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useMemo, useRef } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { TOP_LEVEL_PARENT } from "@/modules/category/hooks/useCategory";
import useRootCategory from "@/modules/category/hooks/useRootCategory";
import { categoryErrorField } from "@/modules/category/utils/category.utils";
import CategoryFormDialog from "./CategoryFormDialog";
import CategoryFormFields from "./CategoryFormFields";

export default function AddCategory({ setOpen, refetch }: IModal) {
  const nameRef = useRef<HTMLInputElement>(null);
  const { control, trigger, handleSubmit, setError } =
    useForm<CategoryFormData>({
      resolver: zodResolver(categorySchema),
      defaultValues: {
        categoryName: "",
        categoryParentId: TOP_LEVEL_PARENT,
        description: "",
      },
    });

  const { rootCategories, rootCategoryLoading } = useRootCategory();

  const parentOptions = useMemo(
    () => [
      { id: TOP_LEVEL_PARENT, name: "None (top level)" },
      ...rootCategories,
    ],
    [rootCategories],
  );

  const { mutate: addCategory, isPending } = usePost(
    "/categories",
    (data: CategoryCreateResponse) => {
      if (data.statusCode >= 200 && data.statusCode < 300) {
        setOpen?.(false);
        refetch?.();
        return;
      }
      // Show conflicts ("name already exists") under the field as well
      const field = categoryErrorField(data.message);
      if (field) {
        setError(field, { message: data.message });
        if (field === "categoryName") nameRef.current?.focus();
      }
    },
  );

  const onSubmit: SubmitHandler<CategoryFormData> = (data) => {
    // The server builds the slug from the name and gives every other field
    // its default (status starts as ACTIVE).
    addCategory({
      name: data.categoryName,
      parentId:
        data.categoryParentId && data.categoryParentId !== TOP_LEVEL_PARENT
          ? Number(data.categoryParentId)
          : null,
      ...(data.description ? { description: data.description } : {}),
    });
  };

  return (
    <CategoryFormDialog
      title="Add category"
      description="New categories are active and visible in the shop right away."
      submitLabel="Add category"
      pendingLabel="Adding…"
      isPending={isPending}
      onSubmit={handleSubmit(onSubmit)}
      onClose={() => setOpen?.(false)}
    >
      <CategoryFormFields
        control={control}
        trigger={trigger}
        nameRef={nameRef}
        parent={{
          editable: true,
          options: parentOptions,
          loading: rootCategoryLoading,
        }}
      />
    </CategoryFormDialog>
  );
}
