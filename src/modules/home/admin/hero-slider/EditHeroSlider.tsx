"use client";

import ModalHeader from "@/components/primitives/modal/ModalHeader";
import { GalleryHorizontalEnd } from "lucide-react";

import InputField from "@/components/form/InputField";
import SingleMediaInput from "@/components/form/file-upload/SingleMediaInput";
import SingleSelectSearch from "@/components/form/SingleSelectSearch";
import { homeContentStatus } from "@/modules/home/constants/home-admin.constants";
import { useFormPatch } from "@/hooks/api/useFormPatch";
import {
  HeroSliderFormData,
  heroSliderSchema,
} from "@/modules/home/schemas/hero-slider.schema";
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

const resolver = inactiveAwareResolver<HeroSliderFormData>(heroSliderSchema);

export default function EditHeroSlider({
  data,
  isLoading,
  setOpen,
  refetch,
}: IModal) {
  const rowData = data as IHomeContent;

  const {
    control,
    trigger,
    handleSubmit,
    resetField,
    formState: { isDirty, dirtyFields },
  } = useForm<HeroSliderFormData>({
    resolver,
    defaultValues: {
      media: rowData?.image,
      status: rowData?.status,
      order: rowData?.sortOrder ?? undefined,
      redirectUrl: rowData?.redirectUrl ?? "",
    },
  });

  // * ============ INACTIVE LOCK ==============
  // * Switching to Inactive discards unsaved edits to the other fields.
  const status = useWatch({ control, name: "status" });
  const isInactive = status === "INACTIVE";
  useEffect(() => {
    if (isInactive) {
      resetField("redirectUrl");
      resetField("order");
      resetField("media");
    }
  }, [isInactive, resetField]);

  // ============= API HOOK ==============
  const { mutate: updateHero, isPending } = useFormPatch<IHomeContent>(
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

  const onSubmit = (data: HeroSliderFormData) => {
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
      // * An empty link is sent as "" so the server removes it.
      if (dirtyFields.redirectUrl) {
        formData.append("redirectUrl", data.redirectUrl ?? "");
      }
      if (dirtyFields.order && data.order !== undefined) {
        formData.append("sortOrder", data.order.toString());
      }
      if (dirtyFields.media && data.media instanceof File) {
        formData.append("imageFile", data.media);
      }
    }

    updateHero({
      endpoint: `/home-content/update/${rowData.id}`,
      data: formData,
    });
  };

  return (
    <section className={HOME_FORM_WRAPPER}>
      <ModalHeader
        icon={GalleryHorizontalEnd}
        eyebrow="Hero Slider"
        title="Edit Hero Slide"
        description="Change the link, position, image or visibility of this slide."
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-start gap-6"
      >
        {/* ============ VISIBILITY ============ */}
        {/* First, because it decides whether the rest can be edited. */}
        <FormSection
          title="Visibility"
          description="Only active slides rotate on the home page (up to 5)."
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
            <InactiveLockNotice item="slide" fields="link, position and image" />
          )}
        </FormSection>

        <LockableFieldset locked={isInactive}>
          <FormDivider />

          {/* ============ LINK & POSITION ============ */}
          <FormSection
            title="Link and position"
            description="Where a click on the slide leads (leave empty for none), and its place in the carousel: 1 shows first."
          >
            <div className="grid w-full gap-4 sm:grid-cols-[1fr_180px]">
              <InputField
                labelName="Link"
                name="redirectUrl"
                placeholderText="https://naturacarebd.com/shop"
                control={control}
                trigger={trigger}
                isLoading={isLoading}
              />
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
            title="Slide image"
            description="A wide banner works best (about 1920 × 600 px). JPEG, PNG or WebP, up to 5 MB. Uploading a new image replaces the current one."
          >
            <SingleMediaInput
              name="media"
              label="Banner"
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
