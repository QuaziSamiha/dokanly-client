"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Lock, Star } from "lucide-react";
import { toast } from "sonner";
import InputField from "@/components/form/InputField";
import SingleSelectSearch from "@/components/form/SingleSelectSearch";
import TextAreaField from "@/components/form/TextAreaField";
import { useConfirm } from "@/hooks/useConfirm";
import CategoryFormDialog from "@/modules/category/admin/CategoryFormDialog";
import { IModal } from "@/types";
import { BLOG_TYPE_STATUS_OPTIONS } from "../constants/blog.constants";
import {
  useSetDefaultBlogType,
  useUpdateBlogType,
} from "../hooks/useBlogType";
import {
  UpdateBlogTypeSchema,
  UpdateBlogTypeType,
} from "../schemas/blog.schema";
import { IBlogType } from "../types/blog.types";

export default function EditBlogType({ setOpen, refetch, data }: IModal) {
  const rowData = data as IBlogType | undefined;

  const {
    control,
    trigger,
    handleSubmit,
    formState: { isDirty, dirtyFields },
  } = useForm({
    resolver: zodResolver(UpdateBlogTypeSchema),
    defaultValues: {
      name: rowData?.name ?? "",
      description: rowData?.description ?? "",
      status: rowData?.status ?? "ACTIVE",
      sortOrder: rowData?.sortOrder ?? null,
    },
  });

  const { updateBlogType, isUpdatingType } = useUpdateBlogType(() => {
    setOpen?.(false);
    refetch?.();
  });

  const { setDefaultBlogType, isSettingDefault } = useSetDefaultBlogType(() => {
    setOpen?.(false);
    refetch?.();
  });

  /**
   * Promotion is its own endpoint, not a form field: the API demotes the
   * previous default in the same transaction, so it cannot be folded into a
   * partial update alongside the other edits.
   */
  const { confirm } = useConfirm();

  const handleSetDefault = async () => {
    if (!rowData?.id) return;

    if (
      await confirm({
        title: `Make "${rowData.name}" the default type?`,
        description:
          "Posts created without a type will be filed under it, and the current default will be demoted.",
        confirmLabel: "Make default",
        variant: "info",
      })
    ) {
      setDefaultBlogType(rowData.id);
    }
  };

  const onSubmit = (formValues: UpdateBlogTypeType) => {
    if (!isDirty) {
      toast.info("No changes detected!");
      setOpen?.(false);
      return;
    }

    if (!rowData?.id) return;

    const payload: Record<string, unknown> = {};

    if (dirtyFields.name) payload.name = formValues.name;
    if (dirtyFields.description) payload.description = formValues.description;
    if (dirtyFields.status) payload.status = formValues.status;
    // `typeof` rather than truthiness so a tab order of 0 still gets sent.
    if (dirtyFields.sortOrder && typeof formValues.sortOrder === "number") {
      payload.sortOrder = formValues.sortOrder;
    }

    updateBlogType(rowData.id, payload);
  };

  return (
    <CategoryFormDialog
      title="Edit blog type"
      description={
        rowData?.name
          ? `Changes to "${rowData.name}" apply to its filter tab on the blog page.`
          : "Changes apply to its filter tab on the blog page."
      }
      submitLabel="Save changes"
      pendingLabel="Saving…"
      isPending={isUpdatingType}
      onSubmit={handleSubmit(onSubmit)}
      onClose={() => setOpen?.(false)}
    >
      {/* The API freezes the identity of a seeded type, so say why the name is
          locked rather than letting the save fail. */}
      {(rowData?.isSystem || rowData?.isDefault) && (
        <div className="flex flex-col gap-2">
          {rowData?.isSystem && (
            <p className="flex items-start gap-2.5 rounded-lg border border-neutralPrimary-200 bg-neutralPrimary-50 px-3 py-2.5 text-xs text-neutralPrimary-600 sm:text-sm">
              <Lock size={16} className="mt-0.5 shrink-0 text-neutralPrimary-400" />
              This is a system type, so its name cannot be changed.
            </p>
          )}
          {rowData?.isDefault && (
            <p className="flex items-start gap-2.5 rounded-lg border border-greenPrimary-100 bg-greenPrimary-950/40 px-3 py-2.5 text-xs text-neutralPrimary-600 sm:text-sm">
              <Star
                size={16}
                className="mt-0.5 shrink-0 fill-greenPrimary-500 text-greenPrimary-500"
              />
              This is the default type, so it must stay Active. To move the
              default, open another type and promote it there.
            </p>
          )}
        </div>
      )}

      <InputField
        labelName="Name"
        placeholderText="e.g. Hair Care"
        name="name"
        control={control}
        trigger={trigger}
        disabled={rowData?.isSystem}
        isRequired
      />

      <div className="flex flex-col gap-2">
        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
          <SingleSelectSearch
            labelName="Status"
            name="status"
            control={control}
            options={BLOG_TYPE_STATUS_OPTIONS}
            isDisabled={rowData?.isDefault}
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

      {/* ============ DEFAULT TYPE ============ */}
      {/* `type="button"` keeps this out of the form submit — promoting is its
          own request, separate from saving the field edits above. */}
      {!rowData?.isDefault && (
        <div className="flex flex-col gap-3 rounded-xl border border-neutralPrimary-200 bg-neutralPrimary-50/60 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4">
          <div className="flex min-w-0 items-start gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-greenPrimary-950 text-greenPrimary-600">
              <Star size={15} />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="text-sm font-semibold text-neutralPrimary-800">
                Default type
              </p>
              <p className="text-xs text-neutralPrimary-500">
                Posts created without a type are filed under the default.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSetDefault}
            disabled={isSettingDefault}
            className="h-10 w-full shrink-0 cursor-pointer rounded-lg bg-blueSecondary-100 px-4 text-sm font-semibold text-blueSecondary-600 transition-colors hover:bg-blueSecondary-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isSettingDefault ? "Setting…" : "Make default"}
          </button>
        </div>
      )}
    </CategoryFormDialog>
  );
}
