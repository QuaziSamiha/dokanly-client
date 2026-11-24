"use client";

import ModalHeader from "@/components/primitives/modal/ModalHeader";
import { Newspaper } from "lucide-react";

import InputField from "@/components/form/InputField";
import SingleMediaInput from "@/components/form/file-upload/SingleMediaInput";
import SingleSelectSearch from "@/components/form/SingleSelectSearch";
import { TextEditor } from "@/components/form/TextEditor";
import { homeContentStatus } from "@/modules/home/constants/home-admin.constants";
import { useFormPatch } from "@/hooks/api/useFormPatch";
import {
  ProductArticleFormData,
  productArticleSchema,
} from "@/modules/home/schemas/product-article.schema";
import { IModal } from "@/types";
import { IHomeContent } from "@/modules/home/types/home-content.types";
import React, { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  AuditMeta,
  FormActions,
  FormDivider,
  FormSection,
  HOME_FORM_WRAPPER,
  InactiveLockNotice,
  LockableFieldset,
  inactiveAwareResolver,
} from "../home-form.parts";

const resolver = inactiveAwareResolver<ProductArticleFormData>(productArticleSchema);

export default function EditProductArticle({
  setOpen,
  refetch,
  data,
  isLoading,
}: IModal) {
  const rowData = data as IHomeContent;
  const methods = useForm<ProductArticleFormData>({
    resolver,
    defaultValues: {
      title: rowData?.title ?? "",
      description: rowData?.description ?? "",
      media: rowData?.image,
      status: rowData?.status,
      order: rowData?.sortOrder ?? undefined,
    },
  });

  const {
    control,
    trigger,
    handleSubmit,
    resetField,
    formState: { dirtyFields, isDirty },
  } = methods;

  // * ============ INACTIVE LOCK ==============
  // * Switching to Inactive discards unsaved edits to the other fields.
  const status = useWatch({ control, name: "status" });
  const isInactive = status === "INACTIVE";
  useEffect(() => {
    if (isInactive) {
      resetField("title");
      resetField("description");
      resetField("order");
      resetField("media");
    }
  }, [isInactive, resetField]);

  const { mutate: updateArticle, isPending } = useFormPatch<IHomeContent>(
    (data) => {
      if (data.statusCode >= 200 && data.statusCode < 300) {
        setOpen?.(false);
        refetch?.();
      }
    },
    (error) => {
      console.error("Update failed:", error);
    },
  );

  const onSubmit = (data: ProductArticleFormData) => {
    if (!isDirty) {
      toast.info("No changes detected!");
      setOpen?.(false);
      return;
    }

    // * Only changed fields are sent; while inactive, only the status.
    const formData = new FormData();
    formData.append("type", rowData?.type);
    if (dirtyFields.status && data.status) {
      formData.append("status", data.status);
    }
    if (!isInactive) {
      if (dirtyFields.title) {
        formData.append("title", data.title);
      }
      if (dirtyFields.description) {
        formData.append("description", data.description);
      }
      if (dirtyFields.order && data.order !== undefined) {
        formData.append("sortOrder", data.order.toString());
      }
      if (dirtyFields.media && data.media instanceof File) {
        formData.append("imageFile", data.media);
      }
    }

    updateArticle({
      endpoint: `/home-content/update/${rowData.id}`,
      data: formData,
    });
  };

  return (
    <section className={HOME_FORM_WRAPPER}>
      <ModalHeader
        icon={Newspaper}
        eyebrow="Product Articles"
        title="Edit Product Article"
        description="Update the text, image, position or visibility of this article."
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-start gap-6"
      >
        {/* ============ VISIBILITY ============ */}
        {/* First, because it decides whether the rest can be edited. */}
        <FormSection
          title="Visibility"
          description="Only active articles appear on the home page (up to 3)."
        >
          <div className="grid w-full gap-4 sm:grid-cols-2">
            <SingleSelectSearch
              labelName="Status"
              name="status"
              control={control}
              options={homeContentStatus}
              isLoading={isLoading}
            />
          </div>
          {isInactive && (
            <InactiveLockNotice
              item="article"
              fields="text, position and image"
            />
          )}
        </FormSection>

        <LockableFieldset locked={isInactive}>
          <FormDivider />

          {/* ============ CONTENT ============ */}
          <FormSection
            title="Content"
            description="The heading and story customers read on the home page."
          >
            <InputField
              labelName="Title"
              name="title"
              placeholderText="e.g. Onion Hair Oil for stronger roots"
              control={control}
              trigger={trigger}
              isRequired={!isInactive}
              isLoading={isLoading}
            />
            <TextEditor
              labelName="Description"
              placeholderText="Tell the product's story in a few short lines..."
              name="description"
              control={control}
              trigger={trigger}
              isRequired={!isInactive}
              isLoading={isLoading}
            />
          </FormSection>

          <FormDivider />

          {/* ============ POSITION ============ */}
          <FormSection
            title="Position"
            description="Its place among the articles: 1 comes first, and the others shift to make room."
          >
            <div className="grid w-full gap-4 sm:grid-cols-2">
              <InputField
                labelName="Position"
                name="order"
                inputType="number"
                placeholderText="e.g. 1"
                control={control}
                trigger={trigger}
                isLoading={isLoading}
              />
            </div>
          </FormSection>

          <FormDivider />

          {/* ============ IMAGE (LAST) ============ */}
          <FormSection
            title="Image"
            description="Shown beside the article. JPEG, PNG or WebP, up to 5 MB. Uploading a new image replaces the current one."
          >
            <SingleMediaInput
              name="media"
              label="Article image"
              control={control}
              maxFileSize={5 * 1024 * 1024} // 5MB
              acceptedFileTypes={["image/*"]} // Only images
              isRequired={!isInactive}
            />
          </FormSection>
        </LockableFieldset>

        <AuditMeta item={rowData} />

        {/* ============ ACTIONS (PINNED) ============ */}
        <FormActions
          onCancel={() => setOpen?.(false)}
          submitTitle="Save changes"
          isPending={isPending}
        />
      </form>
    </section>
  );
}
