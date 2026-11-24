"use client";

import ModalHeader from "@/components/primitives/modal/ModalHeader";
import { Megaphone } from "lucide-react";

import InputField from "@/components/form/InputField";
import SingleSelectSearch from "@/components/form/SingleSelectSearch";
import { homeContentStatus } from "@/modules/home/constants/home-admin.constants";
import { useFormPatch } from "@/hooks/api/useFormPatch";
import {
  TopTitleFormData,
  topTitleSchema,
} from "@/modules/home/schemas/top-title.schema";
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

const resolver = inactiveAwareResolver<TopTitleFormData>(topTitleSchema);

export default function EditTopTitle({
  setOpen,
  refetch,
  data,
  isLoading,
}: IModal) {
  const rowData = data as IHomeContent;
  const methods = useForm<TopTitleFormData>({
    resolver,
    defaultValues: {
      title: rowData?.title ?? "",
      status: rowData?.status ?? "ACTIVE",
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
  // * Switching to Inactive discards an unsaved edit to the text.
  const status = useWatch({ control, name: "status" });
  const isInactive = status === "INACTIVE";
  useEffect(() => {
    if (isInactive) resetField("title");
  }, [isInactive, resetField]);

  const { mutate: updateTopTitle, isPending } = useFormPatch<IHomeContent>(
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

  const onSubmit = (data: TopTitleFormData) => {
    if (!isDirty) {
      toast.info("No changes detected!");
      setOpen?.(false);
      return;
    }

    // * Only changed fields are sent; while inactive, only the status.
    const formData = new FormData();
    formData.append("type", rowData?.type);
    if (dirtyFields.status) {
      formData.append("status", data.status);
    }
    if (!isInactive && dirtyFields.title) {
      formData.append("title", data.title);
    }

    updateTopTitle({
      endpoint: `/home-content/update/${rowData.id}`,
      data: formData,
    });
  };

  return (
    <section className={HOME_FORM_WRAPPER}>
      <ModalHeader
        icon={Megaphone}
        eyebrow="Top Title"
        title="Edit Top Title"
        description="The announcement text shown at the very top of every storefront page."
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-start gap-6"
      >
        {/* ============ VISIBILITY ============ */}
        <FormSection
          title="Visibility"
          description="When inactive, the announcement bar is hidden on the storefront."
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
          {isInactive && <InactiveLockNotice item="announcement" fields="text" />}
        </FormSection>

        <LockableFieldset locked={isInactive}>
          <FormDivider />

          {/* ============ TEXT ============ */}
          <FormSection
            title="Announcement"
            description="One short line customers read first, e.g. a delivery offer. Up to 255 characters."
          >
            <InputField
              labelName="Text"
              name="title"
              placeholderText="e.g. Free delivery on orders over 1500 BDT"
              control={control}
              trigger={trigger}
              isRequired={!isInactive}
              isLoading={isLoading}
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
